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
 * GET /api/sync/status
 * Returns the latest sync status for all user accounts.
 *
 * @returns JSON with accounts array containing sync status fields.
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
            select: {
                id: true,
                name: true,
                isConnected: true,
                syncStatus: true,
                lastSyncAt: true,
            },
            orderBy: { createdAt: 'asc' },
        });

        return NextResponse.json({ accounts }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
