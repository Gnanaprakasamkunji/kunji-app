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
import type { CreateAccountInput } from '@/lib/validators';

interface AddAccountModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddAccountModal({ open, onClose, onSuccess }: AddAccountModalProps): React.JSX.Element {
    const [name, setName] = useState('');
    const [type, setType] = useState('checking');
    const [balance, setBalance] = useState<number | ''>('');
    const [institution, setInstitution] = useState('');
    const [color, setColor] = useState('#0f62fe');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!name || !institution || balance === '') {
            setError('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        const payload: CreateAccountInput = {
            name,
            type: type as any,
            balance: Number(balance),
            currency: 'INR',
            institution,
            color,
        };

        try {
            const res = await fetch('/api/accounts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Failed to create account');
            }

            // reset
            setName('');
            setType('checking');
            setBalance('');
            setInstitution('');
            setColor('#0f62fe');
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
            modalHeading="Add new account"
            primaryButtonText={isSubmitting ? 'Adding...' : 'Add account'}
            secondaryButtonText="Cancel"
            primaryButtonDisabled={isSubmitting}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '1rem' }}>
                {error && <p style={{ color: 'var(--cds-support-error)', fontSize: '0.875rem' }}>{error}</p>}
                <TextInput
                    id="account-name"
                    labelText="Account name"
                    placeholder="e.g. HDFC Savings"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <Select
                    id="account-type"
                    labelText="Account type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                >
                    <SelectItem value="checking" text="Checking" />
                    <SelectItem value="savings" text="Savings" />
                    <SelectItem value="credit" text="Credit Card" />
                    <SelectItem value="investment" text="Investment" />
                    <SelectItem value="cash" text="Cash" />
                </Select>
                <NumberInput
                    id="account-balance"
                    label="Current balance (INR)"
                    value={balance}
                    onChange={(e, { value }) => setBalance(Number(value))}
                    min={-1000000000}
                    max={1000000000}
                    step={100}
                />
                <TextInput
                    id="account-institution"
                    labelText="Institution"
                    placeholder="e.g. HDFC Bank, SBI"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                />
                <Select
                    id="account-color"
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
        </Modal>
    );
}
