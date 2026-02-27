/**
 * Copyright (c) 2026 Kunji Finance.
 * All rights reserved.
 * This code is proprietary and confidential.
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { createTransactionSchema } from '@/lib/validators';

/**
 * GET /api/transactions
 * Returns transactions for the authenticated user.
 * Supports filters: category, type, search, startDate, endDate.
 *
 * @param request - Incoming HTTP request.
 * @returns JSON array of transactions.
 */
export async function GET(request: Request): Promise<NextResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = (session.user as { id?: string }).id;
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const type = searchParams.get('type');
        const search = searchParams.get('search');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const transactions = await db.transaction.findMany({
            where: {
                userId,
                ...(category && { category }),
                ...(type && { type }),
                ...(search && {
                    description: { contains: search },
                }),
                ...(startDate && endDate && {
                    date: {
                        gte: new Date(startDate),
                        lte: new Date(endDate),
                    },
                }),
            },
            include: { account: { select: { name: true } } },
            orderBy: { date: 'desc' },
            take: 200,
        });

        return NextResponse.json(transactions);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

/**
 * POST /api/transactions
 * Creates a new transaction for the authenticated user.
 *
 * @param request - Incoming HTTP request with transaction data.
 * @returns The created transaction or error response.
 */
export async function POST(request: Request): Promise<NextResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = (session.user as { id?: string }).id;
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body: unknown = await request.json();
        const parsed = createTransactionSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        // Verify the account belongs to this user
        const account = await db.financeAccount.findFirst({
            where: { id: parsed.data.accountId, userId },
        });
        if (!account) {
            return NextResponse.json({ error: 'Account not found' }, { status: 404 });
        }

        const transaction = await db.transaction.create({
            data: {
                ...parsed.data,
                date: new Date(parsed.data.date),
                userId,
            },
        });

        return NextResponse.json(transaction, { status: 201 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
