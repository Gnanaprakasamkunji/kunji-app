/**
 * Copyright (c) 2026 Kunji Finance.
 * All rights reserved.
 * This code is proprietary and confidential.
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { createBudgetSchema } from '@/lib/validators';

/**
 * GET /api/budgets
 * Returns budgets for the authenticated user, each with computed `spent`
 * derived from matching expense transactions this month.
 *
 * @returns JSON array of budgets with `spent` field.
 */
export async function GET(): Promise<NextResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const userId = (session.user as { id?: string }).id;
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        const budgets = await db.budget.findMany({ where: { userId }, orderBy: { category: 'asc' } });

        // Compute spent per category from transactions this month
        const transactions = await db.transaction.findMany({
            where: { userId, type: 'expense', date: { gte: startOfMonth, lte: endOfMonth } },
            select: { category: true, amount: true },
        });

        const spentByCategory: Record<string, number> = {};
        for (const t of transactions) {
            spentByCategory[t.category] = (spentByCategory[t.category] ?? 0) + t.amount;
        }

        const budgetsWithSpent = budgets.map((b) => ({
            ...b,
            spent: spentByCategory[b.category] ?? 0,
        }));

        return NextResponse.json(budgetsWithSpent);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

/**
 * POST /api/budgets
 * Creates or updates a budget for a category.
 *
 * @param request - Incoming HTTP request with budget data.
 * @returns The created/updated budget.
 */
export async function POST(request: Request): Promise<NextResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const userId = (session.user as { id?: string }).id;
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body: unknown = await request.json();
        const parsed = createBudgetSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
        }

        const budget = await db.budget.upsert({
            where: { userId_category: { userId, category: parsed.data.category } },
            update: parsed.data,
            create: { ...parsed.data, userId },
        });

        return NextResponse.json(budget, { status: 201 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
