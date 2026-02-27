/**
 * Copyright (c) 2026 Kunji Finance.
 * All rights reserved.
 * This code is proprietary and confidential.
 */

'use client';

import React from 'react';
import { Button } from '@carbon/react';

/**
 * Props for the EmptyState component.
 */
interface EmptyStateProps {
    /** Icon element to display above the title. */
    icon: React.ReactNode;
    /** Main heading for the empty state. */
    title: string;
    /** Descriptive message below the heading. */
    description: string;
    /** Label for the primary call-to-action button. */
    actionLabel?: string;
    /** Handler for the CTA button click. */
    onAction?: () => void;
}

/**
 * EmptyState displays a centered message when no data is available.
 * Used across all modules for first-visit and no-results states.
 *
 * @param props - EmptyState component props.
 * @returns JSX element for an empty state display.
 */
const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    actionLabel,
    onAction,
}) => {
    return (
        <div className="kunji-empty-state" role="status" aria-label={title}>
            <div className="kunji-empty-state__icon" aria-hidden="true">
                {icon}
            </div>
            <h3 className="kunji-empty-state__title">{title}</h3>
            <p className="kunji-empty-state__description">{description}</p>
            {actionLabel && onAction && (
                <Button kind="primary" size="md" onClick={onAction}>
                    {actionLabel}
                </Button>
            )}
        </div>
    );
};

export default EmptyState;
