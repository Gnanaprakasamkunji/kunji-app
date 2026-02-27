/**
 * Copyright (c) 2026 Kunji Finance.
 * All rights reserved.
 * This code is proprietary and confidential.
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { updateBudgetSchema } from '@/lib/validators';

/**
 * PUT /api/budgets/[id]
 * Updates an existing budget.
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

        const body: unknown = await request.json();
        const parsed = updateBudgetSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 });
        }

        const { id } = await params;

        // Verify ownership
        const existing = await db.budget.findFirst({
            where: { id, userId }
        });

        if (!existing) {
            return NextResponse.json({ error: 'Budget not found.' }, { status: 404 });
        }

        const updated = await db.budget.update({
            where: { id },
            data: parsed.data,
        });

        return NextResponse.json(updated);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

/**
 * DELETE /api/budgets/[id]
 * Deletes a budget.
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
        const existing = await db.budget.findFirst({
            where: { id, userId }
        });

        if (!existing) {
            return NextResponse.json({ error: 'Budget not found.' }, { status: 404 });
        }

        await db.budget.delete({
            where: { id }
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
