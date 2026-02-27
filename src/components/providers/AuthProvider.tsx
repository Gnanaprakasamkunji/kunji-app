/**
 * Copyright (c) 2026 Kunji Finance.
 * All rights reserved.
 * This code is proprietary and confidential.
 */

'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';

/**
 * Props for AuthProvider.
 */
interface AuthProviderProps {
    /** Child components that need access to the session context. */
    children: React.ReactNode;
}

/**
 * AuthProvider wraps the application with NextAuth's SessionProvider,
 * making the session available to all client components via `useSession()`.
 *
 * @param props - AuthProvider component props.
 * @returns SessionProvider-wrapped children.
 */
const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    return <SessionProvider>{children}</SessionProvider>;
};

export default AuthProvider;
