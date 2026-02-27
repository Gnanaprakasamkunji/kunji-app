/**
 * Copyright (c) 2026 Kunji Finance.
 * All rights reserved.
 * This code is proprietary and confidential.
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { generateId } from '@/lib/utils';
import { z } from 'zod';

const scanSchema = z.object({
    connectionId: z.string().uuid(),
});

/**
 * POST /api/email-sync/scan
 * Triggers the AI scanning process for a specific connected email.
 * Simulates extraction of financial transactions (income/expense) and deduplication.
 */
export async function POST(request: Request): Promise<NextResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const userId = (session.user as { id?: string }).id;
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body: unknown = await request.json();
        const parsed = scanSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 });
        }

        const { connectionId } = parsed.data;

        // Verify connection ownership
        const connection = await db.connectedEmail.findFirst({
            where: { id: connectionId, userId }
        });

        if (!connection) {
            return NextResponse.json({ error: 'Email connection not found.' }, { status: 404 });
        }

        // 1. Set status to syncing
        await db.connectedEmail.update({
            where: { id: connectionId },
            data: { syncStatus: 'syncing' }
        });

        // 2. Find a default account to attach transactions to.
        // If the user has a checking/savings account, pick the first one. Otherwise, we'll need to create one.
        let account = await db.financeAccount.findFirst({
            where: { userId },
            orderBy: { createdAt: 'asc' }
        });

        if (!account) {
            // Unlikely to hit this step since the seed script makes accounts, but just in case
            account = await db.financeAccount.create({
                data: {
                    userId,
                    name: 'Email Synced Account',
                    type: 'checking',
                    institution: 'Kunji Auto',
                }
            });
        }

        // 3. Simulate AI Extraction (Mocking 3 realistic transactions)
        // We ensure `externalId` is pseudo-random but repeatable if we wanted to test deduplication heavily.
        // To make it fun and show duplicates working, we'll intentionally always try to insert 
        // a specific "Spotify Subscription" with a fixed externalId for the month.

        const now = new Date();
        const currentMonthId = `${now.getFullYear()}-${now.getMonth()}`;

        const mockExtractedTransactions = [
            {
                amount: 350,
                type: 'expense',
                category: 'Transport',
                categoryColor: '#f1c21b',
                description: 'Uber Ride - Receipt from Email',
                date: new Date(),
                externalId: `uber-${generateId()}`,
                source: 'sync',
                notes: `Extracted from email: ${connection.email}`,
            },
            {
                amount: 119,
                type: 'expense',
                category: 'Subscriptions',
                categoryColor: '#a56eff',
                description: 'Spotify Premium - Email Receipt',
                date: new Date(),
                externalId: `spotify-${currentMonthId}`,
                source: 'sync',
                notes: `Extracted from email: ${connection.email}`,
            },
            {
                amount: 12000,
                type: 'income',
                category: 'Freelance',
                categoryColor: '#42be65',
                description: 'Upwork Transfer - Email Confirmation',
                date: new Date(),
                externalId: `upwork-${generateId()}`,
                source: 'sync',
                notes: `Extracted from email: ${connection.email}`,
            }
        ];

        let addedCount = 0;
        let dupCount = 0;

        // 4. Deduplication loop
        for (const tx of mockExtractedTransactions) {
            const exists = await db.transaction.findUnique({
                where: { externalId: tx.externalId }
            });

            if (exists) {
                dupCount++;
            } else {
                await db.transaction.create({
                    data: {
                        userId,
                        accountId: account.id,
                        amount: tx.amount,
                        type: tx.type,
                        category: tx.category,
                        categoryColor: tx.categoryColor,
                        description: tx.description,
                        date: tx.date,
                        externalId: tx.externalId,
                        source: tx.source,
                        status: 'pending',
                        notes: tx.notes,
                    }
                });

                // Adjust account balance
                const balanceAdjustment = tx.type === 'expense' ? -tx.amount : tx.amount;
                await db.financeAccount.update({
                    where: { id: account.id },
                    data: { balance: { increment: balanceAdjustment } }
                });

                addedCount++;
            }
        }

        // 5. Update connection status
        await db.connectedEmail.update({
            where: { id: connectionId },
            data: {
                syncStatus: 'success',
                lastSyncAt: new Date(),
            }
        });

        // 6. Log the sync
        await db.syncLog.create({
            data: {
                userId,
                accountId: account.id,
                status: 'completed',
                newCount: addedCount,
                dupCount,
            }
        });

        return NextResponse.json({
            message: `Sync complete. Found ${mockExtractedTransactions.length} emails. added ${addedCount} new transactions. Skipped ${dupCount} duplicates.`
        });

    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal server error';

        // Ensure status resets on error
        const body: any = await request.clone().json().catch(() => ({}));
        if (body?.connectionId) {
            await db.connectedEmail.updateMany({
                where: { id: body.connectionId },
                data: { syncStatus: 'error' }
            }).catch(() => null);
        }

        return NextResponse.json({ error: message }, { status: 500 });
    }
}
