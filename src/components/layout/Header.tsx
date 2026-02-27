/**
 * Copyright (c) 2026 Kunji Finance.
 * All rights reserved.
 * This code is proprietary and confidential.
 */

'use client';

import React from 'react';
import {
    Header as CarbonHeader,
    HeaderName,
    HeaderGlobalBar,
    HeaderGlobalAction,
    HeaderMenuButton,
} from '@carbon/react';
import { useTheme } from 'next-themes';
import {
    Search,
    Notification,
    UserAvatar,
    Sun,
    Asleep as Moon
} from '@carbon/icons-react';

/**
 * Props for the Header component.
 */
interface HeaderProps {
    /** Handler to toggle the sidebar on mobile. */
    onMenuToggle: () => void;
    /** Whether the sidebar is currently expanded. */
    isSideNavExpanded: boolean;
}

/**
 * Header displays the top navigation bar with search, notifications, and user avatar.
 * Uses Carbon Header component.
 *
 * @param props - Header component props.
 * @returns JSX element for the app header.
 */
const AppHeader: React.FC<HeaderProps> = ({ onMenuToggle, isSideNavExpanded }) => {
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <CarbonHeader aria-label="Kunji Personal Finance">
            <HeaderMenuButton
                aria-label={isSideNavExpanded ? 'Close menu' : 'Open menu'}
                onClick={onMenuToggle}
                isActive={isSideNavExpanded}
                aria-expanded={isSideNavExpanded}
            />
            <HeaderName href="/dashboard" prefix="">
                Kunji
            </HeaderName>
            <HeaderGlobalBar>
                <HeaderGlobalAction
                    aria-label={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
                    tooltipAlignment="end"
                    onClick={toggleTheme}
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </HeaderGlobalAction>
                <HeaderGlobalAction aria-label="Search" tooltipAlignment="end">
                    <Search size={20} />
                </HeaderGlobalAction>
                <HeaderGlobalAction aria-label="Notifications" tooltipAlignment="end">
                    <Notification size={20} />
                </HeaderGlobalAction>
                <HeaderGlobalAction aria-label="User profile" tooltipAlignment="end">
                    <UserAvatar size={20} />
                </HeaderGlobalAction>
            </HeaderGlobalBar>
        </CarbonHeader>
    );
};

export default AppHeader;
