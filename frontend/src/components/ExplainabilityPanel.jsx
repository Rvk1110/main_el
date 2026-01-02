// frontend/src/components/ExplainabilityPanel.jsx
import React, { useState } from 'react';
import { parseExplainability, formatExplainabilityDisplay } from '../utils/ExplainabilityParser';

export default function ExplainabilityPanel({ clause, backendResult, riskScore }) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!backendResult) return null;

    const explainability = parseExplainability(clause, backendResult);
    const sections = formatExplainabilityDisplay(explainability);

    return (
        <div style={{
            marginTop: '12px',
            border: '2px solid #e5e7eb',
            borderRadius: '12px',
            overflow: 'hidden'
        }}>
            {/* Toggle Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: '#f9fafb',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                onMouseLeave={(e) => e.target.style.background = '#f9fafb'}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                        Why is this risky?
                    </span>
                    {riskScore !== undefined && (
                        <span style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#6b7280',
                            background: '#e5e7eb',
                            padding: '2px 8px',
                            borderRadius: '12px'
                        }}>
                            Risk Score: {riskScore}/100
                        </span>
                    )}
                </div>
                <span style={{ fontSize: '18px', color: '#6b7280', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    ▼
                </span>
            </button>

            {/* Expanded Content */}
            {isExpanded && (
                <div style={{ padding: '20px', background: 'white' }}>
                    {sections.map((section, index) => (
                        <div key={index} style={{ marginBottom: index < sections.length - 1 ? '20px' : '0' }}>
                            {/* Section Header */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '8px'
                            }}>
                                <span style={{ fontSize: '16px' }}>{section.icon}</span>
                                <h4 style={{
                                    margin: 0,
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#1f2937'
                                }}>
                                    {section.title}
                                </h4>
                            </div>

                            {/* Section Content */}
                            {section.content && (
                                <p style={{
                                    margin: 0,
                                    fontSize: '13px',
                                    color: '#374151',
                                    lineHeight: '1.6',
                                    paddingLeft: '24px'
                                }}>
                                    {section.content}
                                </p>
                            )}

                            {/* Section Items (Bullet List) */}
                            {section.items && section.items.length > 0 && (
                                <ul style={{
                                    margin: 0,
                                    paddingLeft: '40px',
                                    fontSize: '13px',
                                    color: '#374151',
                                    lineHeight: '1.8'
                                }}>
                                    {section.items.map((item, itemIndex) => (
                                        <li key={itemIndex}>{item}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
