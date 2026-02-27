/**
 * Copyright (c) 2026 Kunji Finance.
 * All rights reserved.
 * This code is proprietary and confidential.
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { createSavingsGoalSchema } from '@/lib/validators';

/**
 * GET /api/savings
 * Returns all savings goals for the authenticated user.
 *
 * @returns JSON array of savings goals.
 */
export async function GET(): Promise<NextResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const userId = (session.user as { id?: string }).id;
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const goals = await db.savingsGoal.findMany({
            where: { userId },
            orderBy: { targetDate: 'asc' },
        });
        return NextResponse.json(goals);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

/**
 * POST /api/savings
 * Creates a new savings goal for the authenticated user.
 *
 * @param request - Incoming HTTP request with goal data.
 * @returns The created savings goal.
 */
export async function POST(request: Request): Promise<NextResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const userId = (session.user as { id?: string }).id;
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body: unknown = await request.json();
        const parsed = createSavingsGoalSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
        }

        const goal = await db.savingsGoal.create({
            data: {
                ...parsed.data,
                targetDate: new Date(parsed.data.targetDate),
                userId,
            },
        });
        return NextResponse.json(goal, { status: 201 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
