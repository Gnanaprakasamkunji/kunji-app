import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { createTransactionSchema } from '@/lib/validators';

interface Context {
    params: Promise<{
        id: string;
    }>;
}

/**
 * PUT /api/transactions/[id]
 * Updates a specific transaction.
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

        const { id: transactionId } = await context.params;
        const transaction = await db.transaction.findFirst({
            where: { id: transactionId, userId },
        });

        if (!transaction) {
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
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

        const updatedTransaction = await db.transaction.update({
            where: { id: transactionId },
            data: {
                ...parsed.data,
                date: new Date(parsed.data.date),
            },
        });

        return NextResponse.json(updatedTransaction, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

/**
 * PATCH /api/transactions/[id]
 * Partially updates a specific transaction (e.g., status change).
 */
export async function PATCH(request: Request, context: Context): Promise<NextResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = (session.user as { id?: string }).id;
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: transactionId } = await context.params;
        const transaction = await db.transaction.findFirst({
            where: { id: transactionId, userId },
        });

        if (!transaction) {
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
        }

        const body: unknown = await request.json();
        const { updateTransactionSchema } = await import('@/lib/validators');
        const parsed = updateTransactionSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const data: any = { ...parsed.data };
        if (data.date) {
            data.date = new Date(data.date);
        }

        const updatedTransaction = await db.transaction.update({
            where: { id: transactionId },
            data,
        });

        return NextResponse.json(updatedTransaction, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

/**
 * DELETE /api/transactions/[id]
 * Deletes a specific transaction.
 */
export async function DELETE(request: Request, context: Context): Promise<NextResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = (session.user as { id?: string }).id;
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: transactionId } = await context.params;
        const transaction = await db.transaction.findFirst({
            where: { id: transactionId, userId },
        });

        if (!transaction) {
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
        }

        await db.transaction.delete({
            where: { id: transactionId },
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
