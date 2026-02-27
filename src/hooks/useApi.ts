/**
 * Copyright (c) 2026 Kunji Finance.
 * All rights reserved.
 * This code is proprietary and confidential.
 */

'use client';

import { useState, useCallback, useEffect } from 'react';

interface UseApiResult<T> {
    data: T | null;
    isLoading: boolean;
    error: string | null;
    mutate: () => Promise<void>;
    refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch data from the internal API with loading and error states.
 * Automatically fetches on mount if autoFetch is true.
 *
 * @param url - The API endpoint to fetch.
 * @param autoFetch - Whether to fetch immediately on mount (default: true).
 * @returns Object containing data, loading state, error, and refetch function.
 */
export function useApi<T>(url: string, autoFetch = true): UseApiResult<T> {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(autoFetch);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(url, {
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                },
                cache: 'no-store'
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || `HTTP error ${res.status}`);
            }
            const result = await res.json();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    }, [url]);

    useEffect(() => {
        if (autoFetch) {
            fetchData();
        }
    }, [autoFetch, fetchData]);

    return { data, isLoading, error, mutate: fetchData, refetch: fetchData };
}
