/**
 * Copyright (c) 2026 Kunji Finance.
 * All rights reserved.
 * This code is proprietary and confidential.
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { createAccountSchema } from '@/lib/validators';

/**
 * GET /api/accounts
 * Returns all financial accounts for the authenticated user.
 *
 * @returns JSON array of accounts or error response.
 */
export async function GET(): Promise<NextResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = (session.user as { id?: string }).id;
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const accounts = await db.financeAccount.findMany({
            where: { userId },
            orderBy: { createdAt: 'asc' },
        });

        return NextResponse.json(accounts);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

/**
 * POST /api/accounts
 * Creates a new financial account for the authenticated user.
 *
 * @param request - Incoming HTTP request with account data.
 * @returns The created account or error response.
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
        const parsed = createAccountSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const account = await db.financeAccount.create({
            data: { ...parsed.data, userId },
        });

        return NextResponse.json(account, { status: 201 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
