/**
 * Copyright (c) 2026 Kunji Finance.
 * All rights reserved.
 * This code is proprietary and confidential.
 */

import { z } from 'zod';

/**
 * Zod schema for creating a new financial account.
 */
export const createAccountSchema = z.object({
    name: z.string().min(1, 'Account name is required').max(100),
    type: z.enum(['checking', 'savings', 'credit', 'investment', 'cash']),
    balance: z.number(),
    currency: z.string().default('INR'),
    institution: z.string().min(1, 'Institution is required').max(100),
    color: z.string().default('#0f62fe'),
    isConnected: z.boolean().optional(),
    externalRef: z.string().optional().nullable(),
});

/**
 * Zod schema for creating a new transaction.
 */
export const createTransactionSchema = z.object({
    amount: z.number().positive('Amount must be positive'),
    type: z.enum(['income', 'expense', 'transfer']),
    category: z.string().min(1, 'Category is required').max(50),
    categoryColor: z.string().default('#0f62fe'),
    description: z.string().min(1, 'Description is required').max(200),
    date: z.string().datetime({ offset: true }).or(z.string().date()),
    accountId: z.string().uuid('Invalid account'),
    notes: z.string().max(500).optional(),
    externalId: z.string().optional(),
    source: z.enum(['manual', 'sync']).optional(),
    status: z.enum(['pending', 'confirmed', 'flagged']).default('confirmed'),
});

/**
 * Zod schema for creating a new budget.
 */
export const createBudgetSchema = z.object({
    category: z.string().min(1, 'Category is required').max(50),
    categoryColor: z.string().default('#0f62fe'),
    amount: z.number().positive('Budget amount must be positive'),
    period: z.enum(['monthly', 'weekly']).default('monthly'),
    alertThreshold: z.number().min(0).max(100).default(80),
});

/**
 * Zod schema for creating a new savings goal.
 */
export const createSavingsGoalSchema = z.object({
    name: z.string().min(1, 'Goal name is required').max(100),
    targetAmount: z.number().positive('Target amount must be positive'),
    currentAmount: z.number().min(0).default(0),
    targetDate: z.string().date(),
    priority: z.enum(['high', 'medium', 'low']).default('medium'),
    icon: z.string().default('🎯'),
    color: z.string().default('#0f62fe'),
});

/**
 * Zod schema for updating an existing savings goal.
 */
export const updateSavingsGoalSchema = createSavingsGoalSchema.partial();


/**
 * Zod schema for creating a new investment.
 */
export const createInvestmentSchema = z.object({
    name: z.string().min(1, 'Investment name is required').max(100),
    type: z.enum(['stocks', 'bonds', 'mutual-fund', 'crypto', 'etf']),
    purchasePrice: z.number().positive('Purchase price must be positive'),
    currentValue: z.number().min(0),
    units: z.number().positive('Units must be positive'),
    purchaseDate: z.string().date(),
    color: z.string().default('#0f62fe'),
});

/**
 * Zod schema for login credentials.
 */
export const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

/**
 * Zod schema for user registration.
 */
export const signupSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100),
    email: z.string().email('Please enter a valid email address'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

/**
 * Zod schema for forgot password request.
 */
export const forgotPasswordSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
});

/**
 * Zod schema for password reset.
 */
export const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

/**
 * Zod schema for connecting a new email account.
 */
export const connectEmailSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    provider: z.enum(['google', 'outlook']),
});

/**
 * Zod schema for updating an existing budget.
 */
export const updateBudgetSchema = createBudgetSchema.partial();

/**
 * Zod schema for updating an existing transaction.
 */
export const updateTransactionSchema = createTransactionSchema.partial();

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
export type CreateSavingsGoalInput = z.infer<typeof createSavingsGoalSchema>;
export type UpdateSavingsGoalInput = z.infer<typeof updateSavingsGoalSchema>;
export type CreateInvestmentInput = z.infer<typeof createInvestmentSchema>;
export type ConnectEmailInput = z.infer<typeof connectEmailSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
