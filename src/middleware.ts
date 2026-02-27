/**
 * Copyright (c) 2026 Kunji Finance.
 * All rights reserved.
 * This code is proprietary and confidential.
 */

import { withAuth } from 'next-auth/middleware';

export default withAuth({
    pages: {
        signIn: '/',
    },
});

/**
 * Middleware configuration — protects all dashboard routes.
 * Redirects unauthenticated users to the login page (/).
 */
export const config = {
    matcher: ['/dashboard/:path*', '/accounts/:path*', '/transactions/:path*', '/budgets/:path*', '/savings/:path*', '/investments/:path*', '/settings/:path*'],
};
