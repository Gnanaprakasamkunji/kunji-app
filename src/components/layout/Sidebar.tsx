/**
 * Copyright (c) 2026 Kunji Finance.
 * All rights reserved.
 * This code is proprietary and confidential.
 */

'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    SideNav,
    SideNavItems,
    SideNavLink,
} from '@carbon/react';
import {
    Dashboard,
    Wallet,
    ArrowsHorizontal,
    ChartRing,
    PiggyBank,
    Growth,
    Settings,
    InventoryManagement,
    Group,
} from '@carbon/icons-react';

/**
 * Sidebar navigation item definition.
 */
interface SidebarNavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ size?: number }>;
}

const NAV_ITEMS: SidebarNavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: Dashboard },
    { label: 'Inventory', href: '/dashboard#inventory', icon: InventoryManagement },
    { label: 'Vendors', href: '/dashboard#vendors', icon: Group },
    { label: 'Accounts', href: '/accounts', icon: Wallet },
    { label: 'Transactions', href: '/transactions', icon: ArrowsHorizontal },
    { label: 'Budgets', href: '/budgets', icon: ChartRing },
    { label: 'Savings', href: '/savings', icon: PiggyBank },
    { label: 'Investments', href: '/investments', icon: Growth },
    { label: 'Settings', href: '/settings', icon: Settings },
];

/**
 * Props for the Sidebar component.
 */
interface SidebarProps {
    /** Whether the sidebar is expanded (visible on mobile). */
    isExpanded: boolean;
    /** Handler to toggle sidebar visibility. */
    onToggle: () => void;
}

/**
 * Sidebar provides the main navigation for the dashboard.
 * Uses Carbon SideNav with active state highlighting.
 *
 * @param props - Sidebar component props.
 * @returns JSX element for the sidebar navigation.
 */
const Sidebar: React.FC<SidebarProps> = ({ isExpanded, onToggle }) => {
    const pathname = usePathname();

    return (
        <SideNav
            isFixedNav
            expanded={isExpanded}
            isChildOfHeader={true}
            aria-label="Main navigation"
            className="kunji-sidebar"
            onSideNavBlur={onToggle}
        >
            <div
                style={{
                    padding: '1rem 1rem 0.5rem 1rem',
                    borderBottom: '1px solid var(--cds-border-subtle-01)',
                    marginBottom: '0.5rem',
                }}
            >
                <h2
                    style={{
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #0f62fe, #4589ff)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}
                >
                    Kunji
                </h2>
                <p
                    style={{
                        fontSize: '0.6875rem',
                        color: 'var(--cds-text-helper)',
                        marginTop: '0.125rem',
                    }}
                >
                    Personal Finance
                </p>
            </div>
            <SideNavItems>
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <SideNavLink
                            key={item.href}
                            renderIcon={item.icon}
                            isActive={isActive}
                            href={item.href}
                            element={Link}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            {item.label}
                        </SideNavLink>
                    );
                })}
            </SideNavItems>
        </SideNav>
    );
};

export default Sidebar;
