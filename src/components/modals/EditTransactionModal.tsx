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
import type { CreateTransactionInput } from '@/lib/validators';
import type { Account, Transaction } from '@/types';

interface EditTransactionModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    accounts: Account[];
    transaction: Transaction | null;
}

export default function EditTransactionModal({ open, onClose, onSuccess, accounts, transaction }: EditTransactionModalProps): React.JSX.Element {
    const [amount, setAmount] = useState<number | ''>('');
    const [type, setType] = useState('expense');
    const [category, setCategory] = useState('Groceries');
    const [description, setDescription] = useState('');
    const [accountId, setAccountId] = useState('');
    const [date, setDate] = useState<Date>(new Date());
    const [status, setStatus] = useState<Transaction['status']>('confirmed');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (transaction && open) {
            setAmount(transaction.amount);
            setType(transaction.type);
            setCategory(transaction.category);
            setDescription(transaction.description);
            setAccountId(transaction.accountId);
            setDate(new Date(transaction.date));
            setStatus(transaction.status);
        }
    }, [transaction, open]);

    const handleSubmit = async () => {
        if (!amount || !description || !accountId || !transaction) {
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
            status,
        };

        try {
            const res = await fetch(`/api/transactions/${transaction.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Failed to edit transaction');
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
            modalHeading="Edit transaction"
            primaryButtonText={isSubmitting ? 'Saving...' : 'Save'}
            secondaryButtonText="Cancel"
            primaryButtonDisabled={isSubmitting}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '1rem' }}>
                {error && <p style={{ color: 'var(--cds-support-error)', fontSize: '0.875rem' }}>{error}</p>}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Select
                        id="edit-txn-type"
                        labelText="Type"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        <SelectItem value="expense" text="Expense" />
                        <SelectItem value="income" text="Income" />
                        <SelectItem value="transfer" text="Transfer" />
                    </Select>
                    <NumberInput
                        id="edit-txn-amount"
                        label="Amount (INR)"
                        value={amount}
                        onChange={(e, { value }) => setAmount(Number(value))}
                        min={0}
                        step={10}
                    />
                </div>

                <Select
                    id="edit-txn-account"
                    labelText="Account"
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                >
                    {accounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id} text={`${acc.name} (${acc.balance})`} />
                    ))}
                </Select>

                <Select
                    id="edit-txn-category"
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
                    id="edit-txn-desc"
                    labelText="Description"
                    placeholder="e.g. Weekly grocery shopping"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <Select
                    id="edit-txn-status"
                    labelText="Status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                >
                    <SelectItem value="confirmed" text="Confirmed" />
                    <SelectItem value="pending" text="Pending Review" />
                    <SelectItem value="flagged" text="Flagged / Disputed" />
                </Select>

                <DatePicker datePickerType="single" onChange={(dates: Date[]) => setDate(dates[0])} value={date}>
                    <DatePickerInput
                        id="edit-txn-date"
                        placeholder="dd/mm/yyyy"
                        labelText="Date"
                    />
                </DatePicker>
            </div>
        </Modal>
    );
}
