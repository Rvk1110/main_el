// frontend/src/components/DocumentAnalysisTab.jsx
import React from 'react';
import PDFViewer from './PDFViewer';

export default function DocumentAnalysisTab({
    file,
    handleFileChange,
    loadingDoc,
    docResult,
    clearDocument,
    handleDownloadReport,
    search,
    riskFilter,
    setRiskFilter,
    viewerRef
}) {
    return (
        <div className="card">
            <div className="card-header">
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>Analyze Full Document</h2>

                <div className="card-actions" style={{ gap: 12, display: 'flex', flexWrap: 'wrap' }}>
                    <label
                        className="file-upload btn"
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            border: 'none',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                            transition: 'all 0.2s',
                            display: 'inline-block'
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                        <input
                            type="file"
                            accept="application/pdf"
                            onChange={handleFileChange}
                            style={{ display: "none" }}
                        />
                        {file ? `${file.name}` : "Choose PDF Contract"}
                    </label>

                    {docResult && (
                        <button
                            onClick={handleDownloadReport}
                            style={{
                                background: '#10b981',
                                color: 'white',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                border: 'none',
                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = '#059669';
                                e.target.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = '#10b981';
                                e.target.style.transform = 'translateY(0)';
                            }}
                        >
                            Download Report
                        </button>
                    )}

                    <button
                        className="btn"
                        onClick={clearDocument}
                        style={{
                            background: '#f3f4f6',
                            color: '#374151',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            border: 'none',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#e5e7eb'}
                        onMouseLeave={(e) => e.target.style.background = '#f3f4f6'}
                    >
                        Clear
                    </button>
                </div>
            </div>

            {/* Risk Filters */}
            {docResult && (
                <div style={{
                    margin: '20px 0',
                    padding: '16px',
                    background: '#f9fafb',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb'
                }}>
                    <label style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#6b7280',
                        marginBottom: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        Filter by Risk Level
                    </label>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {["all", "high", "medium", "low"].map((lvl) => (
                            <button
                                key={lvl}
                                onClick={() => setRiskFilter(lvl)}
                                style={{
                                    padding: '8px 16px',
                                    border: riskFilter === lvl ? '2px solid #667eea' : '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    background: riskFilter === lvl ? '#667eea' : 'white',
                                    color: riskFilter === lvl ? 'white' : '#374151',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    transition: 'all 0.2s',
                                    textTransform: 'capitalize'
                                }}
                                onMouseEnter={(e) => {
                                    if (riskFilter !== lvl) {
                                        e.target.style.background = '#f9fafb';
                                        e.target.style.borderColor = '#d1d5db';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (riskFilter !== lvl) {
                                        e.target.style.background = 'white';
                                        e.target.style.borderColor = '#e5e7eb';
                                    }
                                }}
                            >
                                {lvl === "all" ? "All" :
                                    lvl === "high" ? "High" :
                                        lvl === "medium" ? "Medium" : "Low"}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* PDF VIEWER */}
            {file && (
                <div style={{
                    marginTop: 20,
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '2px solid #e5e7eb'
                }}>
                    <PDFViewer ref={viewerRef} file={file} />
                </div>
            )}

            {/* LOADING INDICATOR */}
            {loadingDoc && (
                <div style={{
                    marginTop: 20,
                    padding: '40px',
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '12px',
                    color: 'white'
                }}>
                    <div className="loader" style={{
                        border: '4px solid rgba(255,255,255,0.3)',
                        borderTop: '4px solid white',
                        borderRadius: '50%',
                        width: '50px',
                        height: '50px',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 20px'
                    }}></div>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '20px' }}>Analyzing Contract...</h3>
                    <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
                        Extracting clauses, analyzing risks, and generating insights
                    </p>
                    <p style={{ margin: '10px 0 0 0', opacity: 0.8, fontSize: '12px' }}>
                        This may take a few moments depending on contract length
                    </p>
                </div>
            )}

            {/* DOCUMENT RESULTS */}
            {docResult && !loadingDoc && (
                <div style={{ marginTop: 24 }}>
                    {/* Summary Header */}
                    <div style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        padding: '20px 24px',
                        borderRadius: '12px 12px 0 0',
                        color: 'white',
                        marginBottom: '0'
                    }}>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '600' }}>
                            Document Analysis Results
                        </h3>
                        <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
                            {(docResult.results ?? docResult.clauses ?? []).length} clauses analyzed
                        </p>
                    </div>

                    {/* Clauses List */}
                    <div style={{
                        background: 'white',
                        border: '2px solid #e5e7eb',
                        borderTop: 'none',
                        borderRadius: '0 0 12px 12px',
                        padding: '20px'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {(docResult.results ?? docResult.clauses ?? [])
                                .filter((item) =>
                                    item.text.toLowerCase().includes(search.toLowerCase())
                                )
                                .filter((item) => {
                                    if (riskFilter === "all") return true;
                                    const level = (item.risk && item.risk.risk_level) || item.risk_level;
                                    return (level && level.toString().toLowerCase() === riskFilter);
                                })
                                .map((item, idx) => {
                                    const riskLevel = ((item.risk && item.risk.risk_level) || item.risk_level || "low").toString().toLowerCase();
                                    const riskColors = {
                                        high: { bg: '#fef2f2', border: '#fecaca', text: '#991b1b', badge: '#ef4444' },
                                        medium: { bg: '#fffbeb', border: '#fde68a', text: '#92400e', badge: '#f59e0b' },
                                        low: { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534', badge: '#10b981' }
                                    };
                                    const colors = riskColors[riskLevel] || riskColors.low;

                                    return (
                                        <div
                                            key={idx}
                                            style={{
                                                padding: '16px',
                                                background: colors.bg,
                                                border: `2px solid ${colors.border}`,
                                                borderRadius: '12px',
                                                transition: 'all 0.2s',
                                                cursor: 'pointer'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                                                <div style={{
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    color: colors.text,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px'
                                                }}>
                                                    Clause {item.clause_index ?? idx + 1}
                                                </div>
                                                <span style={{
                                                    padding: '4px 12px',
                                                    borderRadius: '12px',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    background: colors.badge,
                                                    color: 'white'
                                                }}>
                                                    {((item.risk && item.risk.risk_level) || item.risk_level || "UNKNOWN").toString().toUpperCase()}
                                                </span>
                                            </div>
                                            <p style={{
                                                margin: 0,
                                                fontSize: '14px',
                                                color: colors.text,
                                                lineHeight: '1.6'
                                            }}>
                                                {item.text ?? item.clause_text}
                                            </p>
                                        </div>
                                    );
                                })}
                        </div>

                        {(docResult.results ?? docResult.clauses ?? []).filter((item) =>
                            item.text.toLowerCase().includes(search.toLowerCase())
                        ).filter((item) => {
                            if (riskFilter === "all") return true;
                            const level = (item.risk && item.risk.risk_level) || item.risk_level;
                            return (level && level.toString().toLowerCase() === riskFilter);
                        }).length === 0 && (
                                <div style={{
                                    padding: '40px',
                                    textAlign: 'center',
                                    color: '#6b7280'
                                }}>
                                    <p style={{ margin: 0, fontSize: '16px' }}>
                                        No clauses match the current filters
                                    </p>
                                </div>
                            )}
                    </div>
                </div>
            )}
        </div>
    );
}
