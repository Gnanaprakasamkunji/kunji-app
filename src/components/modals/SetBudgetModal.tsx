/**
 * Copyright (c) 2026 Kunji Finance.
 * All rights reserved.
 * This code is proprietary and confidential.
 */

'use client';

import React, { useState } from 'react';
import {
    Modal,
    TextInput,
    NumberInput,
    Select,
    SelectItem,
} from '@carbon/react';
import type { CreateBudgetInput } from '@/lib/validators';

interface SetBudgetModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function SetBudgetModal({ open, onClose, onSuccess }: SetBudgetModalProps): React.JSX.Element {
    const [category, setCategory] = useState('Groceries');
    const [amount, setAmount] = useState<number | ''>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!amount || !category) {
            setError('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        // Predefined colors for demo
        const colorMap: Record<string, string> = {
            Groceries: '#0f62fe',
            Dining: '#ff832b',
            Transport: '#f1c21b',
            Shopping: '#ee538b',
        };

        const payload: CreateBudgetInput = {
            category,
            categoryColor: colorMap[category] || '#a56eff',
            amount: Number(amount),
            period: 'monthly',
            alertThreshold: 80,
        };

        try {
            const res = await fetch('/api/budgets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Failed to set budget');
            }

            setAmount('');
            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            open={open}
            onRequestClose={onClose}
            onRequestSubmit={handleSubmit}
            modalHeading="Set Budget"
            primaryButtonText={isSubmitting ? 'Saving...' : 'Save'}
            secondaryButtonText="Cancel"
            primaryButtonDisabled={isSubmitting}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '1rem' }}>
                {error && <p style={{ color: 'var(--cds-support-error)', fontSize: '0.875rem' }}>{error}</p>}

                <Select
                    id="budget-category"
                    labelText="Category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                    <SelectItem value="Groceries" text="Groceries" />
                    <SelectItem value="Dining" text="Dining" />
                    <SelectItem value="Transport" text="Transport" />
                    <SelectItem value="Shopping" text="Shopping" />
                    <SelectItem value="Other" text="Other" />
                </Select>

                <NumberInput
                    id="budget-amount"
                    label="Monthly limit (INR)"
                    value={amount}
                    onChange={(e, { value }) => setAmount(Number(value))}
                    min={0}
                    step={100}
                />
            </div>
        </Modal>
    );
}
