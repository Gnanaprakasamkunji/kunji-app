/**
 * Copyright (c) 2026 Kunji Finance.
 * All rights reserved.
 * This code is proprietary and confidential.
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

/**
 * GET /api/dashboard
 * Returns aggregated financial summary for the authenticated user:
 * net worth, monthly income/expenses, savings rate, category breakdown,
 * and 6-month monthly trends.
 *
 * @returns JSON object with dashboard summary data.
 */
export async function GET(): Promise<NextResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const userId = (session.user as { id?: string }).id;
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Net worth = sum of all account balances
        const accounts = await db.financeAccount.findMany({ where: { userId } });
        const netWorth = accounts.reduce((sum, a) => sum + a.balance, 0);

        // Monthly transactions
        const monthlyTransactions = await db.transaction.findMany({
            where: { userId, date: { gte: startOfMonth } },
        });
        const monthlyIncome = monthlyTransactions
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        const monthlyExpenses = monthlyTransactions
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        const savingsRate = monthlyIncome > 0
            ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100
            : 0;

        // Spending by category
        const expensesByCategory: Record<string, { value: number; color: string }> = {};
        for (const t of monthlyTransactions) {
            if (t.type === 'expense') {
                if (!expensesByCategory[t.category]) {
                    expensesByCategory[t.category] = { value: 0, color: t.categoryColor };
                }
                expensesByCategory[t.category].value += t.amount;
            }
        }
        const spendingByCategory = Object.entries(expensesByCategory)
            .map(([name, { value, color }]) => ({ name, value, color }))
            .sort((a, b) => b.value - a.value);

        // 6-month trends
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        const allTransactions = await db.transaction.findMany({
            where: { userId, date: { gte: sixMonthsAgo } },
        });
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const trendsMap: Record<string, { income: number; expenses: number }> = {};
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${monthNames[d.getMonth()]}`;
            trendsMap[key] = { income: 0, expenses: 0 };
        }
        for (const t of allTransactions) {
            const key = monthNames[new Date(t.date).getMonth()];
            if (trendsMap[key]) {
                if (t.type === 'income') trendsMap[key].income += t.amount;
                if (t.type === 'expense') trendsMap[key].expenses += t.amount;
            }
        }
        const monthlyTrends = Object.entries(trendsMap).map(([month, data]) => ({
            month,
            ...data,
        }));

        // Recent 5 transactions
        const recentTransactions = await db.transaction.findMany({
            where: { userId },
            include: { account: { select: { name: true } } },
            orderBy: { date: 'desc' },
            take: 5,
        });

        return NextResponse.json({
            netWorth,
            monthlyIncome,
            monthlyExpenses,
            savingsRate: Math.max(0, savingsRate),
            spendingByCategory,
            monthlyTrends,
            recentTransactions,
            accountCount: accounts.length,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
