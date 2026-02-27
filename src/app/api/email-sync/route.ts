/**
 * Copyright (c) 2026 Kunji Finance.
 * All rights reserved.
 * This code is proprietary and confidential.
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const mockConnectSchema = z.object({
    email: z.string().email('Invalid email address'),
    provider: z.enum(['google', 'outlook']),
});

/**
 * GET /api/email-sync
 * Fetch all connected email accounts for the user.
 */
export async function GET(): Promise<NextResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const userId = (session.user as { id?: string }).id;
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const emails = await db.connectedEmail.findMany({
            where: { userId },
            orderBy: { email: 'asc' },
        });

        // Ensure we never expose access/refresh tokens to the client
        const safeEmails = emails.map(e => ({
            id: e.id,
            email: e.email,
            provider: e.provider,
            isConnected: e.isConnected,
            lastSyncAt: e.lastSyncAt,
            syncStatus: e.syncStatus,
        }));

        return NextResponse.json(safeEmails);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

/**
 * POST /api/email-sync
 * Mock OAuth flow: Connects an email account for AI tracking.
 */
export async function POST(request: Request): Promise<NextResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const userId = (session.user as { id?: string }).id;
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body: unknown = await request.json();
        const parsed = mockConnectSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 });
        }

        const { email, provider } = parsed.data;

        // Check if already connected
        const existing = await db.connectedEmail.findUnique({
            where: { userId_email: { userId, email } }
        });

        if (existing) {
            return NextResponse.json({ error: 'This email is already connected.' }, { status: 409 });
        }

        // Create the connection (mocking tokens)
        const connectedEmail = await db.connectedEmail.create({
            data: {
                userId,
                email,
                provider,
                accessToken: 'mock_access_token_abc123',
                refreshToken: 'mock_refresh_token_xyz789',
                isConnected: true,
                syncStatus: 'idle',
            }
        });

        return NextResponse.json({
            id: connectedEmail.id,
            email: connectedEmail.email,
            provider: connectedEmail.provider,
            syncStatus: connectedEmail.syncStatus,
        }, { status: 201 });

    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
