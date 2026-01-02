// frontend/src/components/SkeletonLoader.jsx
import React from 'react';

export default function SkeletonLoader({ width = '100%', height = '20px', borderRadius = '8px', style = {} }) {
    return (
        <div
            style={{
                width,
                height,
                borderRadius,
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
                ...style
            }}
            aria-label="Loading..."
            role="status"
        />
    );
}

export function ClauseSkeleton() {
    return (
        <div
            style={{
                padding: '16px',
                background: '#f9fafb',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                marginBottom: '12px'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <SkeletonLoader width="150px" height="24px" />
                <SkeletonLoader width="100px" height="24px" />
            </div>
            <SkeletonLoader width="100%" height="16px" style={{ marginBottom: '8px' }} />
            <SkeletonLoader width="90%" height="16px" style={{ marginBottom: '8px' }} />
            <SkeletonLoader width="80%" height="16px" />
        </div>
    );
}

export function DocumentSkeleton() {
    return (
        <div style={{ marginTop: '24px' }}>
            <div style={{
                background: 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
                padding: '20px 24px',
                borderRadius: '12px 12px 0 0',
                marginBottom: '0'
            }}>
                <SkeletonLoader width="250px" height="24px" style={{ marginBottom: '8px' }} />
                <SkeletonLoader width="180px" height="16px" />
            </div>
            <div style={{
                background: 'white',
                border: '2px solid #e5e7eb',
                borderTop: 'none',
                borderRadius: '0 0 12px 12px',
                padding: '20px'
            }}>
                {[1, 2, 3].map(i => <ClauseSkeleton key={i} />)}
            </div>
        </div>
    );
}
