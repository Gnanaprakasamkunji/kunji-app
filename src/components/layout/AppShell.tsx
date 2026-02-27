/**
 * Copyright (c) 2026 Kunji Finance.
 * All rights reserved.
 * This code is proprietary and confidential.
 */

'use client';

import React, { useState, useCallback } from 'react';
import AppHeader from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';

/**
 * Props for the AppShell component.
 */
interface AppShellProps {
    /** Child page content to render in the main area. */
    children: React.ReactNode;
}

/**
 * AppShell wraps the dashboard layout with Sidebar + Header + main content area.
 * Handles responsive sidebar toggle.
 *
 * @param props - AppShell component props.
 * @returns JSX element for the complete app shell layout.
 */
const AppShell: React.FC<AppShellProps> = ({ children }) => {
    const [isSideNavExpanded, setIsSideNavExpanded] = useState<boolean>(true);
    const [currentHash, setCurrentHash] = useState<string>('');

    React.useEffect(() => {
        if (window.innerWidth < 1056) {
            setIsSideNavExpanded(false);
        }

        // Initial hash
        setCurrentHash(window.location.hash);

        // Listener for hash changes
        const handleHashChange = () => {
            setCurrentHash(window.location.hash);
        };

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const handleMenuToggle = useCallback((): void => {
        setIsSideNavExpanded((prev) => !prev);
    }, []);

    return (
        <div className="kunji-app-shell">
            <AppHeader
                onMenuToggle={handleMenuToggle}
                isSideNavExpanded={isSideNavExpanded}
            />
            <Sidebar isExpanded={isSideNavExpanded} onToggle={handleMenuToggle} />
            <main className="kunji-app-shell__content" role="main">
                <div className="kunji-main-container">
                    {(currentHash === '#inventory' || currentHash === '#vendors') ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>
                            <h2 style={{ marginBottom: '1rem' }}>
                                {currentHash.slice(1).charAt(0).toUpperCase() + currentHash.slice(2)}
                            </h2>
                            <p style={{ color: 'var(--cds-text-secondary)' }}>
                                This feature is currently under active development. <br />
                                Check back soon for updates on your {currentHash.slice(1)} management!
                            </p>
                            <div style={{ marginTop: '2rem', opacity: 0.5 }}>
                                <div className="kunji-card" style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--cds-border-subtle)' }}>
                                    Feature Template Placeholder
                                </div>
                            </div>
                        </div>
                    ) : (
                        children
                    )}
                </div>
            </main>
        </div>
    );
};

export default AppShell;
