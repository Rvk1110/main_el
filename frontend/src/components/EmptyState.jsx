// frontend/src/components/EmptyState.jsx
import React from 'react';

export default function EmptyState({
    icon = '📄',
    title = 'No data yet',
    description = 'Get started by uploading a document or analyzing a clause.',
    action = null
}) {
    return (
        <div style={{
            padding: '60px 20px',
            textAlign: 'center',
            background: '#f9fafb',
            borderRadius: '16px',
            border: '2px dashed #e5e7eb',
            margin: '20px 0'
        }}>
            <div style={{
                fontSize: '64px',
                marginBottom: '16px',
                opacity: 0.6
            }}>
                {icon}
            </div>
            <h3 style={{
                margin: '0 0 8px 0',
                fontSize: '20px',
                fontWeight: '600',
                color: '#1f2937'
            }}>
                {title}
            </h3>
            <p style={{
                margin: '0 0 24px 0',
                fontSize: '14px',
                color: '#6b7280',
                maxWidth: '400px',
                marginLeft: 'auto',
                marginRight: 'auto',
                lineHeight: '1.6'
            }}>
                {description}
            </p>
            {action && (
                <div>{action}</div>
            )}
        </div>
    );
}
