/**
 * Copyright (c) 2026 Kunji Finance.
 * All rights reserved.
 * This code is proprietary and confidential.
 */

'use client';

import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from 'recharts';
import type { ChartDataPoint } from '@/types';
import { formatCurrency } from '@/lib/utils';

/**
 * Props for the SpendingChart component.
 */
interface SpendingChartProps {
    /** Data points for the donut chart. */
    data: ChartDataPoint[];
}

/**
 * Custom tooltip for the spending chart.
 */
interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ payload: ChartDataPoint }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
    if (active && payload && payload.length > 0) {
        const item = payload[0].payload;
        return (
            <div
                style={{
                    background: 'rgba(15, 16, 22, 0.85)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    fontSize: '0.8125rem',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color }} />
                    <p style={{ color: 'var(--cds-text-primary)', fontWeight: 600 }}>
                        {item.name}
                    </p>
                </div>
                <p style={{ color: 'var(--cds-text-secondary)', marginLeft: '1.25rem', fontSize: '0.9375rem', fontWeight: 500 }}>
                    {formatCurrency(item.value)}
                </p>
            </div>
        );
    }
    return null;
}

/**
 * SpendingChart renders a donut chart displaying spending by category.
 */
const SpendingChart: React.FC<SpendingChartProps> = ({ data }) => {
    return (
        <div className="kunji-card" role="img" aria-label="Spending by category chart">
            <h3
                style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: 'var(--cds-text-primary)',
                    marginBottom: '1.25rem',
                    letterSpacing: '-0.01em',
                }}
            >
                Spending Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth={2}
                    >
                        {data.map((entry) => (
                            <Cell key={`cell-${entry.name}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        iconSize={8}
                        formatter={(value: string) => (
                            <span style={{ color: 'var(--cds-text-secondary)', fontSize: '0.8125rem', fontWeight: 500, marginLeft: '0.25rem' }}>
                                {value}
                            </span>
                        )}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SpendingChart;
