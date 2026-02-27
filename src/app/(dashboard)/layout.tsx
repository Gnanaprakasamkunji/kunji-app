/**
 * Copyright (c) 2026 Kunji Finance.
 * All rights reserved.
 * This code is proprietary and confidential.
 */

import AppShell from '@/components/layout/AppShell';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

/**
 * DashboardLayout wraps all dashboard pages with the AppShell (sidebar + header).
 *
 * @param props - Layout props containing children.
 * @returns Dashboard layout with AppShell wrapper.
 */
export default async function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>): Promise<React.JSX.Element> {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect('/');
    }

    return <AppShell>{children}</AppShell>;
}
