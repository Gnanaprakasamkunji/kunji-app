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
    Select,
    SelectItem,
    InlineNotification,
} from '@carbon/react';
import { Email, Security } from '@carbon/icons-react';

interface ConnectEmailModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

/**
 * ConnectEmailModal allows users to link their Gmail or Outlook accounts.
 * Uses Carbon components and Kunji styling for a premium feel.
 */
export default function ConnectEmailModal({ open, onClose, onSuccess }: ConnectEmailModalProps): React.JSX.Element {
    const [email, setEmail] = useState('');
    const [provider, setProvider] = useState('google');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!email || !email.includes('@')) {
            setError('Please enter a valid email address.');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const res = await fetch('/api/email-sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, provider }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Failed to connect email');
            }

            setEmail('');
            setProvider('google');
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
            modalHeading="Connect email account"
            primaryButtonText={isSubmitting ? 'Connecting...' : 'Connect'}
            secondaryButtonText="Cancel"
            primaryButtonDisabled={isSubmitting}
            size="md"
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{
                        padding: '0.75rem',
                        backgroundColor: 'var(--cds-layer-02)',
                        borderRadius: '8px',
                        color: 'var(--cds-interactive)'
                    }}>
                        <Email size={24} />
                    </div>
                    <div>
                        <p style={{ color: 'var(--cds-text-primary)', fontWeight: 600, marginBottom: '0.25rem' }}>
                            Automate your tracking
                        </p>
                        <p style={{ color: 'var(--cds-text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                            Securely connect your email to allow Kunji AI to automatically extract receipts and invoices.
                        </p>
                    </div>
                </div>

                {error && (
                    <InlineNotification
                        kind="error"
                        title="Connection Error"
                        subtitle={error}
                        lowContrast
                        hideCloseButton
                    />
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                    <Select
                        id="email-provider"
                        labelText="Provider"
                        value={provider}
                        onChange={(e) => setProvider(e.target.value)}
                    >
                        <SelectItem value="google" text="Google" />
                        <SelectItem value="outlook" text="Outlook" />
                    </Select>

                    <TextInput
                        id="email-address"
                        labelText="Email address"
                        placeholder="e.g., alex@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div style={{
                    marginTop: '0.5rem',
                    padding: '1rem',
                    backgroundColor: 'var(--cds-layer-01)',
                    border: '1px solid var(--cds-border-subtle-01)',
                    borderRadius: '8px',
                    display: 'flex',
                    gap: '0.75rem',
                    alignItems: 'center'
                }}>
                    <Security size={16} style={{ color: 'var(--cds-support-success)' }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--cds-text-helper)' }}>
                        <strong>Privacy guaranteed:</strong> We use official OAuth channels and never store your password.
                    </span>
                </div>
            </div>
        </Modal>
    );
}
