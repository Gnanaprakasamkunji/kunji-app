/**
 * Copyright (c) 2026 Kunji Finance.
 * All rights reserved.
 * This code is proprietary and confidential.
 */

import { db } from '@/lib/db';
import { SimulatedSyncProvider } from '@/lib/syncProvider';
import type { ExternalTransaction } from '@/lib/syncProvider';

/**
 * Result of syncing a single account.
 */
export interface SyncResult {
    /** The account ID that was synced. */
    accountId: string;
    /** The account name. */
    accountName: string;
    /** Number of new transactions imported. */
    newCount: number;
    /** Number of duplicate transactions skipped. */
    dupCount: number;
    /** Sync status: completed or failed. */
    status: 'completed' | 'failed';
    /** Error message if sync failed. */
    errorMsg?: string;
}

// Use the simulated provider; swap with a real one in production
const provider = new SimulatedSyncProvider();

/**
 * Generates a fallback deduplication hash from transaction fields.
 * Used when no externalId is available.
 *
 * @param txn - The external transaction.
 * @param accountId - The internal account ID.
 * @returns A hash string for dedup.
 */
function dedupHash(txn: ExternalTransaction, accountId: string): string {
    const dateStr = new Date(txn.date).toISOString().slice(0, 10);
    return `dedup-${accountId}-${dateStr}-${txn.amount}-${txn.description}`;
}

/**
 * Syncs transactions for a single account.
 * Fetches external transactions, deduplicates, and inserts new ones.
 *
 * @param accountId - The internal account ID to sync.
 * @param userId - The authenticated user's ID.
 * @returns SyncResult with counts of new and duplicate transactions.
 */
export async function syncAccount(accountId: string, userId: string): Promise<SyncResult> {
    // Fetch the account
    const account = await db.financeAccount.findFirst({
        where: { id: accountId, userId },
    });

    if (!account) {
        return {
            accountId,
            accountName: 'Unknown',
            newCount: 0,
            dupCount: 0,
            status: 'failed',
            errorMsg: 'Account not found',
        };
    }

    // Mark as syncing
    await db.financeAccount.update({
        where: { id: accountId },
        data: { syncStatus: 'syncing' },
    });

    // Create sync log entry
    const syncLog = await db.syncLog.create({
        data: {
            accountId,
            userId,
            status: 'started',
        },
    });

    try {
        // Determine the "since" date (last sync, or 30 days ago if first time)
        const since = account.lastSyncAt
            ? new Date(account.lastSyncAt)
            : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const externalRef = account.externalRef || account.id;
        const externalTxns = await provider.fetchTransactions(externalRef, since);

        let newCount = 0;
        let dupCount = 0;

        for (const txn of externalTxns) {
            const externalId = txn.externalId || dedupHash(txn, accountId);

            // Check if already exists by externalId
            const existing = await db.transaction.findUnique({
                where: { externalId },
            });

            if (existing) {
                dupCount++;
                continue;
            }

            // Fallback: check by amount + date + description within same account
            const dateStart = new Date(txn.date);
            dateStart.setHours(0, 0, 0, 0);
            const dateEnd = new Date(txn.date);
            dateEnd.setHours(23, 59, 59, 999);

            const fuzzyMatch = await db.transaction.findFirst({
                where: {
                    accountId,
                    userId,
                    amount: txn.amount,
                    description: txn.description,
                    date: { gte: dateStart, lte: dateEnd },
                },
            });

            if (fuzzyMatch) {
                dupCount++;
                continue;
            }

            // Insert new transaction
            await db.transaction.create({
                data: {
                    amount: txn.amount,
                    type: txn.type,
                    category: txn.category,
                    categoryColor: txn.categoryColor,
                    description: txn.description,
                    date: new Date(txn.date),
                    externalId,
                    source: 'sync',
                    status: 'pending',
                    userId,
                    accountId,
                },
            });
            newCount++;
        }

        // Mark sync as complete
        const now = new Date();
        await db.financeAccount.update({
            where: { id: accountId },
            data: {
                syncStatus: 'success',
                lastSyncAt: now,
                lastUpdated: now,
            },
        });

        await db.syncLog.update({
            where: { id: syncLog.id },
            data: {
                status: 'completed',
                newCount,
                dupCount,
                completedAt: now,
            },
        });

        return {
            accountId,
            accountName: account.name,
            newCount,
            dupCount,
            status: 'completed',
        };
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Sync failed';

        await db.financeAccount.update({
            where: { id: accountId },
            data: { syncStatus: 'error' },
        });

        await db.syncLog.update({
            where: { id: syncLog.id },
            data: {
                status: 'failed',
                errorMsg,
                completedAt: new Date(),
            },
        });

        return {
            accountId,
            accountName: account.name,
            newCount: 0,
            dupCount: 0,
            status: 'failed',
            errorMsg,
        };
    }
}

/**
 * Syncs all connected accounts for a user.
 *
 * @param userId - The authenticated user's ID.
 * @returns Array of SyncResult for each synced account.
 */
export async function syncAllAccounts(userId: string): Promise<SyncResult[]> {
    const accounts = await db.financeAccount.findMany({
        where: { userId, isConnected: true },
    });

    const results: SyncResult[] = [];
    for (const account of accounts) {
        const result = await syncAccount(account.id, userId);
        results.push(result);
    }

    return results;
}
