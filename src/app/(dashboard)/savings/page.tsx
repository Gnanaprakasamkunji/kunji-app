/**
 * Copyright (c) 2026 Kunji Finance.
 * All rights reserved.
 * This code is proprietary and confidential.
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
    Button,
    Tag,
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
    OverflowMenu,
    OverflowMenuItem,
    ToastNotification,
    InlineLoading,
} from '@carbon/react';
import { Add, Flag } from '@carbon/icons-react';
import { formatCurrency, calculatePercentage, formatDate } from '@/lib/utils';
import { useApi } from '@/hooks/useApi';
import type { SavingsGoal } from '@/types';
import AddSavingsGoalModal from '@/components/modals/AddSavingsGoalModal';
import EditSavingsGoalModal from '@/components/modals/EditSavingsGoalModal';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import EmptyState from '@/components/common/EmptyState';
import DonutChart from '@/components/common/DonutChart';
import type { DonutSlice } from '@/components/common/DonutChart';

const HEADERS = [
    { key: 'name', header: 'Goal Name' },
    { key: 'targetAmount', header: 'Target Amount' },
    { key: 'currentAmount', header: 'Saved' },
    { key: 'progress', header: 'Progress' },
    { key: 'targetDate', header: 'Target Date' },
    { key: 'priority', header: 'Priority' },
    { key: 'actions', header: '' },
];

export default function SavingsPage(): React.JSX.Element {
    const { data: goals, isLoading, mutate } = useApi<SavingsGoal[]>('/api/savings');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
    const [deletingGoal, setDeletingGoal] = useState<SavingsGoal | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [toast, setToast] = useState<{ title: string; subtitle: string; kind: 'success' | 'error' } | null>(null);

    const filteredGoals = useMemo(() => {
        if (!goals) return [];
        return goals.filter((g) => g.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [goals, searchTerm]);

    const rows = useMemo(() => {
        return filteredGoals.map((g) => {
            const pct = calculatePercentage(g.currentAmount, g.targetAmount);
            return {
                id: g.id,
                name: g.name,
                targetAmount: formatCurrency(g.targetAmount),
                currentAmount: formatCurrency(g.currentAmount),
                progress: `${pct}%`,
                targetDate: formatDate(g.targetDate, 'MMM yyyy'),
                priority: g.priority.charAt(0).toUpperCase() + g.priority.slice(1),
            };
        });
    }, [filteredGoals]);

    const handleDelete = useCallback(async (): Promise<void> => {
        if (!deletingGoal) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/savings/${deletingGoal.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');
            setToast({ title: 'Goal deleted', subtitle: `${deletingGoal.name} has been removed.`, kind: 'success' });
            mutate();
        } catch (err: unknown) {
            setToast({ title: 'Delete failed', subtitle: 'Something went wrong.', kind: 'error' });
            void err;
        } finally {
            setIsDeleting(false);
            setDeletingGoal(null);
        }
    }, [deletingGoal, mutate]);

    if (isLoading || !goals) return (<div className="kunji-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}><InlineLoading description="Loading savings goals..." /></div>);

    const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);

    return (
        <div className="kunji-page">
            {toast && (<ToastNotification kind={toast.kind} title={toast.title} subtitle={toast.subtitle} timeout={4000} onClose={() => setToast(null)} style={{ position: 'fixed', top: '4rem', right: '1rem', zIndex: 9000 }} />)}
            <div className="kunji-page__header kunji-page__header--split">
                <div>
                    <h1 className="kunji-page__title">Savings Goals</h1>
                    <p className="kunji-page__subtitle">{formatCurrency(totalSaved)} saved of {formatCurrency(totalTarget)} total target</p>
                </div>
                <Button kind="primary" renderIcon={Add} size="md" onClick={() => setIsAddModalOpen(true)}>Add goal</Button>
            </div>

            {goals.length === 0 ? (
                <EmptyState icon={<Flag size={48} />} title="No savings goals" description="You haven't added any savings goals yet." actionLabel="Add goal" onAction={() => setIsAddModalOpen(true)} />
            ) : (
                <>
                    <div className="kunji-grid kunji-grid--2" style={{ marginBottom: '1.5rem' }}>
                        <DonutChart title="Goal progress" data={goals.map((g): DonutSlice => ({ name: g.name, value: g.currentAmount, color: g.color }))} centerLabel={formatCurrency(totalSaved)} centerSubLabel="Total saved" height={260} />
                        <DonutChart title="Target allocation" data={goals.map((g): DonutSlice => ({ name: g.name, value: g.targetAmount, color: g.color }))} centerLabel={formatCurrency(totalTarget)} centerSubLabel="Total target" height={260} />
                    </div>
                    <div className="kunji-card" style={{ padding: 0, overflow: 'hidden' }}>
                        <DataTable rows={rows} headers={HEADERS} isSortable>
                            {({ rows: tableRows, headers, getHeaderProps, getRowProps, getTableProps }: any) => (
                                <>
                                    <TableToolbar aria-label="Savings goals table toolbar"><TableToolbarContent><TableToolbarSearch placeholder="Search goals..." onChange={(_e: unknown, value?: string) => setSearchTerm(value ?? '')} persistent /></TableToolbarContent></TableToolbar>
                                    {filteredGoals.length === 0 ? (
                                        <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}><p style={{ fontWeight: 500, marginBottom: '0.5rem' }}>No results</p><Button kind="ghost" size="sm" onClick={() => setSearchTerm('')}>Clear search</Button></div>
                                    ) : (
                                        <Table {...getTableProps()} aria-label="Savings goals table">
                                            <TableHead><TableRow>{headers.map((header: { key: string; header: string }) => (<TableHeader {...getHeaderProps({ header })} key={header.key}>{header.header}</TableHeader>))}</TableRow></TableHead>
                                            <TableBody>
                                                {tableRows.map((row: { id: string; cells: Array<{ id: string; value: string | number }> }) => {
                                                    const originalGoal = filteredGoals.find((g) => g.id === row.id);
                                                    return (
                                                        <TableRow {...getRowProps({ row })} key={row.id}>
                                                            {row.cells.map((cell: { id: string; value: string | number }) => {
                                                                if (cell.id.endsWith(':name') && originalGoal) return (<TableCell key={cell.id}><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span aria-hidden="true">{originalGoal.icon}</span><span style={{ fontWeight: 600 }}>{cell.value}</span></div></TableCell>);
                                                                if (cell.id.endsWith(':progress') && originalGoal) { const pct = calculatePercentage(originalGoal.currentAmount, originalGoal.targetAmount); return (<TableCell key={cell.id}><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '60px', height: '6px', backgroundColor: 'var(--progress-bg)', borderRadius: '3px', overflow: 'hidden' }}><div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', backgroundColor: originalGoal.color || 'var(--cds-interactive)' }} /></div><span style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>{cell.value}</span></div></TableCell>); }
                                                                if (cell.id.endsWith(':priority') && originalGoal) { const priorityTagType = { high: 'red' as const, medium: 'blue' as const, low: 'cool-gray' as const }; return (<TableCell key={cell.id}><Tag type={priorityTagType[originalGoal.priority]} size="sm">{cell.value}</Tag></TableCell>); }
                                                                if (cell.id.endsWith(':actions') && originalGoal) return (<TableCell key={cell.id} style={{ width: '48px' }}><OverflowMenu size="sm" flipped ariaLabel={`Actions for ${originalGoal.name}`}><OverflowMenuItem itemText="Edit" onClick={() => setEditingGoal(originalGoal)} /><OverflowMenuItem itemText="Delete" isDelete onClick={() => setDeletingGoal(originalGoal)} /></OverflowMenu></TableCell>);
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
                </>
            )}

            <AddSavingsGoalModal open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSuccess={() => { setIsAddModalOpen(false); setToast({ title: 'Goal added', subtitle: 'Your new savings goal has been created.', kind: 'success' }); mutate(); }} />
            <EditSavingsGoalModal open={!!editingGoal} goal={editingGoal} onClose={() => setEditingGoal(null)} onSuccess={() => { setEditingGoal(null); setToast({ title: 'Goal updated', subtitle: 'Your savings goal has been updated.', kind: 'success' }); mutate(); }} />
            <ConfirmationModal open={!!deletingGoal} onClose={() => setDeletingGoal(null)} onConfirm={handleDelete} title="Delete savings goal" message={`Are you sure you want to delete "${deletingGoal?.name}"?`} confirmLabel={isDeleting ? 'Deleting...' : 'Delete'} danger />
        </div>
    );
}
