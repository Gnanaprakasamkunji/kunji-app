/**
 * Copyright (c) 2026 Kunji Finance.
 * All rights reserved.
 * This code is proprietary and confidential.
 */

'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';

interface AuthProviderProps {
    children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    return <SessionProvider>{children}</SessionProvider>;
};

export default AuthProvider;
