/**
 * Copyright (c) 2026 Kunji Finance.
 * All rights reserved.
 * This code is proprietary and confidential.
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
    Modal,
    TextInput,
    NumberInput,
    Select,
    SelectItem,
    DatePicker,
    DatePickerInput,
} from '@carbon/react';
import type { UpdateSavingsGoalInput } from '@/lib/validators';
import type { SavingsGoal } from '@/types';

interface EditSavingsGoalModalProps {
    open: boolean;
    goal: SavingsGoal | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EditSavingsGoalModal({ open, goal, onClose, onSuccess }: EditSavingsGoalModalProps): React.JSX.Element {
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState<number | ''>('');
    const [currentAmount, setCurrentAmount] = useState<number | ''>(0);
    const [targetDate, setTargetDate] = useState<Date>(new Date(new Date().setFullYear(new Date().getFullYear() + 1)));
    const [priority, setPriority] = useState('medium');
    const [icon, setIcon] = useState('💰');
    const [color, setColor] = useState('#0f62fe');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (goal && open) {
            setName(goal.name);
            setTargetAmount(goal.targetAmount);
            setCurrentAmount(goal.currentAmount);
            setTargetDate(new Date(goal.targetDate));
            setPriority(goal.priority);
            setIcon(goal.icon);
            setColor(goal.color);
            setError(null);
        }
    }, [goal, open]);

    const handleSubmit = async () => {
        if (!goal || !name || !targetAmount) {
            setError('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        const payload: UpdateSavingsGoalInput = {
            name,
            targetAmount: Number(targetAmount),
            currentAmount: Number(currentAmount) || 0,
            targetDate: targetDate.toISOString(),
            priority: priority as any,
            icon,
            color,
        };

        try {
            const res = await fetch(`/api/savings/${goal.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Failed to update savings goal');
            }

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
            modalHeading="Edit Savings Goal"
            primaryButtonText={isSubmitting ? 'Saving...' : 'Save changes'}
            secondaryButtonText="Cancel"
            primaryButtonDisabled={isSubmitting}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '1rem' }}>
                {error && <p style={{ color: 'var(--cds-support-error)', fontSize: '0.875rem' }}>{error}</p>}

                <TextInput
                    id="edit-sg-name"
                    labelText="Goal name"
                    placeholder="e.g. Emergency Fund, New Car"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <NumberInput
                        id="edit-sg-target"
                        label="Target amount (INR)"
                        value={targetAmount}
                        onChange={(e, { value }) => setTargetAmount(Number(value))}
                        min={0}
                        step={100}
                    />
                    <NumberInput
                        id="edit-sg-current"
                        label="Current saved (INR)"
                        value={currentAmount}
                        onChange={(e, { value }) => setCurrentAmount(Number(value))}
                        min={0}
                        step={100}
                    />
                </div>

                <DatePicker datePickerType="single" onChange={(dates: Date[]) => setTargetDate(dates[0])} value={targetDate}>
                    <DatePickerInput
                        id="edit-sg-date"
                        placeholder="dd/mm/yyyy"
                        labelText="Target date"
                    />
                </DatePicker>

                <Select
                    id="edit-sg-priority"
                    labelText="Priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                >
                    <SelectItem value="low" text="Low" />
                    <SelectItem value="medium" text="Medium" />
                    <SelectItem value="high" text="High" />
                </Select>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <TextInput
                        id="edit-sg-icon"
                        labelText="Emoji Icon"
                        value={icon}
                        onChange={(e) => setIcon(e.target.value)}
                    />
                    <Select
                        id="edit-sg-color"
                        labelText="Color theme"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                    >
                        <SelectItem value="#0f62fe" text="Blue" />
                        <SelectItem value="#198038" text="Green" />
                        <SelectItem value="#da1e28" text="Red" />
                        <SelectItem value="#8a3ffc" text="Purple" />
                        <SelectItem value="#f1c21b" text="Yellow" />
                    </Select>
                </div>
            </div>
        </Modal>
    );
}
