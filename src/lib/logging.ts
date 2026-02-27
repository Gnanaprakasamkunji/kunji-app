/**
 * Copyright (c) 2026 Kunji Finance.
 * All rights reserved.
 * This code is proprietary and confidential.
 */

/**
 * Structured logging utility.
 * Wraps console methods with a namespace prefix for traceability.
 *
 * @param namespace - The module name for log identification.
 * @returns An object with info, warn, and error log methods.
 */
export default function logging(namespace: string): {
    info: (message: string) => void;
    warn: (message: string) => void;
    error: (message: string) => void;
} {
    const prefix = `[${namespace}]`;
    return {
        info: (message: string): void => {
            console.info(`${prefix} ${message}`);
        },
        warn: (message: string): void => {
            console.warn(`${prefix} ${message}`);
        },
        error: (message: string): void => {
            console.error(`${prefix} ${message}`);
        },
    };
}
