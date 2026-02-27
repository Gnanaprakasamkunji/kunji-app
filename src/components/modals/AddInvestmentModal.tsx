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
import type { CreateInvestmentInput } from '@/lib/validators';

interface AddInvestmentModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddInvestmentModal({ open, onClose, onSuccess }: AddInvestmentModalProps): React.JSX.Element {
    const [name, setName] = useState('');
    const [type, setType] = useState('stocks');
    const [purchasePrice, setPurchasePrice] = useState<number | ''>('');
    const [currentValue, setCurrentValue] = useState<number | ''>('');
    const [units, setUnits] = useState<number | ''>('');
    const [purchaseDate, setPurchaseDate] = useState<Date>(new Date());
    const [color, setColor] = useState('#0f62fe');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!name || !purchasePrice || !currentValue) {
            setError('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        const payload: CreateInvestmentInput = {
            name,
            type: type as any,
            purchasePrice: Number(purchasePrice),
            currentValue: Number(currentValue),
            units: Number(units) || 1,
            purchaseDate: purchaseDate.toISOString(),
            color,
        };

        try {
            const res = await fetch('/api/investments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Failed to add investment');
            }

            setName('');
            setPurchasePrice('');
            setCurrentValue('');
            setUnits('');
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
            modalHeading="Add Investment"
            primaryButtonText={isSubmitting ? 'Saving...' : 'Save investment'}
            secondaryButtonText="Cancel"
            primaryButtonDisabled={isSubmitting}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '1rem' }}>
                {error && <p style={{ color: 'var(--cds-support-error)', fontSize: '0.875rem' }}>{error}</p>}

                <TextInput
                    id="inv-name"
                    labelText="Asset name"
                    placeholder="e.g. Nifty 50, Reliance"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <Select
                    id="inv-type"
                    labelText="Asset type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                >
                    <SelectItem value="stocks" text="Stocks" />
                    <SelectItem value="bonds" text="Bonds" />
                    <SelectItem value="mutual-fund" text="Mutual Fund" />
                    <SelectItem value="crypto" text="Crypto" />
                    <SelectItem value="etf" text="ETF" />
                </Select>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <NumberInput
                        id="inv-purchase"
                        label="Total invested (INR)"
                        value={purchasePrice}
                        onChange={(e, { value }) => setPurchasePrice(Number(value))}
                        min={0}
                        step={100}
                    />
                    <NumberInput
                        id="inv-current"
                        label="Current value (INR)"
                        value={currentValue}
                        onChange={(e, { value }) => setCurrentValue(Number(value))}
                        min={0}
                        step={100}
                    />
                </div>

                <NumberInput
                    id="inv-units"
                    label="Quantity / Units"
                    value={units}
                    onChange={(e, { value }) => setUnits(Number(value))}
                    min={0}
                    step={1}
                />

                <DatePicker datePickerType="single" onChange={(dates: Date[]) => setPurchaseDate(dates[0])} value={purchaseDate}>
                    <DatePickerInput
                        id="inv-date"
                        placeholder="dd/mm/yyyy"
                        labelText="Purchase date"
                    />
                </DatePicker>

                <Select
                    id="inv-color"
                    labelText="Chart Color"
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
