/**
 * Copyright (c) 2026 Kunji Finance.
 * All rights reserved.
 * This code is proprietary and confidential.
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { generateInsights } from '@/lib/insights';

/**
 * GET /api/insights
 * Generates and returns AI-powered financial insights for the authenticated user.
 * Up to 5 rule-based insights derived from spending patterns, budgets, goals, and investments.
 *
 * @returns JSON array of insights.
 */
export async function GET(): Promise<NextResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const userId = (session.user as { id?: string }).id;
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Fetch all necessary data for insights engine
        const [transactions, budgets, savingsGoals, investments] = await Promise.all([
            db.transaction.findMany({
                where: { userId },
                orderBy: { date: 'desc' },
                take: 100,
            }),
            db.budget.findMany({ where: { userId } }),
            db.savingsGoal.findMany({ where: { userId } }),
            db.investment.findMany({ where: { userId } }),
        ]);

        const generated = generateInsights(transactions, budgets, savingsGoals, investments);

        // Upsert insights into DB (clear old unread, add new)
        if (generated.length > 0) {
            await db.insight.deleteMany({ where: { userId, isRead: false } });
            await db.insight.createMany({
                data: generated.map((ins) => ({ ...ins, userId })),
            });
        }

        const insights = await db.insight.findMany({
            where: { userId },
            orderBy: { generatedAt: 'desc' },
            take: 5,
        });

        return NextResponse.json(insights);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

/**
 * PATCH /api/insights
 * Marks an insight as read.
 *
 * @param request - Incoming HTTP request with `{ id: string }`.
 * @returns Updated insight.
 */
export async function PATCH(request: Request): Promise<NextResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const userId = (session.user as { id?: string }).id;
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json() as { id?: string };
        if (!body.id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

        const insight = await db.insight.updateMany({
            where: { id: body.id, userId },
            data: { isRead: true },
        });

        return NextResponse.json(insight);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
