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
    DatePicker,
    DatePickerInput,
} from '@carbon/react';
import type { CreateTransactionInput } from '@/lib/validators';
import type { Account } from '@/types';

interface AddTransactionModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    accounts: Account[];
}

export default function AddTransactionModal({ open, onClose, onSuccess, accounts }: AddTransactionModalProps): React.JSX.Element {
    const [amount, setAmount] = useState<number | ''>('');
    const [type, setType] = useState('expense');
    const [category, setCategory] = useState('Groceries');
    const [description, setDescription] = useState('');
    const [accountId, setAccountId] = useState('');
    const [date, setDate] = useState<Date>(new Date());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initial account selection
    React.useEffect(() => {
        if (accounts && accounts.length > 0 && !accountId) {
            setAccountId(accounts[0].id);
        }
    }, [accounts, accountId]);

    const handleSubmit = async () => {
        if (!amount || !description || !accountId) {
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
            Salary: '#42be65',
            Rent: '#da1e28',
            Shopping: '#ee538b',
        };

        const payload: CreateTransactionInput = {
            amount: Number(amount),
            type: type as any,
            category,
            categoryColor: colorMap[category] || '#a56eff',
            description,
            date: date.toISOString(),
            accountId,
        };

        try {
            const res = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Failed to add transaction');
            }

            // reset
            setAmount('');
            setDescription('');
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
            modalHeading="Add transaction"
            primaryButtonText={isSubmitting ? 'Saving...' : 'Save'}
            secondaryButtonText="Cancel"
            primaryButtonDisabled={isSubmitting}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '1rem' }}>
                {error && <p style={{ color: 'var(--cds-support-error)', fontSize: '0.875rem' }}>{error}</p>}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Select
                        id="txn-type"
                        labelText="Type"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        <SelectItem value="expense" text="Expense" />
                        <SelectItem value="income" text="Income" />
                        <SelectItem value="transfer" text="Transfer" />
                    </Select>
                    <NumberInput
                        id="txn-amount"
                        label="Amount (INR)"
                        value={amount}
                        onChange={(e, { value }) => setAmount(Number(value))}
                        min={0}
                        step={10}
                    />
                </div>

                <Select
                    id="txn-account"
                    labelText="Account"
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                >
                    {accounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id} text={`${acc.name} (${acc.balance})`} />
                    ))}
                </Select>

                <Select
                    id="txn-category"
                    labelText="Category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                    <SelectItem value="Groceries" text="Groceries" />
                    <SelectItem value="Dining" text="Dining" />
                    <SelectItem value="Transport" text="Transport" />
                    <SelectItem value="Salary" text="Salary" />
                    <SelectItem value="Rent" text="Rent" />
                    <SelectItem value="Shopping" text="Shopping" />
                    <SelectItem value="Other" text="Other" />
                </Select>

                <TextInput
                    id="txn-desc"
                    labelText="Description"
                    placeholder="e.g. Weekly grocery shopping"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <DatePicker datePickerType="single" onChange={(dates: Date[]) => setDate(dates[0])} value={date}>
                    <DatePickerInput
                        id="txn-date"
                        placeholder="dd/mm/yyyy"
                        labelText="Date"
                    />
                </DatePicker>
            </div>
        </Modal>
    );
}
