/**
 * Copyright (c) 2026 Kunji Finance.
 * All rights reserved.
 * This code is proprietary and confidential.
 */

import { PrismaClient } from '@prisma/client';

/**
 * Singleton PrismaClient to prevent multiple instances
 * during Next.js hot-reloads in development.
 */

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

/**
 * Database client instance.
 * Reuses existing connection in development to avoid connection pool exhaustion.
 */
export const db: PrismaClient =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = db;
}
