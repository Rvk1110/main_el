// frontend/src/components/AuditLogViewer.jsx
import React, { useState, useEffect } from 'react';

export default function AuditLogViewer() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all'); // all, clause, document

    useEffect(() => {
        fetchAuditLogs();
    }, []);

    const fetchAuditLogs = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8000/audit_log');
            if (response.ok) {
                const data = await response.json();
                setLogs(data.logs || []);
            }
        } catch (error) {
            console.error('Failed to fetch audit logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(log => {
        if (filter === 'all') return true;
        return log.action_type === filter;
    });

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString();
    };

    const getActionColor = (actionType) => {
        switch (actionType) {
            case 'clause_analysis':
                return { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af' };
            case 'document_analysis':
                return { bg: '#f0fdf4', border: '#10b981', text: '#166534' };
            case 'graph_generation':
                return { bg: '#faf5ff', border: '#8b5cf6', text: '#6b21a8' };
            default:
                return { bg: '#f9fafb', border: '#6b7280', text: '#374151' };
        }
    };

    return (
        <div className="card">
            <div className="card-header">
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>Audit Log</h2>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={fetchAuditLogs}
                        disabled={loading}
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontWeight: '600',
                            border: 'none',
                            opacity: loading ? 0.6 : 1
                        }}
                    >
                        {loading ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div style={{ margin: '20px 0', display: 'flex', gap: '10px' }}>
                {['all', 'clause_analysis', 'document_analysis'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        style={{
                            padding: '8px 16px',
                            border: filter === f ? '2px solid #667eea' : '2px solid #e5e7eb',
                            borderRadius: '8px',
                            background: filter === f ? '#667eea' : 'white',
                            color: filter === f ? 'white' : '#374151',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '600',
                            transition: 'all 0.2s',
                            textTransform: 'capitalize'
                        }}
                    >
                        {f.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* Logs Timeline */}
            {loading ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                    <div className="loader" style={{
                        border: '4px solid #f3f4f6',
                        borderTop: '4px solid #667eea',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto'
                    }}></div>
                </div>
            ) : filteredLogs.length === 0 ? (
                <div style={{
                    padding: '60px',
                    textAlign: 'center',
                    background: '#f9fafb',
                    borderRadius: '12px',
                    border: '2px dashed #e5e7eb'
                }}>
                    <h3 style={{ color: '#6b7280', marginBottom: '10px' }}>No Audit Logs</h3>
                    <p style={{ color: '#9ca3af', margin: 0 }}>
                        Analysis history will appear here
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {filteredLogs.map((log, idx) => {
                        const colors = getActionColor(log.action_type);
                        return (
                            <div
                                key={idx}
                                style={{
                                    padding: '16px',
                                    background: colors.bg,
                                    border: `2px solid ${colors.border}`,
                                    borderRadius: '12px',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                                    <div style={{
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: colors.text,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        {log.action_type?.replace('_', ' ')}
                                    </div>
                                    <span style={{
                                        fontSize: '12px',
                                        color: colors.text,
                                        opacity: 0.8
                                    }}>
                                        {formatTimestamp(log.timestamp)}
                                    </span>
                                </div>

                                {log.clause_text && (
                                    <p style={{
                                        margin: '8px 0',
                                        fontSize: '14px',
                                        color: colors.text,
                                        lineHeight: '1.6'
                                    }}>
                                        "{log.clause_text.substring(0, 150)}{log.clause_text.length > 150 ? '...' : ''}"
                                    </p>
                                )}

                                {log.result && (
                                    <div style={{ marginTop: '8px', fontSize: '13px', color: colors.text }}>
                                        <strong>Result:</strong> {log.result.risk_level || log.result.risk_label || 'N/A'}
                                        {log.result.confidence && ` (${(log.result.confidence * 100).toFixed(1)}% confidence)`}
                                    </div>
                                )}

                                {log.document_name && (
                                    <div style={{ marginTop: '4px', fontSize: '12px', color: colors.text, opacity: 0.8 }}>
                                        Document: {log.document_name}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
