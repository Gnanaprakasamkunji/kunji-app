/**
 * Copyright (c) 2026 Kunji Finance.
 * All rights reserved.
 * This code is proprietary and confidential.
 */

'use client';

import React, { useState } from 'react';
import { Button, Tag } from '@carbon/react';
import { Add, ChartBar } from '@carbon/icons-react';
import { formatCurrency, calculatePercentage } from '@/lib/utils';
import { useApi } from '@/hooks/useApi';
import type { Budget } from '@/types';
import { InlineLoading } from '@carbon/react';
import SetBudgetModal from '@/components/modals/SetBudgetModal';
import EmptyState from '@/components/common/EmptyState';
import DonutChart from '@/components/common/DonutChart';
import type { DonutSlice } from '@/components/common/DonutChart';

export default function BudgetsPage(): React.JSX.Element {
    const { data: budgets, isLoading, mutate } = useApi<Budget[]>('/api/budgets');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    if (isLoading || !budgets) {
        return (
            <div className="kunji-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <InlineLoading description="Loading budgets..." />
            </div>
        );
    }

    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);

    return (
        <div className="kunji-page">
            <div className="kunji-page__header kunji-page__header--split">
                <div>
                    <h1 className="kunji-page__title">Budgets</h1>
                    <p className="kunji-page__subtitle">
                        {formatCurrency(totalSpent)} of {formatCurrency(totalBudget)} spent this month
                    </p>
                </div>
                <Button kind="primary" renderIcon={Add} size="md" onClick={() => setIsAddModalOpen(true)}>
                    Create budget
                </Button>
            </div>

            {budgets.length === 0 ? (
                <EmptyState
                    icon={<ChartBar size={48} />}
                    title="No budgets set"
                    description="You haven't set up any budgets yet. Create a budget to start managing your spending."
                    actionLabel="Create budget"
                    onAction={() => setIsAddModalOpen(true)}
                />
            ) : (
                <>
                    <div className="kunji-grid kunji-grid--2" style={{ marginBottom: '1.5rem' }}>
                        <DonutChart
                            title="Budget allocation"
                            data={budgets.map((b): DonutSlice => ({
                                name: b.category,
                                value: b.amount,
                                color: b.categoryColor,
                            }))}
                            centerLabel={formatCurrency(totalBudget)}
                            centerSubLabel="Total budget"
                            height={260}
                        />
                        <DonutChart
                            title="Spending breakdown"
                            data={budgets.filter((b) => b.spent > 0).map((b): DonutSlice => ({
                                name: b.category,
                                value: b.spent,
                                color: b.categoryColor,
                            }))}
                            centerLabel={formatCurrency(totalSpent)}
                            centerSubLabel="Total spent"
                            height={260}
                        />
                    </div>

                    <div className="kunji-grid kunji-grid--2">
                        {budgets.map((budget) => {
                            const percentage = calculatePercentage(budget.spent, budget.amount);
                            const isOverBudget = budget.spent > budget.amount;
                            const isNearLimit = percentage >= budget.alertThreshold && !isOverBudget;
                            const remaining = budget.amount - budget.spent;

                            let progressColor = 'var(--cds-support-success)';
                            if (isOverBudget) progressColor = 'var(--cds-support-error)';
                            else if (isNearLimit) progressColor = 'var(--cds-support-warning)';

                            return (
                                <div key={budget.id} className="kunji-card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: budget.categoryColor }} aria-hidden="true" />
                                            <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--cds-text-primary)' }}>
                                                {budget.category}
                                            </span>
                                        </div>
                                        {isOverBudget && <Tag type="red" size="sm">Over budget</Tag>}
                                        {isNearLimit && <Tag type="warm-gray" size="sm">Near limit</Tag>}
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.8125rem', color: 'var(--cds-text-secondary)' }}>{formatCurrency(budget.spent)} spent</span>
                                        <span style={{ fontSize: '0.8125rem', color: 'var(--cds-text-secondary)' }}>{formatCurrency(budget.amount)}</span>
                                    </div>

                                    <div className="kunji-progress" role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100} aria-label={`${budget.category} budget progress`}>
                                        <div
                                            className="kunji-progress__fill"
                                            style={{ width: `${Math.min(percentage, 100)}%`, backgroundColor: progressColor }}
                                        />
                                    </div>

                                    <p style={{ fontSize: '0.75rem', color: 'var(--cds-text-helper)', marginTop: '0.5rem' }}>
                                        {isOverBudget
                                            ? `${formatCurrency(Math.abs(remaining))} over budget`
                                            : `${formatCurrency(remaining)} remaining`}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            <SetBudgetModal
                open={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => {
                    setIsAddModalOpen(false);
                    mutate();
                }}
            />
        </div>
    );
}
