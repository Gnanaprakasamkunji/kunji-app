/**
 * Copyright (c) 2026 Kunji Finance.
 * All rights reserved.
 * This code is proprietary and confidential.
 */

/**
 * Represents a financial account (bank, wallet, credit card, etc.).
 */
export interface Account {
    id: string;
    name: string;
    type: AccountType;
    balance: number;
    currency: string;
    institution: string;
    color: string;
    isConnected: boolean;
    lastSyncAt: string | null;
    syncStatus: 'idle' | 'syncing' | 'success' | 'error';
    externalRef: string | null;
    lastUpdated: string;
}

export type AccountType = 'checking' | 'savings' | 'credit' | 'investment' | 'cash';

/**
 * Represents a financial transaction (income or expense).
 */
export interface Transaction {
    id: string;
    amount: number;
    type: TransactionType;
    category: string;
    categoryColor: string;
    description: string;
    date: string;
    accountId: string;
    accountName: string;
    externalId?: string;
    source: 'manual' | 'sync';
    status: 'pending' | 'confirmed' | 'flagged';
    notes?: string;
}

export type TransactionType = 'income' | 'expense' | 'transfer';

/**
 * Represents a budget for a specific category.
 */
export interface Budget {
    id: string;
    category: string;
    categoryColor: string;
    amount: number;
    spent: number;
    period: BudgetPeriod;
    alertThreshold: number;
}

export type BudgetPeriod = 'monthly' | 'weekly';

/**
 * Represents a savings goal.
 */
export interface SavingsGoal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: string;
    priority: GoalPriority;
    icon: string;
    color: string;
}

export type GoalPriority = 'high' | 'medium' | 'low';

/**
 * Represents an investment holding.
 */
export interface Investment {
    id: string;
    name: string;
    type: InvestmentType;
    purchasePrice: number;
    currentValue: number;
    units: number;
    purchaseDate: string;
    color: string;
}

export type InvestmentType = 'stocks' | 'bonds' | 'mutual-fund' | 'crypto' | 'etf';

/**
 * Represents an AI-generated insight.
 */
export interface Insight {
    id: string;
    title: string;
    content: string;
    type: InsightType;
    isRead: boolean;
    generatedAt: string;
}

export type InsightType = 'spending' | 'saving' | 'investing' | 'general';

/**
 * Summary metrics for the dashboard.
 */
export interface DashboardSummary {
    netWorth: number;
    netWorthChange: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    savingsRate: number;
    totalSavingsGoalProgress: number;
}

/**
 * Data point for chart rendering.
 */
export interface ChartDataPoint {
    name: string;
    value: number;
    color?: string;
}

/**
 * Monthly trend data for income vs expenses chart.
 */
export interface MonthlyTrend {
    month: string;
    income: number;
    expenses: number;
}

/**
 * Navigation item for sidebar.
 */
export interface NavItem {
    label: string;
    href: string;
    icon: string;
}

export interface ConnectedEmail {
    id: string;
    email: string;
    provider: string; // google, outlook
    isConnected: boolean;
    lastSyncAt?: string;
    syncStatus: string; // idle, syncing, success, error
}
