/**
 * Copyright (c) 2026 Kunji Finance.
 * All rights reserved.
 * This code is proprietary and confidential.
 */

'use client';

import React from 'react';
import { formatCurrency } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, ArrowRight } from '@carbon/icons-react';

/**
 * Props for the SummaryCard component.
 */
interface SummaryCardProps {
    /** Label describing the metric. */
    label: string;
    /** The metric value formatted as currency or text. */
    value: number;
    /** Percentage change (positive = up, negative = down). */
    change?: number;
    /** Icon element to display. */
    icon: React.ReactNode;
    /** Whether to format as currency. */
    isCurrency?: boolean;
    /** Whether to format as percentage. */
    isPercentage?: boolean;
}

/**
 * SummaryCard displays a key metric on the dashboard.
 * Designed with premium glassmorphism and subtle animations.
 */
const SummaryCard: React.FC<SummaryCardProps> = ({
    label,
    value,
    change,
    icon,
    isCurrency = true,
    isPercentage = false,
}) => {
    const displayValue = isPercentage
        ? `${value.toFixed(1)}%`
        : isCurrency
            ? formatCurrency(value)
            : value.toString();

    // Determine the stat trend badge
    let trendClass = 'neutral';
    let TrendIcon = ArrowRight;

    if (change !== undefined) {
        if (change > 0) {
            trendClass = 'positive';
            TrendIcon = ArrowUpRight;
        } else if (change < 0) {
            trendClass = 'negative';
            TrendIcon = ArrowDownRight;
        }
    }

    return (
        <div className="kunji-card" role="article" aria-label={label}>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem',
                }}
            >
                <span
                    style={{
                        fontSize: '0.875rem',
                        color: 'var(--cds-text-secondary)',
                        fontWeight: 500,
                        letterSpacing: '0.01em',
                    }}
                >
                    {label}
                </span>
                <span
                    aria-hidden="true"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, rgba(42, 117, 255, 0.2), rgba(42, 117, 255, 0.05))',
                        color: 'var(--cds-interactive)',
                        border: '1px solid rgba(42, 117, 255, 0.1)'
                    }}
                >
                    {icon}
                </span>
            </div>

            <div
                style={{
                    fontSize: '2rem',
                    fontWeight: 700,
                    color: 'var(--cds-text-primary)',
                    marginBottom: '0.75rem',
                    letterSpacing: '-0.02em',
                }}
            >
                {displayValue}
            </div>

            {change !== undefined && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className={`kunji-status-badge ${trendClass}`}>
                        <TrendIcon size={14} />
                        {Math.abs(change).toFixed(1)}%
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--cds-text-helper)' }}>
                        vs last month
                    </span>
                </div>
            )}
        </div>
    );
};

export default SummaryCard;
