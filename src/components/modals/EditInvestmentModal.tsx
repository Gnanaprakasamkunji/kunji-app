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
import type { Investment } from '@/types';

/**
 * Props for the EditInvestmentModal component.
 */
interface EditInvestmentModalProps {
    /** Whether the modal is open. */
    open: boolean;
    /** The investment to edit. */
    investment: Investment | null;
    /** Handler called when the modal is closed. */
    onClose: () => void;
    /** Handler called after a successful update. */
    onSuccess: () => void;
}

/**
 * EditInvestmentModal allows editing an existing investment holding.
 *
 * @param props - EditInvestmentModal component props.
 * @returns JSX element for the edit investment modal.
 */
export default function EditInvestmentModal({
    open,
    investment,
    onClose,
    onSuccess,
}: EditInvestmentModalProps): React.JSX.Element {
    const [name, setName] = useState('');
    const [type, setType] = useState('stocks');
    const [purchasePrice, setPurchasePrice] = useState<number | ''>(0);
    const [currentValue, setCurrentValue] = useState<number | ''>(0);
    const [units, setUnits] = useState<number | ''>(1);
    const [purchaseDate, setPurchaseDate] = useState<Date>(new Date());
    const [color, setColor] = useState('#0f62fe');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Populate form when investment changes
    useEffect(() => {
        if (investment) {
            setName(investment.name);
            setType(investment.type);
            setPurchasePrice(investment.purchasePrice);
            setCurrentValue(investment.currentValue);
            setUnits(investment.units);
            setPurchaseDate(new Date(investment.purchaseDate));
            setColor(investment.color);
            setError(null);
        }
    }, [investment]);

    /**
     * Submits the updated investment to the API.
     */
    const handleSubmit = async (): Promise<void> => {
        if (!investment) return;

        if (!name || !purchasePrice || !currentValue) {
            setError('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const res = await fetch(`/api/investments/${investment.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    type,
                    purchasePrice: Number(purchasePrice),
                    currentValue: Number(currentValue),
                    units: Number(units) || 1,
                    purchaseDate: purchaseDate.toISOString(),
                    color,
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Failed to update investment');
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
            modalHeading="Edit Investment"
            primaryButtonText={isSubmitting ? 'Saving...' : 'Save changes'}
            secondaryButtonText="Cancel"
            primaryButtonDisabled={isSubmitting}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '1rem' }}>
                {error && <p style={{ color: 'var(--cds-support-error)', fontSize: '0.875rem' }}>{error}</p>}

                <TextInput
                    id="edit-inv-name"
                    labelText="Asset name"
                    placeholder="e.g. Nifty 50, Reliance"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <Select
                    id="edit-inv-type"
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
                        id="edit-inv-purchase"
                        label="Total invested (INR)"
                        value={purchasePrice}
                        onChange={(_e, { value }) => setPurchasePrice(Number(value))}
                        min={0}
                        step={100}
                    />
                    <NumberInput
                        id="edit-inv-current"
                        label="Current value (INR)"
                        value={currentValue}
                        onChange={(_e, { value }) => setCurrentValue(Number(value))}
                        min={0}
                        step={100}
                    />
                </div>

                <NumberInput
                    id="edit-inv-units"
                    label="Quantity / Units"
                    value={units}
                    onChange={(_e, { value }) => setUnits(Number(value))}
                    min={0}
                    step={1}
                />

                <DatePicker datePickerType="single" onChange={(dates: Date[]) => setPurchaseDate(dates[0])} value={purchaseDate}>
                    <DatePickerInput
                        id="edit-inv-date"
                        placeholder="dd/mm/yyyy"
                        labelText="Purchase date"
                    />
                </DatePicker>

                <Select
                    id="edit-inv-color"
                    labelText="Chart color"
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
