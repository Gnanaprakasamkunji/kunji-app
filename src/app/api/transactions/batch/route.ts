import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const deleteBatchSchema = z.object({
    ids: z.array(z.string()),
});

/**
 * DELETE /api/transactions/batch
 * Deletes multiple transactions.
 */
export async function DELETE(request: Request): Promise<NextResponse> {
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
        const parsed = deleteBatchSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { ids } = parsed.data;

        if (!ids.length) {
            return NextResponse.json({ success: true, count: 0 }, { status: 200 });
        }

        const deleteResult = await db.transaction.deleteMany({
            where: {
                id: { in: ids },
                userId,
            },
        });

        return NextResponse.json({ success: true, count: deleteResult.count }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

const updateBatchSchema = z.object({
    ids: z.array(z.string()),
    status: z.enum(['pending', 'confirmed', 'flagged']),
});

/**
 * PATCH /api/transactions/batch
 * Updates multiple transactions (e.g., batch confirm).
 */
export async function PATCH(request: Request): Promise<NextResponse> {
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
        const parsed = updateBatchSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { ids, status } = parsed.data;

        if (!ids.length) {
            return NextResponse.json({ success: true, count: 0 }, { status: 200 });
        }

        const updateResult = await db.transaction.updateMany({
            where: {
                id: { in: ids },
                userId,
            },
            data: { status },
        });

        return NextResponse.json({ success: true, count: updateResult.count }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
