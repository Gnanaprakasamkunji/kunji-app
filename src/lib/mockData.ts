/**
 * Copyright (c) 2026 Kunji Finance.
 * All rights reserved.
 * This code is proprietary and confidential.
 */

import type {
    Account,
    Transaction,
    Budget,
    SavingsGoal,
    Investment,
    Insight,
    DashboardSummary,
    ChartDataPoint,
    MonthlyTrend,
} from '@/types';

/**
 * Mock bank/wallet accounts.
 */
export const mockAccounts: Account[] = [
    {
        id: 'acc-1',
        name: 'HDFC Savings',
        type: 'savings',
        balance: 285400,
        currency: 'INR',
        institution: 'HDFC Bank',
        color: '#0f62fe',
        isConnected: false,
        lastSyncAt: null,
        syncStatus: 'idle',
        externalRef: null,
        lastUpdated: '2026-02-20T10:00:00Z',
    },
    {
        id: 'acc-2',
        name: 'ICICI Current',
        type: 'checking',
        balance: 52300,
        currency: 'INR',
        institution: 'ICICI Bank',
        color: '#42be65',
        isConnected: false,
        lastSyncAt: null,
        syncStatus: 'idle',
        externalRef: null,
        lastUpdated: '2026-02-19T15:30:00Z',
    },
    {
        id: 'acc-3',
        name: 'SBI Credit Card',
        type: 'credit',
        balance: -18750,
        currency: 'INR',
        institution: 'SBI',
        color: '#da1e28',
        isConnected: false,
        lastSyncAt: null,
        syncStatus: 'idle',
        externalRef: null,
        lastUpdated: '2026-02-18T09:00:00Z',
    },
    {
        id: 'acc-4',
        name: 'Zerodha Portfolio',
        type: 'investment',
        balance: 450000,
        currency: 'INR',
        institution: 'Zerodha',
        color: '#a56eff',
        isConnected: false,
        lastSyncAt: null,
        syncStatus: 'idle',
        externalRef: null,
        lastUpdated: '2026-02-20T12:00:00Z',
    },
    {
        id: 'acc-5',
        name: 'Cash Wallet',
        type: 'cash',
        balance: 3500,
        currency: 'INR',
        institution: 'Personal',
        color: '#f1c21b',
        isConnected: false,
        lastSyncAt: null,
        syncStatus: 'idle',
        externalRef: null,
        lastUpdated: '2026-02-20T08:00:00Z',
    },
];

/**
 * Mock transactions for the last 30 days.
 */
export const mockTransactions: Transaction[] = [
    {
        id: 'txn-1',
        amount: 95000,
        type: 'income',
        category: 'Salary',
        categoryColor: '#42be65',
        description: 'Monthly salary deposit',
        date: '2026-02-01T09:00:00Z',
        accountId: 'acc-1',
        accountName: 'HDFC Savings',
        source: 'manual',
        status: 'confirmed',
    },
    {
        id: 'txn-2',
        amount: 15000,
        type: 'expense',
        category: 'Rent',
        categoryColor: '#da1e28',
        description: 'Monthly rent payment',
        date: '2026-02-02T10:00:00Z',
        accountId: 'acc-2',
        accountName: 'ICICI Current',
        source: 'manual',
        status: 'confirmed',
    },
    {
        id: 'txn-3',
        amount: 3200,
        type: 'expense',
        category: 'Groceries',
        categoryColor: '#0f62fe',
        description: 'Weekly grocery shopping at BigBasket',
        date: '2026-02-05T14:30:00Z',
        accountId: 'acc-3',
        accountName: 'SBI Credit Card',
        source: 'manual',
        status: 'confirmed',
    },
    {
        id: 'txn-4',
        amount: 1800,
        type: 'expense',
        category: 'Dining',
        categoryColor: '#ff832b',
        description: 'Dinner at Olive Bistro',
        date: '2026-02-07T20:00:00Z',
        accountId: 'acc-3',
        accountName: 'SBI Credit Card',
        source: 'manual',
        status: 'confirmed',
    },
    {
        id: 'txn-5',
        amount: 2500,
        type: 'expense',
        category: 'Transport',
        categoryColor: '#f1c21b',
        description: 'Uber rides for the week',
        date: '2026-02-08T18:00:00Z',
        accountId: 'acc-2',
        accountName: 'ICICI Current',
        source: 'manual',
        status: 'confirmed',
    },
    {
        id: 'txn-6',
        amount: 15000,
        type: 'income',
        category: 'Freelance',
        categoryColor: '#a56eff',
        description: 'UI design project payment',
        date: '2026-02-10T11:00:00Z',
        accountId: 'acc-1',
        accountName: 'HDFC Savings',
        source: 'manual',
        status: 'confirmed',
    },
    {
        id: 'txn-7',
        amount: 899,
        type: 'expense',
        category: 'Subscriptions',
        categoryColor: '#a56eff',
        description: 'Netflix monthly subscription',
        date: '2026-02-11T06:00:00Z',
        accountId: 'acc-3',
        accountName: 'SBI Credit Card',
        source: 'manual',
        status: 'confirmed',
    },
    {
        id: 'txn-8',
        amount: 5000,
        type: 'expense',
        category: 'Shopping',
        categoryColor: '#ee538b',
        description: 'New running shoes from Nike',
        date: '2026-02-12T16:00:00Z',
        accountId: 'acc-3',
        accountName: 'SBI Credit Card',
        source: 'manual',
        status: 'confirmed',
    },
    {
        id: 'txn-9',
        amount: 1200,
        type: 'expense',
        category: 'Utilities',
        categoryColor: '#007d79',
        description: 'Electricity bill payment',
        date: '2026-02-14T10:00:00Z',
        accountId: 'acc-2',
        accountName: 'ICICI Current',
        source: 'manual',
        status: 'confirmed',
    },
    {
        id: 'txn-10',
        amount: 4500,
        type: 'expense',
        category: 'Health',
        categoryColor: '#009d9a',
        description: 'Gym membership renewal',
        date: '2026-02-15T08:00:00Z',
        accountId: 'acc-1',
        accountName: 'HDFC Savings',
        source: 'manual',
        status: 'confirmed',
    },
    {
        id: 'txn-11',
        amount: 800,
        type: 'expense',
        category: 'Entertainment',
        categoryColor: '#d4bbff',
        description: 'Movie tickets — Oppenheimer',
        date: '2026-02-16T19:30:00Z',
        accountId: 'acc-5',
        accountName: 'Cash Wallet',
        source: 'manual',
        status: 'confirmed',
    },
    {
        id: 'txn-12',
        amount: 25000,
        type: 'transfer',
        category: 'Investment',
        categoryColor: '#a56eff',
        description: 'Monthly SIP — Nifty 50 Index Fund',
        date: '2026-02-17T09:00:00Z',
        accountId: 'acc-1',
        accountName: 'HDFC Savings',
        source: 'manual',
        status: 'confirmed',
    },
];

/**
 * Mock budgets for the current month.
 */
export const mockBudgets: Budget[] = [
    {
        id: 'bgt-1',
        category: 'Groceries',
        categoryColor: '#0f62fe',
        amount: 8000,
        spent: 5400,
        period: 'monthly',
        alertThreshold: 80,
    },
    {
        id: 'bgt-2',
        category: 'Dining',
        categoryColor: '#ff832b',
        amount: 5000,
        spent: 4200,
        period: 'monthly',
        alertThreshold: 80,
    },
    {
        id: 'bgt-3',
        category: 'Transport',
        categoryColor: '#f1c21b',
        amount: 4000,
        spent: 2500,
        period: 'monthly',
        alertThreshold: 80,
    },
    {
        id: 'bgt-4',
        category: 'Shopping',
        categoryColor: '#ee538b',
        amount: 7000,
        spent: 7800,
        period: 'monthly',
        alertThreshold: 80,
    },
    {
        id: 'bgt-5',
        category: 'Entertainment',
        categoryColor: '#d4bbff',
        amount: 3000,
        spent: 800,
        period: 'monthly',
        alertThreshold: 80,
    },
    {
        id: 'bgt-6',
        category: 'Subscriptions',
        categoryColor: '#a56eff',
        amount: 2000,
        spent: 1399,
        period: 'monthly',
        alertThreshold: 80,
    },
];

/**
 * Mock savings goals.
 */
export const mockSavingsGoals: SavingsGoal[] = [
    {
        id: 'sg-1',
        name: 'Emergency Fund',
        targetAmount: 300000,
        currentAmount: 185000,
        targetDate: '2026-08-01',
        priority: 'high',
        icon: '🛡️',
        color: '#da1e28',
    },
    {
        id: 'sg-2',
        name: 'Europe Trip',
        targetAmount: 500000,
        currentAmount: 125000,
        targetDate: '2027-06-01',
        priority: 'medium',
        icon: '✈️',
        color: '#0f62fe',
    },
    {
        id: 'sg-3',
        name: 'New Laptop',
        targetAmount: 150000,
        currentAmount: 90000,
        targetDate: '2026-05-01',
        priority: 'medium',
        icon: '💻',
        color: '#42be65',
    },
    {
        id: 'sg-4',
        name: 'Wedding Fund',
        targetAmount: 1500000,
        currentAmount: 320000,
        targetDate: '2028-01-01',
        priority: 'high',
        icon: '💍',
        color: '#f1c21b',
    },
];

/**
 * Mock investment holdings.
 */
export const mockInvestments: Investment[] = [
    {
        id: 'inv-1',
        name: 'Nifty 50 Index Fund',
        type: 'mutual-fund',
        purchasePrice: 180000,
        currentValue: 215000,
        units: 120.5,
        purchaseDate: '2025-03-15',
        color: '#0f62fe',
    },
    {
        id: 'inv-2',
        name: 'Reliance Industries',
        type: 'stocks',
        purchasePrice: 50000,
        currentValue: 62000,
        units: 20,
        purchaseDate: '2025-06-10',
        color: '#42be65',
    },
    {
        id: 'inv-3',
        name: 'HDFC Corporate Bond Fund',
        type: 'bonds',
        purchasePrice: 100000,
        currentValue: 108500,
        units: 500,
        purchaseDate: '2025-01-20',
        color: '#f1c21b',
    },
    {
        id: 'inv-4',
        name: 'Bitcoin',
        type: 'crypto',
        purchasePrice: 30000,
        currentValue: 45000,
        units: 0.005,
        purchaseDate: '2025-09-01',
        color: '#ff832b',
    },
    {
        id: 'inv-5',
        name: 'S&P 500 ETF',
        type: 'etf',
        purchasePrice: 75000,
        currentValue: 88000,
        units: 15,
        purchaseDate: '2025-04-12',
        color: '#a56eff',
    },
];

/**
 * Mock AI insights.
 */
export const mockInsights: Insight[] = [
    {
        id: 'ins-1',
        title: 'Dining overspend alert',
        content: 'Your dining expenses are 84% of the monthly budget with 10 days remaining. Consider cooking at home to stay on track.',
        type: 'spending',
        isRead: false,
        generatedAt: '2026-02-20T06:00:00Z',
    },
    {
        id: 'ins-2',
        title: 'Great savings streak',
        content: 'You have consistently saved 25% of your income for the last 3 months. Keep going to reach your emergency fund goal by August.',
        type: 'saving',
        isRead: false,
        generatedAt: '2026-02-19T06:00:00Z',
    },
    {
        id: 'ins-3',
        title: 'Portfolio rebalancing',
        content: 'Your portfolio is 47% equity. Consider increasing bond allocation to 30% for better risk-adjusted returns.',
        type: 'investing',
        isRead: true,
        generatedAt: '2026-02-18T06:00:00Z',
    },
];

/**
 * Dashboard summary computed from mock data.
 */
export const mockDashboardSummary: DashboardSummary = {
    netWorth: 772450,
    netWorthChange: 4.2,
    monthlyIncome: 110000,
    monthlyExpenses: 49899,
    savingsRate: 54.6,
    totalSavingsGoalProgress: 29.4,
};

/**
 * Spending by category for donut chart.
 */
export const mockSpendingByCategory: ChartDataPoint[] = [
    { name: 'Rent', value: 15000, color: '#da1e28' },
    { name: 'Groceries', value: 5400, color: '#0f62fe' },
    { name: 'Shopping', value: 5000, color: '#ee538b' },
    { name: 'Health', value: 4500, color: '#009d9a' },
    { name: 'Dining', value: 4200, color: '#ff832b' },
    { name: 'Transport', value: 2500, color: '#f1c21b' },
    { name: 'Utilities', value: 1200, color: '#007d79' },
    { name: 'Subscriptions', value: 899, color: '#a56eff' },
    { name: 'Entertainment', value: 800, color: '#d4bbff' },
];

/**
 * Monthly income vs expenses trend (6 months).
 */
export const mockMonthlyTrends: MonthlyTrend[] = [
    { month: 'Sep', income: 95000, expenses: 58000 },
    { month: 'Oct', income: 98000, expenses: 52000 },
    { month: 'Nov', income: 105000, expenses: 63000 },
    { month: 'Dec', income: 120000, expenses: 78000 },
    { month: 'Jan', income: 95000, expenses: 45000 },
    { month: 'Feb', income: 110000, expenses: 49899 },
];
