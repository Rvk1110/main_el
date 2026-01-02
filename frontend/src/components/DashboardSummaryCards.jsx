// frontend/src/components/DashboardSummaryCards.jsx
import React from 'react';

export default function DashboardSummaryCards({ metrics }) {
    if (!metrics) {
        return null;
    }

    const cards = [
        {
            title: 'Total Clauses',
            value: metrics.totalClauses || 0,
            icon: '📄',
            color: '#3b82f6',
            bgColor: '#eff6ff'
        },
        {
            title: 'High Risk',
            value: metrics.highRisk || 0,
            icon: '🔴',
            color: '#ef4444',
            bgColor: '#fef2f2'
        },
        {
            title: 'Medium Risk',
            value: metrics.mediumRisk || 0,
            icon: '🟡',
            color: '#f59e0b',
            bgColor: '#fffbeb'
        },
        {
            title: 'Low Risk',
            value: metrics.lowRisk || 0,
            icon: '🟢',
            color: '#10b981',
            bgColor: '#f0fdf4'
        },
        {
            title: 'Overall Score',
            value: Math.round(metrics.overallScore || 0),
            icon: '📊',
            color: '#8b5cf6',
            bgColor: '#f5f3ff',
            suffix: '/100'
        }
    ];

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
        }}>
            {cards.map((card, index) => (
                <div
                    key={index}
                    style={{
                        background: card.bgColor,
                        padding: '20px',
                        borderRadius: '12px',
                        border: `2px solid ${card.color}20`,
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = `0 8px 16px ${card.color}30`;
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '32px' }}>{card.icon}</span>
                        <div style={{ flex: 1 }}>
                            <div style={{
                                fontSize: '12px',
                                fontWeight: '600',
                                color: card.color,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                {card.title}
                            </div>
                            <div style={{
                                fontSize: '28px',
                                fontWeight: '700',
                                color: card.color
                            }}>
                                {card.value}{card.suffix || ''}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
