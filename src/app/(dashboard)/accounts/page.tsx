/**
 * Copyright (c) 2026 Kunji Finance.
 * All rights reserved.
 * This code is proprietary and confidential.
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
    Button,
    OverflowMenu,
    OverflowMenuItem,
    Toggle,
    ToastNotification,
    DataTable,
    Table,
    TableHead,
    TableRow,
    TableHeader,
    TableBody,
    TableCell,
    TableToolbar,
    TableToolbarContent,
    TableToolbarSearch,
    Tag,
} from '@carbon/react';
import { Add, Wallet, Renew } from '@carbon/icons-react';
import { useApi } from '@/hooks/useApi';
import type { Account } from '@/types';
import { InlineLoading } from '@carbon/react';
import { formatCurrency, formatDate } from '@/lib/utils';
import AddAccountModal from '@/components/modals/AddAccountModal';
import EditAccountModal from '@/components/modals/EditAccountModal';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import EmptyState from '@/components/common/EmptyState';

/** Column header definitions for the accounts DataTable. */
const HEADERS = [
    { key: 'name', header: 'Account Name' },
    { key: 'institution', header: 'Institution' },
    { key: 'type', header: 'Type' },
    { key: 'balance', header: 'Balance' },
    { key: 'lastUpdated', header: 'Last Updated' },
    { key: 'sync', header: 'Sync Status' },
    { key: 'actions', header: '' },
];

/**
 * Represents the result of a sync operation for one account.
 */
interface SyncResultItem {
    accountId: string;
    accountName: string;
    newCount: number;
    dupCount: number;
    status: 'completed' | 'failed';
    errorMsg?: string;
}

/**
 * AccountsPage displays all user financial accounts with edit, delete, and sync actions.
 *
 * @returns JSX element for the accounts page.
 */
export default function AccountsPage(): React.JSX.Element {
    const { data: accounts, isLoading, mutate } = useApi<Account[]>('/api/accounts');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Edit state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [accountToEdit, setAccountToEdit] = useState<Account | null>(null);

    // Delete state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

    // Sync state
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncingAccountId, setSyncingAccountId] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastKind, setToastKind] = useState<'success' | 'error' | 'info'>('success');

    const handleEditClick = (account: Account): void => {
        setAccountToEdit(account);
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = (account: Account): void => {
        setAccountToDelete(account);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async (): Promise<void> => {
        if (!accountToDelete) return;
        try {
            await fetch(`/api/accounts/${accountToDelete.id}`, { method: 'DELETE' });
            mutate();
        } catch (_e) {
            // Error handled by browser
        } finally {
            setIsDeleteModalOpen(false);
            setAccountToDelete(null);
        }
    };

    const handleToggleConnect = async (account: Account): Promise<void> => {
        try {
            await fetch(`/api/accounts/${account.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: account.name,
                    type: account.type,
                    balance: account.balance,
                    currency: account.currency,
                    institution: account.institution,
                    color: account.color,
                    isConnected: !account.isConnected,
                }),
            });
            mutate();
        } catch (_e) {
            // Error handled
        }
    };

    const handleSyncSingle = useCallback(async (accountId: string): Promise<void> => {
        setSyncingAccountId(accountId);
        try {
            const res = await fetch('/api/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accountId }),
            });
            const data = await res.json();
            if (data.results && data.results.length > 0) {
                const r: SyncResultItem = data.results[0];
                if (r.status === 'completed') {
                    setToastKind('success');
                    setToastMessage(`${r.accountName}: ${r.newCount} new transaction${r.newCount !== 1 ? 's' : ''} synced, ${r.dupCount} duplicate${r.dupCount !== 1 ? 's' : ''} skipped`);
                } else {
                    setToastKind('error');
                    setToastMessage(`Sync failed for ${r.accountName}: ${r.errorMsg || 'Unknown error'}`);
                }
            }
            mutate();
        } catch (_e) {
            setToastKind('error');
            setToastMessage('Sync failed. Please try again.');
        } finally {
            setSyncingAccountId(null);
        }
    }, [mutate]);

    const handleSyncAll = useCallback(async (): Promise<void> => {
        setIsSyncing(true);
        try {
            const res = await fetch('/api/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            });
            const data = await res.json();
            if (data.results) {
                const results: SyncResultItem[] = data.results;
                if (results.length === 0) {
                    setToastKind('info');
                    setToastMessage('No connected accounts to sync. Enable sync on an account first.');
                } else {
                    const totalNew = results.reduce((sum: number, r: SyncResultItem) => sum + r.newCount, 0);
                    const totalDup = results.reduce((sum: number, r: SyncResultItem) => sum + r.dupCount, 0);
                    const failed = results.filter((r: SyncResultItem) => r.status === 'failed').length;
                    if (failed > 0) {
                        setToastKind('error');
                        setToastMessage(`Sync completed with errors. ${totalNew} new, ${totalDup} duplicates, ${failed} failed.`);
                    } else {
                        setToastKind('success');
                        setToastMessage(`Sync completed: ${totalNew} new transaction${totalNew !== 1 ? 's' : ''}, ${totalDup} duplicate${totalDup !== 1 ? 's' : ''} skipped.`);
                    }
                }
            }
            mutate();
        } catch (_e) {
            setToastKind('error');
            setToastMessage('Sync failed. Please try again.');
        } finally {
            setIsSyncing(false);
        }
    }, [mutate]);

    const filteredAccounts = useMemo(() => {
        if (!accounts) return [];
        return accounts.filter((acc) => {
            const query = searchTerm.toLowerCase();
            return (
                acc.name.toLowerCase().includes(query) ||
                acc.institution.toLowerCase().includes(query) ||
                acc.type.toLowerCase().includes(query)
            );
        });
    }, [accounts, searchTerm]);

    const rows = useMemo(() => {
        return filteredAccounts.map((acc) => ({
            id: acc.id,
            name: acc.name,
            institution: acc.institution,
            type: acc.type.charAt(0).toUpperCase() + acc.type.slice(1),
            balance: formatCurrency(acc.balance),
            lastUpdated: formatDate(acc.lastUpdated),
            color: acc.color,
            balanceRaw: acc.balance,
        }));
    }, [filteredAccounts]);

    if (isLoading || !accounts) {
        return (
            <div className="kunji-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <InlineLoading description="Loading accounts..." />
            </div>
        );
    }

    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const hasConnectedAccounts = accounts.some((acc) => acc.isConnected);

    return (
        <div className="kunji-page">
            {toastMessage && (
                <div style={{ position: 'fixed', top: '4rem', right: '1.5rem', zIndex: 9000 }}>
                    <ToastNotification
                        kind={toastKind}
                        title={toastKind === 'success' ? 'Sync completed' : toastKind === 'error' ? 'Sync error' : 'Sync info'}
                        subtitle={toastMessage}
                        timeout={5000}
                        onClose={() => setToastMessage(null)}
                    />
                </div>
            )}

            <div className="kunji-page__header kunji-page__header--split">
                <div>
                    <h1 className="kunji-page__title">Accounts</h1>
                    <p className="kunji-page__subtitle">
                        Total balance: {formatCurrency(totalBalance)}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {hasConnectedAccounts && (
                        <Button
                            kind="tertiary"
                            renderIcon={Renew}
                            size="md"
                            onClick={handleSyncAll}
                            disabled={isSyncing}
                        >
                            {isSyncing ? 'Syncing...' : 'Sync accounts'}
                        </Button>
                    )}
                    <Button kind="primary" renderIcon={Add} size="md" onClick={() => setIsAddModalOpen(true)}>
                        Add account
                    </Button>
                </div>
            </div>

            {accounts.length === 0 ? (
                <EmptyState
                    icon={<Wallet size={48} />}
                    title="No accounts found"
                    description="You haven't added any financial accounts yet. Add your first account to start tracking your net worth."
                    actionLabel="Add account"
                    onAction={() => setIsAddModalOpen(true)}
                />
            ) : (
                <div className="kunji-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <DataTable rows={rows} headers={HEADERS} isSortable>
                        {({
                            rows: tableRows,
                            headers,
                            getHeaderProps,
                            getRowProps,
                            getTableProps,
                        }: any) => (
                            <>
                                <TableToolbar aria-label="Accounts table toolbar">
                                    <TableToolbarContent>
                                        <TableToolbarSearch
                                            placeholder="Search accounts..."
                                            onChange={(_e: unknown, value?: string) => setSearchTerm(value ?? '')}
                                            persistent
                                        />
                                    </TableToolbarContent>
                                </TableToolbar>

                                {filteredAccounts.length === 0 ? (
                                    <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--cds-text-secondary)' }}>
                                        <p style={{ fontSize: '0.9375rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                                            No results match your search
                                        </p>
                                        <Button kind="ghost" size="sm" onClick={() => setSearchTerm('')}>
                                            Clear search
                                        </Button>
                                    </div>
                                ) : (
                                    <Table {...getTableProps()} aria-label="Accounts table">
                                        <TableHead>
                                            <TableRow>
                                                {headers.map((header: { key: string; header: string }) => (
                                                    <TableHeader {...getHeaderProps({ header })} key={header.key}>
                                                        {header.header}
                                                    </TableHeader>
                                                ))}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {tableRows.map((row: { id: string; cells: Array<{ id: string; value: string | number }> }) => {
                                                const originalAcc = accounts.find((a) => a.id === row.id);
                                                const isThisSyncing = syncingAccountId === originalAcc?.id;

                                                return (
                                                    <TableRow {...getRowProps({ row })} key={row.id}>
                                                        {row.cells.map((cell: { id: string; value: string | number }) => {
                                                            if (cell.id.endsWith(':name') && originalAcc) {
                                                                return (
                                                                    <TableCell key={cell.id}>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: originalAcc.color, flexShrink: 0 }} aria-hidden="true" />
                                                                            <span style={{ fontWeight: 600 }}>{cell.value}</span>
                                                                        </div>
                                                                    </TableCell>
                                                                );
                                                            }
                                                            if (cell.id.endsWith(':type')) {
                                                                return (
                                                                    <TableCell key={cell.id}>
                                                                        <Tag type="cool-gray" size="sm">{cell.value}</Tag>
                                                                    </TableCell>
                                                                );
                                                            }
                                                            if (cell.id.endsWith(':balance') && originalAcc) {
                                                                return (
                                                                    <TableCell key={cell.id}>
                                                                        <span style={{
                                                                            fontWeight: 600,
                                                                            color: originalAcc.balance >= 0 ? 'var(--cds-support-success)' : 'var(--cds-support-error)',
                                                                        }}>
                                                                            {cell.value}
                                                                        </span>
                                                                    </TableCell>
                                                                );
                                                            }
                                                            if (cell.id.endsWith(':sync') && originalAcc) {
                                                                return (
                                                                    <TableCell key={cell.id}>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                                            <Toggle
                                                                                id={`sync-toggle-${originalAcc.id}`}
                                                                                labelText=""
                                                                                labelA="Off"
                                                                                labelB="Sync"
                                                                                size="sm"
                                                                                toggled={originalAcc.isConnected}
                                                                                onToggle={() => handleToggleConnect(originalAcc)}
                                                                                aria-label={`Enable sync for ${originalAcc.name}`}
                                                                                style={{ minWidth: '40px' }}
                                                                            />
                                                                            {isThisSyncing && (
                                                                                <InlineLoading description="Syncing..." />
                                                                            )}
                                                                        </div>
                                                                    </TableCell>
                                                                );
                                                            }
                                                            if (cell.id.endsWith(':actions') && originalAcc) {
                                                                return (
                                                                    <TableCell key={cell.id} style={{ width: '48px' }}>
                                                                        <OverflowMenu size="sm" flipped ariaLabel={`Actions for ${originalAcc.name}`}>
                                                                            <OverflowMenuItem
                                                                                itemText="Edit"
                                                                                onClick={() => handleEditClick(originalAcc)}
                                                                            />
                                                                            {originalAcc.isConnected && (
                                                                                <OverflowMenuItem
                                                                                    itemText={isThisSyncing ? 'Syncing...' : 'Sync now'}
                                                                                    disabled={isThisSyncing}
                                                                                    onClick={() => handleSyncSingle(originalAcc.id)}
                                                                                />
                                                                            )}
                                                                            <OverflowMenuItem
                                                                                itemText="Delete"
                                                                                isDelete
                                                                                onClick={() => handleDeleteClick(originalAcc)}
                                                                            />
                                                                        </OverflowMenu>
                                                                    </TableCell>
                                                                );
                                                            }
                                                            return <TableCell key={cell.id}>{cell.value}</TableCell>;
                                                        })}
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                )}
                            </>
                        )}
                    </DataTable>
                </div>
            )}

            <AddAccountModal
                open={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => {
                    setIsAddModalOpen(false);
                    mutate();
                }}
            />

            <EditAccountModal
                open={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setAccountToEdit(null);
                }}
                onSuccess={() => {
                    setIsEditModalOpen(false);
                    setAccountToEdit(null);
                    mutate();
                }}
                account={accountToEdit}
            />

            <ConfirmationModal
                open={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setAccountToDelete(null);
                }}
                onConfirm={confirmDelete}
                title="Delete account?"
                message={`Are you sure you want to delete "${accountToDelete?.name || ''}"? All associated transactions will remain but will no longer be linked to this account. This action cannot be undone.`}
                confirmLabel="Delete"
                danger={true}
            />
        </div>
    );
}
