/**
 * Copyright (c) 2026 Kunji Finance.
 * All rights reserved.
 * This code is proprietary and confidential.
 */

'use client';

import React, { useState } from 'react';
import {
    TextInput,
    Toggle,
    Button,
    Select,
    SelectItem,
    ToastNotification,
    Tag,
    StructuredListWrapper,
    StructuredListHead,
    StructuredListRow,
    StructuredListCell,
    StructuredListBody,
} from '@carbon/react';
import { Logout, Email, Renew, TrashCan } from '@carbon/icons-react';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useApi } from '@/hooks/useApi';
import type { ConnectedEmail } from '@/types';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import ConnectEmailModal from '@/components/modals/ConnectEmailModal';

/**
 * SettingsPage provides user profile settings and preferences.
 * Includes interactive states and feedback notifications.
 *
 * @returns JSX element for the settings page.
 */
export default function SettingsPage(): React.JSX.Element {
    const { data: session } = useSession();
    const { theme, setTheme } = useTheme();
    const { data: connectedEmails, isLoading: isEmailsLoading, mutate: mutateEmails } = useApi<ConnectedEmail[]>('/api/email-sync');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
    const [emailToDelete, setEmailToDelete] = useState<string | null>(null);
    const [isSyncing, setIsSyncing] = useState<Record<string, boolean>>({});
    const [toast, setToast] = useState<{ title: string; subtitle: string; kind: 'success' | 'info' | 'error' | 'warning' } | null>(null);

    // Helpers to show notifications
    const showToast = (title: string, subtitle: string, kind: 'success' | 'info' | 'error' | 'warning' = 'success') => {
        setToast({ title, subtitle, kind });
        setTimeout(() => setToast(null), 4000);
    };

    // Event Handlers
    const handleEditProfile = () => {
        showToast('Profile action', 'Edit profile feature is coming soon.', 'info');
    };

    const handleExportData = () => {
        showToast('Export Started', 'Your data is being prepared for download.');
    };

    const handleDeleteAccount = () => {
        setIsDeleteModalOpen(false);
        showToast('Account Deleted', 'Your account deletion request has been processed.', 'error');
        // In a real app, this would trigger an API call then signOut()
    };

    const handlePreferenceChange = (name: string) => {
        showToast('Preference Updated', `${name} preference saved successfully.`);
    };

    const handleDisconnectEmail = async () => {
        if (!emailToDelete) return;
        try {
            const res = await fetch(`/api/email-sync/${emailToDelete}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to disconnect email');

            showToast('Email Disconnected', 'The email account has been removed.', 'success');
            mutateEmails();
        } catch (err: unknown) {
            showToast('Disconnection Failed', 'Something went wrong while disconnecting.', 'error');
            void err;
        } finally {
            setEmailToDelete(null);
        }
    };

    const handleSyncEmail = async (id: string, email: string) => {
        setIsSyncing(prev => ({ ...prev, [id]: true }));
        try {
            const res = await fetch('/api/email-sync/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ connectionId: id }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to sync');

            showToast(`Sync Complete: ${email}`, data.message || 'Transactions updated successfully', 'success');
            mutateEmails();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Unknown error';
            showToast(`Sync Failed: ${email}`, msg, 'error');
        } finally {
            setIsSyncing(prev => ({ ...prev, [id]: false }));
        }
    };

    return (
        <>
            <div className="kunji-page" style={{ position: 'relative' }}>
                {/* Global Notification Toast */}
                {toast && (
                    <div style={{ position: 'fixed', top: '5rem', right: '2rem', zIndex: 9000, animation: 'slideUpFade 0.3s ease-out' }}>
                        <ToastNotification
                            kind={toast.kind}
                            title={toast.title}
                            subtitle={toast.subtitle}
                            caption=""
                            timeout={4000}
                            onCloseButtonClick={() => setToast(null)}
                        />
                    </div>
                )}

                <div className="kunji-page__header">
                    <h1 className="kunji-page__title">Settings</h1>
                    <p className="kunji-page__subtitle">
                        Manage your account and preferences
                    </p>
                </div>

                <div className="kunji-settings">
                    {/* Profile Section */}
                    <section className="kunji-settings__section">
                        <h2 className="kunji-settings__section-title">Profile</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <TextInput
                                id="settings-name"
                                labelText="Full name"
                                value={session?.user?.name || 'Guest User'}
                                readOnly
                            />
                            <TextInput
                                id="settings-email"
                                labelText="Email"
                                value={session?.user?.email || 'guest@example.com'}
                                readOnly
                            />
                            <Button kind="tertiary" size="sm" onClick={handleEditProfile}>
                                Edit profile
                            </Button>
                        </div>
                    </section>

                    {/* Preferences Section */}
                    <section className="kunji-settings__section">
                        <h2 className="kunji-settings__section-title">Preferences</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <Select
                                id="settings-currency"
                                labelText="Default currency"
                                defaultValue="INR"
                                onChange={() => handlePreferenceChange('Currency')}
                            >
                                <SelectItem value="INR" text="Indian Rupee (₹)" />
                                <SelectItem value="USD" text="US Dollar ($)" />
                                <SelectItem value="EUR" text="Euro (€)" />
                                <SelectItem value="GBP" text="British Pound (£)" />
                            </Select>

                            <Toggle
                                id="settings-dark-mode"
                                labelText="Dark mode"
                                labelA="Off"
                                labelB="On"
                                toggled={theme === 'dark'}
                                aria-label="Toggle dark mode"
                                onToggle={(checked: boolean) => {
                                    setTheme(checked ? 'dark' : 'light');
                                    handlePreferenceChange('Dark mode');
                                }}
                            />

                            <Toggle
                                id="settings-notifications"
                                labelText="Budget alert notifications"
                                labelA="Off"
                                labelB="On"
                                defaultToggled={true}
                                aria-label="Toggle budget notifications"
                                onToggle={() => handlePreferenceChange('Notifications')}
                            />

                            <Toggle
                                id="settings-insights"
                                labelText="AI insights"
                                labelA="Off"
                                labelB="On"
                                defaultToggled={true}
                                aria-label="Toggle AI insights"
                                onToggle={() => handlePreferenceChange('AI insights')}
                            />
                        </div>
                    </section>

                    {/* Data Section */}
                    <section className="kunji-settings__section">
                        <h2 className="kunji-settings__section-title">Data & privacy</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <Button kind="tertiary" size="sm" onClick={handleExportData}>
                                Export my data
                            </Button>
                            <Button kind="danger--tertiary" size="sm" onClick={() => setIsDeleteModalOpen(true)}>
                                Delete my account
                            </Button>
                        </div>
                    </section>

                    {/* Connected Accounts Section */}
                    <section className="kunji-settings__section" style={{ borderTop: '1px solid var(--cds-border-subtle-01)', paddingTop: '2.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div>
                                <h2 className="kunji-settings__section-title" style={{ marginBottom: '0.5rem' }}>Connected Accounts</h2>
                                <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                                    Connect your email to allow Kunji AI to automatically track your expenses and income from receipts.
                                </p>
                            </div>
                            <Button renderIcon={Email} size="sm" onClick={() => setIsConnectModalOpen(true)}>
                                Connect email
                            </Button>
                        </div>

                        {!isEmailsLoading && connectedEmails && connectedEmails.length > 0 ? (
                            <StructuredListWrapper aria-label="Connected email accounts">
                                <StructuredListHead>
                                    <StructuredListRow head>
                                        <StructuredListCell head>Email Account</StructuredListCell>
                                        <StructuredListCell head>Provider</StructuredListCell>
                                        <StructuredListCell head>Status</StructuredListCell>
                                        <StructuredListCell head>Last Sync</StructuredListCell>
                                        <StructuredListCell head></StructuredListCell>
                                    </StructuredListRow>
                                </StructuredListHead>
                                <StructuredListBody>
                                    {connectedEmails.map((conn) => (
                                        <StructuredListRow key={conn.id}>
                                            <StructuredListCell style={{ fontWeight: 600 }}>{conn.email}</StructuredListCell>
                                            <StructuredListCell style={{ textTransform: 'capitalize' }}>{conn.provider}</StructuredListCell>
                                            <StructuredListCell>
                                                {conn.syncStatus === 'success' && <Tag type="green" size="sm">Synced</Tag>}
                                                {conn.syncStatus === 'syncing' && <Tag type="blue" size="sm">Syncing...</Tag>}
                                                {conn.syncStatus === 'idle' && <Tag type="gray" size="sm">Idle</Tag>}
                                                {conn.syncStatus === 'error' && <Tag type="red" size="sm">Error</Tag>}
                                            </StructuredListCell>
                                            <StructuredListCell>
                                                {conn.lastSyncAt ? new Date(conn.lastSyncAt).toLocaleString() : 'Never'}
                                            </StructuredListCell>
                                            <StructuredListCell style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                                    <Button
                                                        kind="ghost"
                                                        size="sm"
                                                        hasIconOnly
                                                        renderIcon={Renew}
                                                        iconDescription="Sync now"
                                                        tooltipPosition="left"
                                                        onClick={() => handleSyncEmail(conn.id, conn.email)}
                                                        disabled={isSyncing[conn.id] || conn.syncStatus === 'syncing'}
                                                    />
                                                    <Button
                                                        kind="danger--ghost"
                                                        size="sm"
                                                        hasIconOnly
                                                        renderIcon={TrashCan}
                                                        iconDescription="Disconnect"
                                                        tooltipPosition="left"
                                                        onClick={() => setEmailToDelete(conn.id)}
                                                        disabled={isSyncing[conn.id]}
                                                    />
                                                </div>
                                            </StructuredListCell>
                                        </StructuredListRow>
                                    ))}
                                </StructuredListBody>
                            </StructuredListWrapper>
                        ) : (
                            !isEmailsLoading && (
                                <div style={{
                                    padding: '2rem',
                                    border: '1px dashed var(--cds-border-strong-01)',
                                    borderRadius: '4px',
                                    textAlign: 'center',
                                    backgroundColor: 'var(--cds-layer-01)'
                                }}>
                                    <Email size={32} style={{ color: 'var(--cds-text-helper)', marginBottom: '1rem' }} />
                                    <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>No accounts connected</p>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                                        Connect your Gmail or Outlook to automate your tracking.
                                    </p>
                                </div>
                            )
                        )}
                    </section>

                    {/* Logout */}
                    <div>
                        <Button
                            kind="secondary"
                            renderIcon={Logout}
                            size="md"
                            onClick={() => signOut({ callbackUrl: '/' })}
                        >
                            Sign out
                        </Button>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            <ConfirmationModal
                open={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteAccount}
                title="Delete account"
                message="Are you sure you want to delete your Kunji account? All your financial data, budgets, and insights will be permanently removed. This action cannot be undone."
                confirmLabel="Delete account"
                danger={true}
            />

            <ConfirmationModal
                open={!!emailToDelete}
                onClose={() => setEmailToDelete(null)}
                onConfirm={handleDisconnectEmail}
                title="Disconnect email"
                message="Are you sure you want to disconnect this email address? Kunji will no longer track receipts from this account."
                confirmLabel="Disconnect"
                danger={true}
            />

            <ConnectEmailModal
                open={isConnectModalOpen}
                onClose={() => setIsConnectModalOpen(false)}
                onSuccess={() => {
                    setIsConnectModalOpen(false);
                    showToast('Connection Successful', 'We are now securely importing records from your email.', 'success');
                    mutateEmails();
                }}
            />
        </>
    );
}
