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
 * DELETE /api/email-sync/[id]
 * Disconnects and removes an email account integration.
 */
export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const userId = (session.user as { id?: string }).id;
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;

        // Verify ownership
        const existing = await db.connectedEmail.findFirst({
            where: { id, userId }
        });

        if (!existing) {
            return NextResponse.json({ error: 'Connected email not found.' }, { status: 404 });
        }

        // Delete the connection
        await db.connectedEmail.delete({
            where: { id }
        });

        return NextResponse.json({ message: 'Email disconnected successfully.' });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
