/**
 * Copyright (c) 2026 Kunji Finance.
 * All rights reserved.
 * This code is proprietary and confidential.
 */

'use client';

import React from 'react';
import { Button } from '@carbon/react';

interface EmptyStateProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, actionLabel, onAction }) => {
    return (
        <div className="kunji-empty-state" role="status" aria-label={title}>
            <div className="kunji-empty-state__icon" aria-hidden="true">{icon}</div>
            <h3 className="kunji-empty-state__title">{title}</h3>
            <p className="kunji-empty-state__description">{description}</p>
            {actionLabel && onAction && (<Button kind="primary" size="md" onClick={onAction}>{actionLabel}</Button>)}
        </div>
    );
};

export default EmptyState;
