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
    Label,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

/**
 * A single data slice for the donut chart.
 */
export interface DonutSlice {
    /** Label for the slice. */
    name: string;
    /** Numeric value. */
    value: number;
    /** Hex color for the slice. */
    color: string;
}

/**
 * Props for the DonutChart component.
 */
interface DonutChartProps {
    /** Chart title shown above the donut. */
    title: string;
    /** Data slices for the donut. */
    data: DonutSlice[];
    /** Height of the chart container in pixels. */
    height?: number;
    /** Center label text (e.g. total value). */
    centerLabel?: string;
    /** Center sub-label text (e.g. "Total"). */
    centerSubLabel?: string;
    /** Whether to format values as currency. */
    isCurrency?: boolean;
    /** Whether to show percentage labels on slices. */
    showPercentageLabels?: boolean;
}

/**
 * Custom tooltip for the donut chart.
 */
interface CustomTooltipPayload {
    active?: boolean;
    payload?: Array<{ payload: DonutSlice }>;
}

/**
 * Renders a tooltip with coloured dot, label, and value.
 */
const ChartTooltip: React.FC<CustomTooltipPayload & { isCurrency: boolean }> = ({ active, payload, isCurrency }) => {
    if (active && payload && payload.length > 0) {
        const item = payload[0].payload;
        return (
            <div
                style={{
                    background: 'var(--cds-layer-01, rgba(15, 16, 22, 0.85))',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid var(--cds-border-subtle-01)',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    fontSize: '0.8125rem',
                    boxShadow: 'var(--card-base-shadow)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color }} />
                    <p style={{ color: 'var(--cds-text-primary)', fontWeight: 600 }}>{item.name}</p>
                </div>
                <p style={{ color: 'var(--cds-text-secondary)', marginLeft: '1.25rem', fontSize: '0.9375rem', fontWeight: 500 }}>
                    {isCurrency ? formatCurrency(item.value) : item.value.toLocaleString('en-IN')}
                </p>
            </div>
        );
    }
    return null;
};

/**
 * Renders percentage labels outside each slice.
 */
const renderCustomizedLabel = (props: any): React.ReactElement | null => {
    const { cx, cy, midAngle, outerRadius, percent } = props;
    if (percent < 0.03) return null; // Skip tiny slices

    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 20;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text
            x={x}
            y={y}
            fill="var(--cds-text-secondary)"
            textAnchor={x > cx ? 'start' : 'end'}
            dominantBaseline="central"
            fontSize="0.75rem"
            fontWeight={500}
        >
            {`${(percent * 100).toFixed(1)}%`}
        </text>
    );
};

/**
 * DonutChart renders a reusable donut chart with optional center label,
 * percentage labels, and a legend grid below.
 *
 * @param props - Component props.
 * @returns JSX element for the donut chart.
 */
const DonutChart: React.FC<DonutChartProps> = ({
    title,
    data,
    height = 300,
    centerLabel,
    centerSubLabel,
    isCurrency = true,
    showPercentageLabels = true,
}) => {
    const total = data.reduce((sum, d) => sum + d.value, 0);

    if (data.length === 0) {
        return (
            <div className="kunji-card" role="img" aria-label={title}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--cds-text-primary)', marginBottom: '1.25rem' }}>
                    {title}
                </h3>
                <p style={{ color: 'var(--cds-text-secondary)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>
                    No data available
                </p>
            </div>
        );
    }

    return (
        <div className="kunji-card" role="img" aria-label={title}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--cds-text-primary)', marginBottom: '1.25rem' }}>
                {title}
            </h3>
            <ResponsiveContainer width="100%" height={height}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius="55%"
                        outerRadius="75%"
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                        label={showPercentageLabels ? (renderCustomizedLabel as any) : undefined}
                        labelLine={false}
                    >
                        {data.map((entry) => (
                            <Cell key={`cell-${entry.name}`} fill={entry.color} />
                        ))}
                        {(centerLabel || centerSubLabel) && (
                            <Label
                                content={() => (
                                    <g>
                                        {centerSubLabel && (
                                            <text
                                                x="50%"
                                                y="46%"
                                                textAnchor="middle"
                                                dominantBaseline="central"
                                                style={{ fontSize: '0.75rem', fill: 'var(--cds-text-secondary)', fontWeight: 400 }}
                                            >
                                                {centerSubLabel}
                                            </text>
                                        )}
                                        {centerLabel && (
                                            <text
                                                x="50%"
                                                y={centerSubLabel ? '56%' : '50%'}
                                                textAnchor="middle"
                                                dominantBaseline="central"
                                                style={{ fontSize: '1.125rem', fill: 'var(--cds-text-primary)', fontWeight: 700 }}
                                            >
                                                {centerLabel}
                                            </text>
                                        )}
                                    </g>
                                )}
                                position="center"
                            />
                        )}
                    </Pie>
                    <Tooltip content={<ChartTooltip isCurrency={isCurrency} />} cursor={{ fill: 'transparent' }} />
                </PieChart>
            </ResponsiveContainer>

            {/* Legend grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.5rem 1rem',
                marginTop: '0.75rem',
            }}>
                {data.map((entry) => {
                    const pct = total > 0 ? ((entry.value / total) * 100).toFixed(1) : '0';
                    return (
                        <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: entry.color, flexShrink: 0 }} />
                            <span style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                                {entry.name} ({pct}%)
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DonutChart;
