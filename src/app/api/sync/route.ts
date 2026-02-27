/**
 * Copyright (c) 2026 Kunji Finance.
 * All rights reserved.
 * This code is proprietary and confidential.
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { syncAccount, syncAllAccounts } from '@/lib/syncService';
import { z } from 'zod';

const syncRequestSchema = z.object({
    accountId: z.string().uuid().optional(),
});

/**
 * POST /api/sync
 * Triggers a sync for one account (by ID) or all connected accounts.
 *
 * @param request - Incoming HTTP request with optional accountId.
 * @returns JSON with sync results.
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
        const parsed = syncRequestSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        if (parsed.data.accountId) {
            // Sync single account
            const result = await syncAccount(parsed.data.accountId, userId);
            return NextResponse.json({ results: [result] }, { status: 200 });
        }

        // Sync all connected accounts
        const results = await syncAllAccounts(userId);
        return NextResponse.json({ results }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
