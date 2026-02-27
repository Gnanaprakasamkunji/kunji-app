/**
 * Copyright (c) 2026 Kunji Finance.
 * All rights reserved.
 * This code is proprietary and confidential.
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { createInvestmentSchema } from '@/lib/validators';

/**
 * GET /api/investments/[id]
 * Returns a single investment holding for the authenticated user.
 *
 * @param _request - Incoming HTTP request.
 * @param context - Route parameters containing the investment id.
 * @returns The investment or an error.
 */
export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const userId = (session.user as { id?: string }).id;
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;

        const investment = await db.investment.findFirst({
            where: { id, userId },
        });

        if (!investment) {
            return NextResponse.json({ error: 'Investment not found' }, { status: 404 });
        }

        return NextResponse.json(investment);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

/**
 * PUT /api/investments/[id]
 * Updates an existing investment holding.
 *
 * @param request - Incoming HTTP request with updated data.
 * @param context - Route parameters containing the investment id.
 * @returns The updated investment or an error.
 */
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const userId = (session.user as { id?: string }).id;
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;

        // Verify ownership
        const existing = await db.investment.findFirst({ where: { id, userId } });
        if (!existing) {
            return NextResponse.json({ error: 'Investment not found' }, { status: 404 });
        }

        const body: unknown = await request.json();
        const parsed = createInvestmentSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
        }

        const updated = await db.investment.update({
            where: { id },
            data: {
                ...parsed.data,
                purchaseDate: new Date(parsed.data.purchaseDate),
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

/**
 * DELETE /api/investments/[id]
 * Deletes an investment holding.
 *
 * @param _request - Incoming HTTP request.
 * @param context - Route parameters containing the investment id.
 * @returns Success message or an error.
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
        const existing = await db.investment.findFirst({ where: { id, userId } });
        if (!existing) {
            return NextResponse.json({ error: 'Investment not found' }, { status: 404 });
        }

        await db.investment.delete({ where: { id } });

        return NextResponse.json({ message: 'Investment deleted successfully' });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
