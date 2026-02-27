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

interface Context {
    params: Promise<{
        id: string;
    }>;
}

/**
 * PUT /api/accounts/[id]
 * Updates a specific account for the authenticated user.
 *
 * @param request - Incoming HTTP request with account data.
 * @param context - Route context containing params.
 * @returns The updated account or error response.
 */
export async function PUT(request: Request, context: Context): Promise<NextResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = (session.user as { id?: string }).id;
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: accountId } = await context.params;

        const existing = await db.financeAccount.findFirst({
            where: { id: accountId, userId },
        });
        if (!existing) {
            return NextResponse.json({ error: 'Account not found' }, { status: 404 });
        }

        const body: unknown = await request.json();
        const parsed = createAccountSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const updated = await db.financeAccount.update({
            where: { id: accountId },
            data: parsed.data,
        });

        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

/**
 * DELETE /api/accounts/[id]
 * Deletes a specific account for the authenticated user.
 *
 * @param _request - Incoming HTTP request (unused).
 * @param context - Route context containing params.
 * @returns Success or error response.
 */
export async function DELETE(_request: Request, context: Context): Promise<NextResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = (session.user as { id?: string }).id;
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: accountId } = await context.params;

        const existing = await db.financeAccount.findFirst({
            where: { id: accountId, userId },
        });
        if (!existing) {
            return NextResponse.json({ error: 'Account not found' }, { status: 404 });
        }

        await db.financeAccount.delete({
            where: { id: accountId },
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
