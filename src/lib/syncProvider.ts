/**
 * Copyright (c) 2026 Kunji Finance.
 * All rights reserved.
 * This code is proprietary and confidential.
 */

/**
 * Represents a transaction fetched from an external provider.
 */
export interface ExternalTransaction {
    /** Unique external ID from the provider. */
    externalId: string;
    /** Transaction amount. */
    amount: number;
    /** Transaction type: income or expense. */
    type: 'income' | 'expense';
    /** Category label. */
    category: string;
    /** Category color hex. */
    categoryColor: string;
    /** Human-readable description. */
    description: string;
    /** ISO date string. */
    date: string;
}

/**
 * Interface for sync providers.
 * Implement this to connect to a real bank API (Plaid, Account Aggregator, etc.).
 */
export interface SyncProvider {
    /**
     * Fetches transactions from the external source.
     *
     * @param accountRef - External reference ID for the account.
     * @param since - Fetch transactions since this date.
     * @returns Array of external transactions.
     */
    fetchTransactions(accountRef: string, since: Date): Promise<ExternalTransaction[]>;
}

// ─── Simulated Provider (for development/demo) ───

const SIMULATED_CATEGORIES: Array<{
    name: string;
    color: string;
    type: 'income' | 'expense';
    descriptions: string[];
}> = [
        {
            name: 'Salary',
            color: '#42be65',
            type: 'income',
            descriptions: ['Monthly salary credit', 'Salary deposit', 'Payroll credit'],
        },
        {
            name: 'Freelance',
            color: '#a56eff',
            type: 'income',
            descriptions: ['Client project payment', 'Freelance invoice paid', 'Contract payment received'],
        },
        {
            name: 'Groceries',
            color: '#0f62fe',
            type: 'expense',
            descriptions: ['BigBasket order', 'DMart purchase', 'Zepto delivery', 'Blinkit groceries'],
        },
        {
            name: 'Dining',
            color: '#ff832b',
            type: 'expense',
            descriptions: ['Swiggy order', 'Zomato delivery', 'Restaurant bill', 'Cafe coffee day'],
        },
        {
            name: 'Transport',
            color: '#f1c21b',
            type: 'expense',
            descriptions: ['Uber ride', 'Ola cab', 'Metro recharge', 'Petrol fill-up'],
        },
        {
            name: 'Utilities',
            color: '#007d79',
            type: 'expense',
            descriptions: ['Electricity bill payment', 'Internet bill', 'Water bill', 'Gas bill payment'],
        },
        {
            name: 'Shopping',
            color: '#ee538b',
            type: 'expense',
            descriptions: ['Amazon order', 'Flipkart purchase', 'Myntra order', 'Retail store purchase'],
        },
        {
            name: 'Subscriptions',
            color: '#4589ff',
            type: 'expense',
            descriptions: ['Netflix subscription', 'Spotify premium', 'iCloud storage', 'YouTube premium'],
        },
    ];

/**
 * Generates a deterministic-ish hash string for simulated external IDs.
 *
 * @param seed - Seed string.
 * @returns A hex-like string.
 */
function simpleHash(seed: string): string {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        const char = seed.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * SimulatedSyncProvider generates realistic-looking transactions for demo purposes.
 * Replace this class with a real provider (Plaid, Yodlee, Account Aggregator) in production.
 */
export class SimulatedSyncProvider implements SyncProvider {
    /**
     * Generates simulated transactions for a given account reference since a date.
     *
     * @param accountRef - External reference ID for the account.
     * @param since - Fetch transactions since this date.
     * @returns Array of simulated external transactions.
     */
    async fetchTransactions(accountRef: string, since: Date): Promise<ExternalTransaction[]> {
        const transactions: ExternalTransaction[] = [];
        const now = new Date();
        const start = new Date(since);

        // Generate 3–8 transactions in the period
        const count = 3 + Math.floor(Math.random() * 6);

        for (let i = 0; i < count; i++) {
            const cat = SIMULATED_CATEGORIES[Math.floor(Math.random() * SIMULATED_CATEGORIES.length)];
            const desc = cat.descriptions[Math.floor(Math.random() * cat.descriptions.length)];

            // Random date between `since` and `now`
            const dayRange = Math.max(1, Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
            const randomDaysAgo = Math.floor(Math.random() * dayRange);
            const txnDate = new Date(now);
            txnDate.setDate(txnDate.getDate() - randomDaysAgo);
            txnDate.setHours(Math.floor(Math.random() * 14) + 8, Math.floor(Math.random() * 60));

            const amount = cat.type === 'income'
                ? Math.round((5000 + Math.random() * 90000) * 100) / 100
                : Math.round((50 + Math.random() * 4950) * 100) / 100;

            const externalId = `sim-${accountRef}-${simpleHash(`${accountRef}-${i}-${txnDate.toISOString()}-${amount}`)}`;

            transactions.push({
                externalId,
                amount,
                type: cat.type,
                category: cat.name,
                categoryColor: cat.color,
                description: desc,
                date: txnDate.toISOString(),
            });
        }

        return transactions;
    }
}
