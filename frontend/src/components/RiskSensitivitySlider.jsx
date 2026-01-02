// frontend/src/components/RiskSensitivitySlider.jsx
import React, { useState } from 'react';

export default function RiskSensitivitySlider({ sensitivity, onChange, onReanalyze }) {
    const [localSensitivity, setLocalSensitivity] = useState(sensitivity || 'balanced');
    const [loading, setLoading] = useState(false);

    const sensitivityLevels = {
        conservative: {
            label: 'Conservative',
            description: 'Flag more clauses as risky. Best for high-stakes contracts.',
            color: '#ef4444',
            threshold: 0.3
        },
        balanced: {
            label: 'Balanced',
            description: 'Standard risk assessment. Recommended for most contracts.',
            color: '#f59e0b',
            threshold: 0.5
        },
        aggressive: {
            label: 'Aggressive',
            description: 'Only flag clearly risky clauses. For routine contracts.',
            color: '#10b981',
            threshold: 0.7
        }
    };

    const handleChange = async (newSensitivity) => {
        setLocalSensitivity(newSensitivity);
        if (onChange) {
            onChange(newSensitivity);
        }
    };

    const handleReanalyze = async () => {
        if (!onReanalyze) return;

        setLoading(true);
        try {
            await onReanalyze(localSensitivity);
        } catch (error) {
            console.error('Reanalysis failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const currentLevel = sensitivityLevels[localSensitivity];

    return (
        <div className="card">
            <div className="card-header">
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>Risk Sensitivity Settings</h2>
            </div>

            {/* Current Setting Display */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                padding: '24px',
                color: 'white',
                marginBottom: '24px'
            }}>
                <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Current Sensitivity Level
                </div>
                <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
                    {currentLevel.label}
                </div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>
                    {currentLevel.description}
                </div>
            </div>

            {/* Sensitivity Selector */}
            <div style={{ marginBottom: '24px' }}>
                <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#6b7280',
                    marginBottom: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                }}>
                    Select Sensitivity Level
                </label>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {Object.entries(sensitivityLevels).map(([key, level]) => (
                        <button
                            key={key}
                            onClick={() => handleChange(key)}
                            style={{
                                padding: '16px',
                                border: localSensitivity === key ? `3px solid ${level.color}` : '2px solid #e5e7eb',
                                borderRadius: '12px',
                                background: localSensitivity === key ? `${level.color}15` : 'white',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                textAlign: 'left'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <div style={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    background: level.color,
                                    border: localSensitivity === key ? '3px solid white' : 'none',
                                    boxShadow: localSensitivity === key ? `0 0 0 2px ${level.color}` : 'none'
                                }}></div>
                                <div style={{
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: localSensitivity === key ? level.color : '#374151'
                                }}>
                                    {level.label}
                                </div>
                            </div>
                            <div style={{
                                fontSize: '13px',
                                color: '#6b7280',
                                marginLeft: '32px'
                            }}>
                                {level.description}
                            </div>
                            <div style={{
                                fontSize: '12px',
                                color: '#9ca3af',
                                marginLeft: '32px',
                                marginTop: '4px'
                            }}>
                                Threshold: {level.threshold}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Re-analyze Button */}
            {onReanalyze && (
                <div style={{
                    background: '#f9fafb',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '2px solid #e5e7eb'
                }}>
                    <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600' }}>
                        Apply Changes
                    </h3>
                    <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#6b7280' }}>
                        Re-analyze the current document with the new sensitivity level to see updated results.
                    </p>
                    <button
                        onClick={handleReanalyze}
                        disabled={loading}
                        style={{
                            background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontWeight: '600',
                            border: 'none',
                            boxShadow: loading ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.4)',
                            transition: 'all 0.2s',
                            width: '100%'
                        }}
                    >
                        {loading ? 'Re-analyzing...' : 'Re-analyze Document'}
                    </button>
                </div>
            )}

            {/* Information Box */}
            <div style={{
                marginTop: '24px',
                padding: '16px',
                background: '#eff6ff',
                border: '2px solid #3b82f6',
                borderRadius: '12px'
            }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e40af', marginBottom: '8px' }}>
                    ℹ️ How It Works
                </div>
                <div style={{ fontSize: '13px', color: '#1e40af', lineHeight: '1.6' }}>
                    The sensitivity level adjusts the threshold for classifying clauses as risky.
                    Conservative mode flags more potential issues, while Aggressive mode only flags clear risks.
                </div>
            </div>
        </div>
    );
}
