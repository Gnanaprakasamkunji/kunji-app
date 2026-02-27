/**
 * Copyright (c) 2026 Kunji Finance.
 * All rights reserved.
 * This code is proprietary and confidential.
 */

'use client';

import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import type { MonthlyTrend } from '@/types';
import { formatCompactNumber } from '@/lib/utils';

interface IncomeExpenseChartProps {
    data: MonthlyTrend[];
}

interface TrendTooltipProps {
    active?: boolean;
    payload?: Array<{ name: string; value: number; fill: string }>;
    label?: string;
}

const TrendTooltip: React.FC<TrendTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length > 0) {
        return (
            <div style={{ background: 'rgba(15, 16, 22, 0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.8125rem', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)' }}>
                <p style={{ color: 'var(--cds-text-primary)', fontWeight: 600, marginBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.25rem' }}>{label}</p>
                {payload.map((entry) => (
                    <div key={entry.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginTop: '0.25rem' }}>
                        <span style={{ color: 'var(--cds-text-secondary)', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: entry.fill }} />{entry.name}</span>
                        <span style={{ color: entry.fill, fontWeight: 600, fontSize: '0.875rem' }}>₹{formatCompactNumber(entry.value)}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({ data }) => {
    return (
        <div className="kunji-card" role="img" aria-label="Income versus expenses trend chart">
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--cds-text-primary)', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>Income vs. Expenses</h3>
            <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data} barGap={6}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: 'var(--cds-text-secondary)', fontSize: 13, fontWeight: 500 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} dy={8} />
                    <YAxis tick={{ fill: 'var(--cds-text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(value: number) => `₹${formatCompactNumber(value)}`} dx={-8} />
                    <Tooltip content={<TrendTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                    <Legend verticalAlign="top" align="right" height={36} iconType="circle" iconSize={8} wrapperStyle={{ top: -40 }} formatter={(value: string) => (<span style={{ color: 'var(--cds-text-secondary)', fontSize: '0.8125rem', fontWeight: 500, marginLeft: '0.25rem' }}>{value}</span>)} />
                    <Bar dataKey="income" name="Income" fill="#1fe074" radius={[6, 6, 0, 0]} maxBarSize={48} />
                    <Bar dataKey="expenses" name="Expenses" fill="#ff3b4a" radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default IncomeExpenseChart;
