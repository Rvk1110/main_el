// frontend/src/components/CopyButton.jsx
import React, { useState } from 'react';
import { copyToClipboard } from '../utils/exportUtils';
import { useToast } from '../hooks/useToast';

export default function CopyButton({ text, label = 'Copy' }) {
    const [copied, setCopied] = useState(false);
    const toast = useToast();

    const handleCopy = async () => {
        const success = await copyToClipboard(text);
        if (success) {
            setCopied(true);
            toast.showSuccess('Copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        } else {
            toast.showError('Failed to copy to clipboard');
        }
    };

    return (
        <button
            onClick={handleCopy}
            style={{
                background: copied ? '#10b981' : '#6b7280',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                transition: 'all 0.2s',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
            }}
            onMouseEnter={(e) => !copied && (e.target.style.background = '#4b5563')}
            onMouseLeave={(e) => !copied && (e.target.style.background = '#6b7280')}
            aria-label={copied ? 'Copied!' : 'Copy to clipboard'}
        >
            {copied ? '✓ Copied' : `📋 ${label}`}
        </button>
    );
}
