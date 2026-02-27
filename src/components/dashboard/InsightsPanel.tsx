/**
 * Copyright (c) 2026 Kunji Finance.
 * All rights reserved.
 * This code is proprietary and confidential.
 */

'use client';

import React from 'react';
import type { Insight } from '@/types';
import { Idea } from '@carbon/icons-react';

interface InsightsPanelProps {
    insights: Insight[];
}

const InsightsPanel: React.FC<InsightsPanelProps> = ({ insights }) => {
    return (
        <div className="kunji-card" role="region" aria-label="AI insights">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Idea size={20} style={{ color: 'var(--cds-interactive)' }} />
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--cds-text-primary)' }}>AI insights</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {insights.map((insight) => (
                    <div key={insight.id} className="kunji-insight-card" style={{ opacity: insight.isRead ? 0.7 : 1 }}>
                        <p className="kunji-insight-card__title">{insight.title}</p>
                        <p className="kunji-insight-card__text">{insight.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InsightsPanel;
