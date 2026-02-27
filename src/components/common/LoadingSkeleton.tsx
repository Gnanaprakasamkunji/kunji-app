/**
 * Copyright (c) 2026 Kunji Finance.
 * All rights reserved.
 * This code is proprietary and confidential.
 */

'use client';

import React from 'react';
import { SkeletonText, SkeletonPlaceholder } from '@carbon/react';

interface LoadingSkeletonProps {
    rows?: number;
    type?: 'text' | 'card' | 'table';
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ rows = 3, type = 'text' }) => {
    if (type === 'card') return (<div className="kunji-grid kunji-grid--4" role="status" aria-label="Loading content">{Array.from({ length: 4 }).map((_, i) => (<div key={`skeleton-card-${i}`} className="kunji-card"><SkeletonText heading width="60%" /><SkeletonText paragraph lineCount={2} /><SkeletonPlaceholder style={{ width: '100%', height: '8px', marginTop: '1rem' }} /></div>))}</div>);
    if (type === 'table') return (<div role="status" aria-label="Loading table data">{Array.from({ length: rows }).map((_, i) => (<div key={`skeleton-row-${i}`} style={{ display: 'flex', gap: '1rem', padding: '0.75rem 0', borderBottom: '1px solid var(--cds-border-subtle-01)' }}><SkeletonText width="20%" /><SkeletonText width="30%" /><SkeletonText width="15%" /><SkeletonText width="15%" /><SkeletonText width="20%" /></div>))}</div>);
    return (<div role="status" aria-label="Loading content"><SkeletonText heading width="40%" /><SkeletonText paragraph lineCount={rows} /></div>);
};

export default LoadingSkeleton;
