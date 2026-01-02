// frontend/src/components/Toast.jsx
import React, { useEffect } from 'react';

export default function Toast({ message, type = 'info', onClose, duration = 4000 }) {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const getStyles = () => {
        const baseStyles = {
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            padding: '16px 24px',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            minWidth: '300px',
            maxWidth: '500px',
            zIndex: 10000,
            animation: 'slideIn 0.3s ease-out',
            fontWeight: '500',
            fontSize: '14px'
        };

        const typeStyles = {
            success: {
                background: '#10b981',
                color: 'white',
                border: '2px solid #059669'
            },
            error: {
                background: '#ef4444',
                color: 'white',
                border: '2px solid #dc2626'
            },
            warning: {
                background: '#f59e0b',
                color: 'white',
                border: '2px solid #d97706'
            },
            info: {
                background: '#3b82f6',
                color: 'white',
                border: '2px solid #2563eb'
            }
        };

        return { ...baseStyles, ...typeStyles[type] };
    };

    const getIcon = () => {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type];
    };

    return (
        <div style={getStyles()}>
            <span style={{ fontSize: '20px', fontWeight: '700' }}>{getIcon()}</span>
            <span style={{ flex: 1 }}>{message}</span>
            <button
                onClick={onClose}
                style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    color: 'white',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: '700',
                    transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
                aria-label="Close notification"
            >
                ×
            </button>
        </div>
    );
}
