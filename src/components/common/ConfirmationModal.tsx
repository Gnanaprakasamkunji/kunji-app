/**
 * Copyright (c) 2026 Kunji Finance.
 * All rights reserved.
 * This code is proprietary and confidential.
 */

'use client';

import React from 'react';
import { Modal } from '@carbon/react';

interface ConfirmationModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    danger?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ open, onClose, onConfirm, title, message, confirmLabel = 'Delete', danger = true }) => {
    return (
        <Modal open={open} modalHeading={title} primaryButtonText={confirmLabel} secondaryButtonText="Cancel" onRequestClose={onClose} onRequestSubmit={onConfirm} danger={danger} size="sm" aria-label={title}>
            <p style={{ color: 'var(--cds-text-secondary)', lineHeight: 1.5 }}>{message}</p>
        </Modal>
    );
};

export default ConfirmationModal;
