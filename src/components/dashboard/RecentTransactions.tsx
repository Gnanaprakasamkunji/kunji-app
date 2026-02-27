/**
 * Copyright (c) 2026 Kunji Finance.
 * All rights reserved.
 * This code is proprietary and confidential.
 */

'use client';

import React from 'react';
import type { Transaction } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowRight } from '@carbon/icons-react';

/**
 * Props for the RecentTransactions component.
 */
interface RecentTransactionsProps {
    /** List of recent transactions to display. */
    transactions: Transaction[];
}

/**
 * RecentTransactions displays the latest transactions in a compact, interactive list.
 */
const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions }) => {
    return (
        <div className="kunji-card" role="region" aria-label="Recent transactions">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3
                    style={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: 'var(--cds-text-primary)',
                        letterSpacing: '-0.01em',
                    }}
                >
                    Recent Activity
                </h3>
                <button
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--cds-interactive)',
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        transition: 'color 0.2s ease',
                    }}
                >
                    View All <ArrowRight size={16} />
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {transactions.slice(0, 5).map((txn) => (
                    <div
                        key={txn.id}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                            border: '1px solid transparent',
                            background: 'rgba(255, 255, 255, 0.02)',
                            transition: 'all 250ms cubic-bezier(0.2, 0.8, 0.2, 1)',
                            cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(42, 117, 255, 0.08)';
                            e.currentTarget.style.borderColor = 'rgba(42, 117, 255, 0.1)';
                            e.currentTarget.style.transform = 'translateX(4px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                            e.currentTarget.style.borderColor = 'transparent';
                            e.currentTarget.style.transform = 'none';
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div
                                style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    backgroundColor: txn.categoryColor,
                                    boxShadow: `0 0 8px ${txn.categoryColor}80`,
                                    flexShrink: 0,
                                }}
                                aria-hidden="true"
                            />
                            <div>
                                <p
                                    style={{
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        color: 'var(--cds-text-primary)',
                                        marginBottom: '0.125rem',
                                    }}
                                >
                                    {txn.description}
                                </p>
                                <p
                                    style={{
                                        fontSize: '0.75rem',
                                        color: 'var(--cds-text-secondary)',
                                        fontWeight: 400,
                                    }}
                                >
                                    {txn.category} • {formatDate(txn.date)}
                                </p>
                            </div>
                        </div>
                        <span
                            style={{
                                fontSize: '0.9375rem',
                                fontWeight: 600,
                                letterSpacing: '0.02em',
                                color:
                                    txn.type === 'income'
                                        ? 'var(--cds-support-success)'
                                        : 'var(--cds-text-primary)',
                            }}
                        >
                            {txn.type === 'income' ? '+' : '-'}
                            {formatCurrency(txn.amount)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentTransactions;
