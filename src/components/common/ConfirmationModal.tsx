/**
 * Copyright (c) 2026 Kunji Finance.
 * All rights reserved.
 * This code is proprietary and confidential.
 */

'use client';

import React from 'react';
import { Modal } from '@carbon/react';

/**
 * Props for the ConfirmationModal component.
 */
interface ConfirmationModalProps {
    /** Whether the modal is open. */
    open: boolean;
    /** Handler called when the modal is closed/cancelled. */
    onClose: () => void;
    /** Handler called when the primary action is confirmed. */
    onConfirm: () => void;
    /** Title of the confirmation modal. */
    title: string;
    /** Body message describing the action. */
    message: string;
    /** Label for the confirm (danger) button. */
    confirmLabel?: string;
    /** Whether the action is destructive (shows danger styling). */
    danger?: boolean;
}

/**
 * ConfirmationModal provides a Carbon Modal for destructive action confirmations.
 * Used before delete operations and other irreversible actions.
 *
 * @param props - ConfirmationModal component props.
 * @returns JSX element for a confirmation dialog.
 */
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    open,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Delete',
    danger = true,
}) => {
    return (
        <Modal
            open={open}
            modalHeading={title}
            primaryButtonText={confirmLabel}
            secondaryButtonText="Cancel"
            onRequestClose={onClose}
            onRequestSubmit={onConfirm}
            danger={danger}
            size="sm"
            aria-label={title}
        >
            <p style={{ color: 'var(--cds-text-secondary)', lineHeight: 1.5 }}>
                {message}
            </p>
        </Modal>
    );
};

export default ConfirmationModal;
