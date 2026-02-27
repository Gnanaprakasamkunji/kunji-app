/**
 * Copyright (c) 2026 Kunji Finance.
 * All rights reserved.
 * This code is proprietary and confidential.
 */

import { format, parseISO, isValid } from 'date-fns';

/**
 * Formats a number as currency (INR by default).
 *
 * @param amount - The numeric amount to format.
 * @param currency - The currency code (e.g., 'INR', 'USD').
 * @returns Formatted currency string.
 */
export function formatCurrency(amount: number, currency: string = 'INR'): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
}

/**
 * Formats a date string to a human-readable format.
 *
 * @param dateString - ISO date string.
 * @param formatStr - Date format pattern (default: 'dd MMM yyyy').
 * @returns Formatted date string.
 */
export function formatDate(dateString: string, formatStr: string = 'dd MMM yyyy'): string {
    const date = parseISO(dateString);
    if (!isValid(date)) {
        return 'Invalid date';
    }
    return format(date, formatStr);
}

/**
 * Calculates a percentage.
 *
 * @param current - The current value.
 * @param total - The total/target value.
 * @returns Percentage as a number (0–100).
 */
export function calculatePercentage(current: number, total: number): number {
    if (total === 0) return 0;
    return Math.min(Math.round((current / total) * 100), 100);
}

/**
 * Returns a CSS class based on whether a value is positive or negative.
 *
 * @param value - The numeric value.
 * @returns CSS class name for status styling.
 */
export function getStatusClass(value: number): string {
    if (value > 0) return 'kunji-status--positive';
    if (value < 0) return 'kunji-status--negative';
    return '';
}

/**
 * Formats a number with appropriate suffix (K, M, B).
 *
 * @param num - The number to format.
 * @returns Abbreviated string representation.
 */
export function formatCompactNumber(num: number): string {
    if (Math.abs(num) >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (Math.abs(num) >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (Math.abs(num) >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toString();
}

/**
 * Generates a unique ID for mock data.
 *
 * @returns A unique string identifier.
 */
export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
