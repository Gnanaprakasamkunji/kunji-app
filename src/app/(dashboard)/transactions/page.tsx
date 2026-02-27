/**
 * Copyright (c) 2026 Kunji Finance.
 * All rights reserved.
 * This code is proprietary and confidential.
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Transaction, Account } from '@/types';
import AddTransactionModal from '@/components/modals/AddTransactionModal';
import EditTransactionModal from '@/components/modals/EditTransactionModal';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import EmptyState from '@/components/common/EmptyState';
import DonutChart from '@/components/common/DonutChart';
import type { DonutSlice } from '@/components/common/DonutChart';
import {
    DataTable,
    Table,
    TableHead,
    TableRow,
    TableHeader,
    TableBody,
    TableCell,
    TableContainer,
    TableToolbar,
    TableToolbarContent,
    TableToolbarSearch,
    Button,
    Tag,
    TableSelectAll,
    TableSelectRow,
    TableBatchActions,
    TableBatchAction,
    OverflowMenu,
    OverflowMenuItem,
    Dropdown,
    DatePicker,
    DatePickerInput,
} from '@carbon/react';
import { Add, Download, Receipt, TrashCan, Calendar } from '@carbon/icons-react';
import { useApi } from '@/hooks/useApi';
import { InlineLoading } from '@carbon/react';

/**
 * Table header definitions for the transactions data table.
 */
const HEADERS = [
    { key: 'date', header: 'Date' },
    { key: 'description', header: 'Description' },
    { key: 'category', header: 'Category' },
    { key: 'account', header: 'Account' },
    { key: 'amount', header: 'Amount' },
    { key: 'overflow', header: '' },
];

/**
 * Type filter options for the transactions dropdown.
 */
const TYPE_ITEMS = [
    { id: 'all', text: 'All Types' },
    { id: 'income', text: 'Income' },
    { id: 'expense', text: 'Expense' },
    { id: 'transfer', text: 'Transfer' },
];

/**
 * Category filter options for the transactions dropdown.
 */
const CATEGORY_ITEMS = [
    { id: 'all', text: 'All Categories' },
    { id: 'Groceries', text: 'Groceries' },
    { id: 'Dining', text: 'Dining' },
    { id: 'Transport', text: 'Transport' },
    { id: 'Salary', text: 'Salary' },
    { id: 'Rent', text: 'Rent' },
    { id: 'Shopping', text: 'Shopping' },
    { id: 'Entertainment', text: 'Entertainment' },
    { id: 'Subscriptions', text: 'Subscriptions' },
    { id: 'Other', text: 'Other' },
];

/**
 * TransactionsPage displays a searchable, sortable, filterable transactions table
 * with date range filtering, CSV export, batch delete, and edit/delete per row.
 *
 * @returns JSX element for the transactions page.
 */
export default function TransactionsPage(): React.JSX.Element {
    const [searchText, setSearchText] = useState<string>('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [filterType, setFilterType] = useState<string>('all');
    const [filterCategory, setFilterCategory] = useState<string>('all');

    // Date range filter
    const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);

    // Edit state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);

    // Single delete state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);

    // Batch delete state
    const [isBatchDeleteModalOpen, setIsBatchDeleteModalOpen] = useState(false);
    const [batchDeleteIds, setBatchDeleteIds] = useState<string[]>([]);
    const [batchClearSelection, setBatchClearSelection] = useState<(() => void) | null>(null);
    const [isBatchConfirming, setIsBatchConfirming] = useState(false);
    const [isRowUpdating, setIsRowUpdating] = useState<Record<string, boolean>>({});

    const { data: transactions, isLoading, mutate } = useApi<Transaction[]>('/api/transactions');
    const { data: accounts } = useApi<Account[]>('/api/accounts');

    /**
     * Filters transactions based on search text, type, category, and date range.
     */
    const filteredTransactions = useMemo((): Transaction[] => {
        if (!transactions) return [];

        return transactions.filter((txn) => {
            // Search filter
            if (searchText.trim()) {
                const query = searchText.toLowerCase();
                const matchesSearch =
                    txn.description.toLowerCase().includes(query) ||
                    txn.category.toLowerCase().includes(query) ||
                    txn.accountName.toLowerCase().includes(query);
                if (!matchesSearch) return false;
            }

            // Type filter
            if (filterType !== 'all' && txn.type !== filterType) return false;

            // Category filter
            if (filterCategory !== 'all' && txn.category !== filterCategory) return false;

            // Date range filter
            if (dateRange[0] || dateRange[1]) {
                const txnDate = new Date(txn.date);
                if (dateRange[0] && txnDate < dateRange[0]) return false;
                if (dateRange[1]) {
                    const endOfDay = new Date(dateRange[1]);
                    endOfDay.setHours(23, 59, 59, 999);
                    if (txnDate > endOfDay) return false;
                }
            }

            return true;
        });
    }, [transactions, searchText, filterType, filterCategory, dateRange]);

    const rows = filteredTransactions.map((txn) => ({
        id: txn.id,
        date: formatDate(txn.date),
        description: txn.description,
        category: txn.category,
        categoryColor: txn.categoryColor,
        account: txn.accountName,
        amount: txn.amount,
        type: txn.type,
    }));

    const spendingByCategory = useMemo((): DonutSlice[] => {
        const expenses = filteredTransactions.filter((t) => t.type === 'expense');
        const categories: Record<string, { value: number; color: string }> = {};
        expenses.forEach((t) => {
            if (!categories[t.category]) {
                categories[t.category] = { value: 0, color: t.categoryColor };
            }
            categories[t.category].value += Math.abs(t.amount);
        });
        return Object.entries(categories)
            .map(([name, data]) => ({
                name,
                value: data.value,
                color: data.color,
            }))
            .sort((a, b) => b.value - a.value);
    }, [filteredTransactions]);

    const totalExpenses = spendingByCategory.reduce((sum, item) => sum + item.value, 0);

    /**
     * Opens the edit modal for a given transaction.
     *
     * @param txn - The transaction to edit.
     */
    const handleEditClick = (txn: Transaction): void => {
        setTransactionToEdit(txn);
        setIsEditModalOpen(true);
    };

    /**
     * Opens the delete confirmation modal for a given transaction.
     *
     * @param txn - The transaction to delete.
     */
    const handleDeleteClick = (txn: Transaction): void => {
        setTransactionToDelete(txn);
        setIsDeleteModalOpen(true);
    };

    /**
     * Confirms and executes deletion of the selected transaction.
     */
    const confirmSingleDelete = async (): Promise<void> => {
        if (!transactionToDelete) return;
        try {
            await fetch(`/api/transactions/${transactionToDelete.id}`, { method: 'DELETE' });
            mutate();
        } catch (e: unknown) {
            // Error handled by browser console
        } finally {
            setIsDeleteModalOpen(false);
            setTransactionToDelete(null);
        }
    };

    /**
     * Opens the batch delete confirmation modal.
     *
     * @param selectedRows - Array of selected row objects.
     * @param clearSelection - Callback to clear selection.
     */
    const handleBatchDeleteClick = (selectedRows: { id: string }[], clearSelection: () => void): void => {
        const ids = selectedRows.map((row) => row.id);
        setBatchDeleteIds(ids);
        setBatchClearSelection(() => clearSelection);
        setIsBatchDeleteModalOpen(true);
    };

    /**
     * Confirms and executes batch deletion of selected transactions.
     */
    const confirmBatchDelete = async (): Promise<void> => {
        if (!batchDeleteIds.length) return;
        try {
            await fetch('/api/transactions/batch', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: batchDeleteIds }),
            });
            if (batchClearSelection) batchClearSelection();
            mutate();
        } catch (e: unknown) {
            // Error handled by browser console
        } finally {
            setIsBatchDeleteModalOpen(false);
            setBatchDeleteIds([]);
            setBatchClearSelection(null);
        }
    };

    /**
     * Updates the status of one or more transactions.
     *
     * @param ids - Array of transaction IDs.
     * @param status - The new status to apply.
     */
    const handleUpdateStatus = async (ids: string[], status: 'confirmed' | 'flagged'): Promise<void> => {
        const isBatch = ids.length > 1;
        if (isBatch) setIsBatchConfirming(true);
        else setIsRowUpdating(prev => ({ ...prev, [ids[0]]: true }));

        try {
            if (isBatch) {
                await fetch('/api/transactions/batch', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ids, status }),
                });
            } else {
                await fetch(`/api/transactions/${ids[0]}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status }),
                });
            }

            if (batchClearSelection) batchClearSelection();
            mutate();
        } catch (e: unknown) {
            // Error handled by browser console
        } finally {
            if (isBatch) setIsBatchConfirming(false);
            else setIsRowUpdating(prev => ({ ...prev, [ids[0]]: false }));
        }
    };

    /**
     * Exports the currently filtered transactions as a CSV file download.
     */
    const handleExport = useCallback((): void => {
        if (!filteredTransactions.length) return;

        const csvHeaders = ['Date', 'Description', 'Category', 'Account', 'Type', 'Amount'];
        const csvRows = filteredTransactions.map((txn) => [
            formatDate(txn.date),
            `"${txn.description.replace(/"/g, '""')}"`,
            txn.category,
            txn.accountName,
            txn.type,
            txn.type === 'income' ? txn.amount.toString() : `-${txn.amount}`,
        ]);

        const csvContent = [csvHeaders.join(','), ...csvRows.map((row) => row.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `kunji-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    }, [filteredTransactions]);

    /**
     * Clears all active filters and search text.
     */
    const clearAllFilters = (): void => {
        setSearchText('');
        setFilterType('all');
        setFilterCategory('all');
        setDateRange([null, null]);
    };

    const hasActiveFilters = searchText.trim() || filterType !== 'all' || filterCategory !== 'all' || dateRange[0] || dateRange[1];

    if (isLoading || !transactions) {
        return (
            <div className="kunji-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <InlineLoading description="Loading transactions..." />
            </div>
        );
    }

    return (
        <div className="kunji-page">
            <div className="kunji-page__header kunji-page__header--split">
                <div>
                    <h1 className="kunji-page__title">Transactions</h1>
                    <p className="kunji-page__subtitle">
                        {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''} found
                        {hasActiveFilters && (
                            <span style={{ marginLeft: '0.5rem', fontSize: '0.8125rem' }}>
                                &middot;{' '}
                                <button
                                    onClick={clearAllFilters}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--cds-interactive)',
                                        cursor: 'pointer',
                                        fontSize: '0.8125rem',
                                        fontWeight: 500,
                                        textDecoration: 'underline',
                                        padding: 0,
                                    }}
                                    type="button"
                                >
                                    Clear filters
                                </button>
                            </span>
                        )}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <Button
                        kind="tertiary"
                        renderIcon={Download}
                        size="md"
                        onClick={handleExport}
                        disabled={!filteredTransactions.length}
                    >
                        Export
                    </Button>
                    <Button kind="primary" renderIcon={Add} size="md" onClick={() => setIsAddModalOpen(true)}>
                        Add transaction
                    </Button>
                </div>
            </div>

            {/* Filter bar */}
            <div
                style={{
                    display: 'flex',
                    gap: '0.75rem',
                    alignItems: 'flex-end',
                    flexWrap: 'wrap',
                    marginBottom: '1rem',
                    padding: '1rem 0',
                }}
            >
                <Dropdown
                    id="filter-type"
                    titleText="Type"
                    label="All Types"
                    items={TYPE_ITEMS}
                    itemToString={(item: { id: string; text: string } | null) => (item ? item.text : '')}
                    selectedItem={TYPE_ITEMS.find((i) => i.id === filterType)}
                    onChange={({ selectedItem }: { selectedItem: { id: string; text: string } | null }) =>
                        setFilterType(selectedItem ? selectedItem.id : 'all')
                    }
                    size="sm"
                    style={{ minWidth: '140px' }}
                />
                <Dropdown
                    id="filter-category"
                    titleText="Category"
                    label="All Categories"
                    items={CATEGORY_ITEMS}
                    itemToString={(item: { id: string; text: string } | null) => (item ? item.text : '')}
                    selectedItem={CATEGORY_ITEMS.find((i) => i.id === filterCategory)}
                    onChange={({ selectedItem }: { selectedItem: { id: string; text: string } | null }) =>
                        setFilterCategory(selectedItem ? selectedItem.id : 'all')
                    }
                    size="sm"
                    style={{ minWidth: '160px' }}
                />
                <DatePicker
                    datePickerType="range"
                    onChange={(dates: Date[]) => {
                        setDateRange([dates[0] || null, dates[1] || null]);
                    }}
                    value={dateRange.filter(Boolean) as Date[]}
                >
                    <DatePickerInput
                        id="date-picker-start"
                        labelText="From"
                        placeholder="mm/dd/yyyy"
                        size="sm"
                    />
                    <DatePickerInput
                        id="date-picker-end"
                        labelText="To"
                        placeholder="mm/dd/yyyy"
                        size="sm"
                    />
                </DatePicker>
            </div>

            {filteredTransactions.length === 0 ? (
                <EmptyState
                    icon={<Receipt size={48} />}
                    title={
                        transactions?.length === 0
                            ? 'No transactions found'
                            : 'No results match your filters'
                    }
                    description={
                        transactions?.length === 0
                            ? "You haven't added any transactions yet. Start tracking your income and expenses."
                            : 'Try adjusting your search query, filters, or date range.'
                    }
                    actionLabel={transactions?.length === 0 ? 'Add transaction' : 'Clear filters'}
                    onAction={transactions?.length === 0 ? () => setIsAddModalOpen(true) : clearAllFilters}
                />
            ) : (
                <>
                    {spendingByCategory.length > 0 && (
                        <div style={{ marginBottom: '1.5rem', maxWidth: '500px' }}>
                            <DonutChart
                                title="Spending by category"
                                data={spendingByCategory}
                                centerLabel={formatCurrency(totalExpenses)}
                                centerSubLabel="Total expenses"
                                height={260}
                            />
                        </div>
                    )}
                    <DataTable rows={rows} headers={HEADERS} isSortable>
                        {({
                            rows: tableRows,
                            headers,
                            getHeaderProps,
                            getRowProps,
                            getTableProps,
                            getTableContainerProps,
                            getSelectionProps,
                            getBatchActionProps,
                            selectedRows,
                        }: any) => (
                            <TableContainer {...getTableContainerProps()}>
                                <TableToolbar>
                                    <TableBatchActions {...getBatchActionProps()}>
                                        <TableBatchAction
                                            tabIndex={getBatchActionProps().shouldShowBatchActions ? 0 : -1}
                                            renderIcon={TrashCan}
                                            onClick={() => handleBatchDeleteClick(selectedRows, getBatchActionProps().onCancel)}
                                        >
                                            Delete
                                        </TableBatchAction>
                                        <TableBatchAction
                                            tabIndex={getBatchActionProps().shouldShowBatchActions ? 0 : -1}
                                            renderIcon={Receipt}
                                            onClick={() => handleUpdateStatus(selectedRows.map((r: any) => r.id), 'confirmed')}
                                        >
                                            Confirm
                                        </TableBatchAction>
                                    </TableBatchActions>
                                    <TableToolbarContent>
                                        <TableToolbarSearch
                                            onChange={(event: React.ChangeEvent<HTMLInputElement> | string, newSearchValue?: string) => {
                                                if (typeof newSearchValue === 'string') {
                                                    setSearchText(newSearchValue);
                                                } else if (typeof event !== 'string' && event?.target) {
                                                    setSearchText(event.target.value);
                                                }
                                            }}
                                            placeholder="Search transactions..."
                                            persistent
                                            value={searchText}
                                        />
                                    </TableToolbarContent>
                                </TableToolbar>
                                <Table {...getTableProps()} aria-label="Transactions table">
                                    <TableHead>
                                        <TableRow>
                                            <TableSelectAll {...getSelectionProps()} />
                                            {headers.map((header: any) => (
                                                <TableHeader
                                                    key={header.key}
                                                    {...getHeaderProps({ header })}
                                                >
                                                    {header.header}
                                                </TableHeader>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {tableRows.map((row: any) => {
                                            const originalTxn = filteredTransactions.find(
                                                (t) => t.id === row.id
                                            );
                                            return (
                                                <TableRow key={row.id} {...getRowProps({ row })}>
                                                    <TableSelectRow {...getSelectionProps({ row })} />
                                                    {row.cells.map((cell: any) => {
                                                        if (cell.info.header === 'description' && originalTxn) {
                                                            return (
                                                                <TableCell key={cell.id}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                        <span style={{ fontWeight: 500 }}>{cell.value}</span>
                                                                        {originalTxn.source === 'sync' && (
                                                                            <Tag
                                                                                type={originalTxn.status === 'pending' ? 'high-contrast' : 'magenta'}
                                                                                size="sm"
                                                                                title={originalTxn.status === 'pending' ? 'Requires review' : 'Extracted by AI'}
                                                                            >
                                                                                {originalTxn.status === 'pending' ? 'Pending Review' : 'AI Extracted'}
                                                                            </Tag>
                                                                        )}
                                                                        {originalTxn.status === 'flagged' && (
                                                                            <Tag type="red" size="sm">Flagged</Tag>
                                                                        )}
                                                                    </div>
                                                                </TableCell>
                                                            );
                                                        }
                                                        if (cell.info.header === 'category' && originalTxn) {
                                                            return (
                                                                <TableCell key={cell.id}>
                                                                    <Tag
                                                                        type="cool-gray"
                                                                        size="sm"
                                                                        style={{
                                                                            borderLeft: `3px solid ${originalTxn.categoryColor}`,
                                                                        }}
                                                                    >
                                                                        {cell.value}
                                                                    </Tag>
                                                                </TableCell>
                                                            );
                                                        }
                                                        if (cell.info.header === 'amount' && originalTxn) {
                                                            return (
                                                                <TableCell key={cell.id}>
                                                                    <span
                                                                        style={{
                                                                            fontWeight: 600,
                                                                            color:
                                                                                originalTxn.type === 'income'
                                                                                    ? 'var(--cds-support-success)'
                                                                                    : 'var(--cds-support-error)',
                                                                        }}
                                                                    >
                                                                        {originalTxn.type === 'income' ? '+' : '-'}
                                                                        {formatCurrency(Number(cell.value))}
                                                                    </span>
                                                                </TableCell>
                                                            );
                                                        }
                                                        if (cell.info.header === 'overflow' && originalTxn) {
                                                            return (
                                                                <TableCell key={cell.id} className="cds--table-column-menu">
                                                                    <OverflowMenu flipped size="sm" ariaLabel="Actions" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                                                        {originalTxn.status === 'pending' && (
                                                                            <OverflowMenuItem
                                                                                itemText="Confirm record"
                                                                                onClick={() => handleUpdateStatus([originalTxn.id], 'confirmed')}
                                                                                disabled={isRowUpdating[originalTxn.id]}
                                                                            />
                                                                        )}
                                                                        <OverflowMenuItem
                                                                            itemText="Edit"
                                                                            onClick={() => handleEditClick(originalTxn)}
                                                                        />
                                                                        <OverflowMenuItem
                                                                            itemText="Delete"
                                                                            isDelete
                                                                            onClick={() => handleDeleteClick(originalTxn)}
                                                                        />
                                                                    </OverflowMenu>
                                                                </TableCell>
                                                            );
                                                        }
                                                        return (
                                                            <TableCell key={cell.id}>{cell.value}</TableCell>
                                                        );
                                                    })}
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </DataTable>
                </>
            )}

            <AddTransactionModal
                open={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => {
                    setIsAddModalOpen(false);
                    mutate();
                }}
                accounts={accounts || []}
            />

            <EditTransactionModal
                open={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setTransactionToEdit(null);
                }}
                onSuccess={() => {
                    setIsEditModalOpen(false);
                    setTransactionToEdit(null);
                    mutate();
                }}
                accounts={accounts || []}
                transaction={transactionToEdit}
            />

            <ConfirmationModal
                open={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmSingleDelete}
                title="Delete transaction?"
                message="Are you sure you want to delete this transaction? This action cannot be undone."
                confirmLabel="Delete"
                danger={true}
            />

            <ConfirmationModal
                open={isBatchDeleteModalOpen}
                onClose={() => setIsBatchDeleteModalOpen(false)}
                onConfirm={confirmBatchDelete}
                title="Delete transactions?"
                message={`Are you sure you want to delete ${batchDeleteIds.length} transaction${batchDeleteIds.length > 1 ? 's' : ''}? This action cannot be undone.`}
                confirmLabel="Delete"
                danger={true}
            />
        </div>
    );
}
