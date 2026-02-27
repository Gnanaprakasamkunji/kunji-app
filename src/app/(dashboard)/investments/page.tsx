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
    Select,
    SelectItem,
    ToastNotification,
    InlineLoading,
} from '@carbon/react';
import { Add, Portfolio } from '@carbon/icons-react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';
import { formatCurrency, formatDate, calculatePercentage } from '@/lib/utils';
import { useApi } from '@/hooks/useApi';
import type { Investment } from '@/types';
import AddInvestmentModal from '@/components/modals/AddInvestmentModal';
import EditInvestmentModal from '@/components/modals/EditInvestmentModal';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import EmptyState from '@/components/common/EmptyState';

const HEADERS = [
    { key: 'name', header: 'Asset Name' },
    { key: 'type', header: 'Type' },
    { key: 'purchasePrice', header: 'Invested' },
    { key: 'currentValue', header: 'Current Value' },
    { key: 'units', header: 'Units' },
    { key: 'returnAmount', header: 'Returns' },
    { key: 'purchaseDate', header: 'Purchase Date' },
    { key: 'actions', header: '' },
];

const TYPE_LABELS: Record<string, string> = {
    stocks: 'Stocks',
    bonds: 'Bonds',
    'mutual-fund': 'Mutual Fund',
    crypto: 'Crypto',
    etf: 'ETF',
};

export default function InvestmentsPage(): React.JSX.Element {
    const { data: investments, isLoading, mutate } = useApi<Investment[]>('/api/investments');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
    const [deletingInvestment, setDeletingInvestment] = useState<Investment | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [toast, setToast] = useState<{ title: string; subtitle: string; kind: 'success' | 'error' } | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [yearFilter, setYearFilter] = useState('all');

    const availableYears = useMemo((): string[] => {
        if (!investments) return [];
        const years = new Set(investments.map((inv) => new Date(inv.purchaseDate).getFullYear().toString()));
        return Array.from(years).sort((a, b) => Number(b) - Number(a));
    }, [investments]);

    const filteredInvestments = useMemo((): Investment[] => {
        if (!investments) return [];
        return investments.filter((inv) => {
            const matchesSearch = inv.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = typeFilter === 'all' || inv.type === typeFilter;
            const matchesYear = yearFilter === 'all' || new Date(inv.purchaseDate).getFullYear().toString() === yearFilter;
            return matchesSearch && matchesType && matchesYear;
        });
    }, [investments, searchTerm, typeFilter, yearFilter]);

    const rows = useMemo(() => {
        return filteredInvestments.map((inv) => {
            const returnAmt = inv.currentValue - inv.purchasePrice;
            const returnPct = calculatePercentage(returnAmt, inv.purchasePrice);
            return {
                id: inv.id,
                name: inv.name,
                type: TYPE_LABELS[inv.type] ?? inv.type,
                purchasePrice: formatCurrency(inv.purchasePrice),
                currentValue: formatCurrency(inv.currentValue),
                units: inv.units,
                returnAmount: `${returnAmt >= 0 ? '+' : ''}${formatCurrency(returnAmt)} (${returnPct}%)`,
                returnRaw: returnAmt,
                purchaseDate: formatDate(inv.purchaseDate),
                color: inv.color,
            };
        });
    }, [filteredInvestments]);

    const handleDelete = useCallback(async (): Promise<void> => {
        if (!deletingInvestment) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/investments/${deletingInvestment.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');
            setToast({ title: 'Investment deleted', subtitle: `${deletingInvestment.name} has been removed.`, kind: 'success' });
            mutate();
        } catch (err: unknown) {
            setToast({ title: 'Delete failed', subtitle: 'Something went wrong. Please try again.', kind: 'error' });
            void err;
        } finally {
            setIsDeleting(false);
            setDeletingInvestment(null);
        }
    }, [deletingInvestment, mutate]);

    if (isLoading || !investments) {
        return (
            <div className="kunji-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <InlineLoading description="Loading investments..." />
            </div>
        );
    }

    const totalValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
    const totalCost = investments.reduce((sum, inv) => sum + inv.purchasePrice, 0);
    const totalReturn = totalValue - totalCost;
    const returnPercentage = calculatePercentage(totalReturn, totalCost);

    const allocationData = investments.map((inv) => ({ name: inv.name, value: inv.currentValue, color: inv.color }));

    return (
        <div className="kunji-page">
            {toast && (
                <ToastNotification kind={toast.kind} title={toast.title} subtitle={toast.subtitle} timeout={4000} onClose={() => setToast(null)} style={{ position: 'fixed', top: '4rem', right: '1rem', zIndex: 9000 }} />
            )}
            <div className="kunji-page__header kunji-page__header--split">
                <div>
                    <h1 className="kunji-page__title">Investments</h1>
                    <p className="kunji-page__subtitle">
                        Portfolio value: {formatCurrency(totalValue)}
                        <span style={{ marginLeft: '0.75rem', color: totalReturn >= 0 ? 'var(--cds-support-success)' : 'var(--cds-support-error)', fontWeight: 600 }}>
                            {totalReturn >= 0 ? '+' : ''}{formatCurrency(totalReturn)} ({returnPercentage}%)
                        </span>
                    </p>
                </div>
                <Button kind="primary" renderIcon={Add} size="md" onClick={() => setIsAddModalOpen(true)}>Add investment</Button>
            </div>

            {investments.length === 0 ? (
                <EmptyState icon={<Portfolio size={48} />} title="No investments found" description="You haven't added any investments yet." actionLabel="Add investment" onAction={() => setIsAddModalOpen(true)} />
            ) : (
                <>
                    <div className="kunji-investment-grid">
                        <div className="kunji-card" role="img" aria-label="Asset allocation chart">
                            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--cds-text-primary)', marginBottom: '1rem' }}>Asset allocation</h3>
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie data={allocationData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={2} dataKey="value" stroke="none">
                                        {allocationData.map((entry) => (<Cell key={`alloc-${entry.name}`} fill={entry.color} />))}
                                    </Pie>
                                    <Tooltip formatter={((value: number) => formatCurrency(value)) as never} contentStyle={{ background: 'var(--cds-layer-01)', border: '1px solid var(--cds-border-subtle-01)', borderRadius: '4px', fontSize: '0.8125rem' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="kunji-investment-stats">
                            <div className="kunji-card"><p style={{ fontSize: '0.8125rem', color: 'var(--cds-text-secondary)', marginBottom: '0.5rem' }}>Total Invested</p><p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--cds-text-primary)' }}>{formatCurrency(totalCost)}</p></div>
                            <div className="kunji-card"><p style={{ fontSize: '0.8125rem', color: 'var(--cds-text-secondary)', marginBottom: '0.5rem' }}>Current Value</p><p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--cds-support-success)' }}>{formatCurrency(totalValue)}</p></div>
                            <div className="kunji-card"><p style={{ fontSize: '0.8125rem', color: 'var(--cds-text-secondary)', marginBottom: '0.5rem' }}>Total Returns</p><p style={{ fontSize: '1.5rem', fontWeight: 700, color: totalReturn >= 0 ? 'var(--cds-support-success)' : 'var(--cds-support-error)' }}>{totalReturn >= 0 ? '+' : ''}{formatCurrency(totalReturn)}</p></div>
                            <div className="kunji-card"><p style={{ fontSize: '0.8125rem', color: 'var(--cds-text-secondary)', marginBottom: '0.5rem' }}>Total Holdings</p><p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--cds-text-primary)' }}>{investments.length}</p></div>
                        </div>
                    </div>

                    <div className="kunji-card" style={{ padding: 0, overflow: 'hidden', marginTop: '1.5rem' }}>
                        <DataTable rows={rows} headers={HEADERS} isSortable>
                            {({ rows: tableRows, headers, getHeaderProps, getRowProps, getTableProps }: any) => (
                                <>
                                    <TableToolbar aria-label="Holdings table toolbar">
                                        <TableToolbarContent>
                                            <TableToolbarSearch placeholder="Search holdings..." onChange={(_e: unknown, value?: string) => setSearchTerm(value ?? '')} persistent />
                                            <Select id="filter-type" labelText="" hideLabel value={typeFilter} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTypeFilter(e.target.value)} size="sm" style={{ minWidth: '140px' }}>
                                                <SelectItem value="all" text="All types" />
                                                <SelectItem value="stocks" text="Stocks" />
                                                <SelectItem value="bonds" text="Bonds" />
                                                <SelectItem value="mutual-fund" text="Mutual Fund" />
                                                <SelectItem value="crypto" text="Crypto" />
                                                <SelectItem value="etf" text="ETF" />
                                            </Select>
                                            <Select id="filter-year" labelText="" hideLabel value={yearFilter} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setYearFilter(e.target.value)} size="sm" style={{ minWidth: '120px' }}>
                                                <SelectItem value="all" text="All years" />
                                                {availableYears.map((year) => (<SelectItem key={year} value={year} text={year} />))}
                                            </Select>
                                        </TableToolbarContent>
                                    </TableToolbar>
                                    {filteredInvestments.length === 0 ? (
                                        <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}><p style={{ fontSize: '0.9375rem', fontWeight: 500, marginBottom: '0.5rem' }}>No results</p><Button kind="ghost" size="sm" onClick={() => { setSearchTerm(''); setTypeFilter('all'); setYearFilter('all'); }}>Clear filters</Button></div>
                                    ) : (
                                        <Table {...getTableProps()} aria-label="Investment holdings">
                                            <TableHead><TableRow>{headers.map((header: { key: string; header: string }) => (<TableHeader {...getHeaderProps({ header })} key={header.key}>{header.header}</TableHeader>))}</TableRow></TableHead>
                                            <TableBody>
                                                {tableRows.map((row: { id: string; cells: Array<{ id: string; value: string | number }> }) => {
                                                    const originalInv = filteredInvestments.find((inv) => inv.id === row.id);
                                                    const returnRaw = originalInv ? originalInv.currentValue - originalInv.purchasePrice : 0;
                                                    return (
                                                        <TableRow {...getRowProps({ row })} key={row.id}>
                                                            {row.cells.map((cell: { id: string; value: string | number }) => {
                                                                if (cell.id.endsWith(':name') && originalInv) return (<TableCell key={cell.id}><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: originalInv.color, flexShrink: 0 }} aria-hidden="true" /><span style={{ fontWeight: 600 }}>{cell.value}</span></div></TableCell>);
                                                                if (cell.id.endsWith(':type')) return (<TableCell key={cell.id}><Tag type="cool-gray" size="sm">{cell.value}</Tag></TableCell>);
                                                                if (cell.id.endsWith(':returnAmount')) return (<TableCell key={cell.id}><span style={{ fontWeight: 600, color: returnRaw >= 0 ? 'var(--cds-support-success)' : 'var(--cds-support-error)' }}>{cell.value}</span></TableCell>);
                                                                if (cell.id.endsWith(':actions') && originalInv) return (<TableCell key={cell.id} style={{ width: '48px' }}><OverflowMenu size="sm" flipped ariaLabel={`Actions for ${originalInv.name}`}><OverflowMenuItem itemText="Edit" onClick={() => setEditingInvestment(originalInv)} /><OverflowMenuItem itemText="Delete" isDelete onClick={() => setDeletingInvestment(originalInv)} /></OverflowMenu></TableCell>);
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

            <AddInvestmentModal open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSuccess={() => { setIsAddModalOpen(false); setToast({ title: 'Investment added', subtitle: 'Your new holding has been created.', kind: 'success' }); mutate(); }} />
            <EditInvestmentModal open={!!editingInvestment} investment={editingInvestment} onClose={() => setEditingInvestment(null)} onSuccess={() => { setEditingInvestment(null); setToast({ title: 'Investment updated', subtitle: 'Your holding has been updated.', kind: 'success' }); mutate(); }} />
            <ConfirmationModal open={!!deletingInvestment} onClose={() => setDeletingInvestment(null)} onConfirm={handleDelete} title="Delete investment" message={`Are you sure you want to delete "${deletingInvestment?.name}"?`} confirmLabel={isDeleting ? 'Deleting...' : 'Delete'} danger />
        </div>
    );
}
