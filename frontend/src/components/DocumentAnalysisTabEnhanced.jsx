// frontend/src/components/DocumentAnalysisTabEnhanced.jsx
import React, { useState, useMemo, lazy, Suspense } from 'react';
import PipelineVisualization from './PipelineVisualization';
import ExplainabilityPanel from './ExplainabilityPanel';
import { DocumentSkeleton } from './SkeletonLoader';
import EmptyState from './EmptyState';
import { exportToCSV, exportToJSON } from '../utils/exportUtils';
import { useToast } from '../hooks/useToast';
import { classifyClause, getCategoryInfo, groupClausesByCategory } from '../utils/ClauseClassifier';
import { calculateRiskScore, getRiskColor } from '../utils/RiskScoreCalculator';

// Lazy load PDF viewer for better performance
const PDFViewer = lazy(() => import('./PDFViewer'));

export default function DocumentAnalysisTabEnhanced({
    file,
    handleFileChange,
    loadingDoc,
    docResult,
    clearDocument,
    handleDownloadReport,
    search,
    riskFilter,
    setRiskFilter,
    viewerRef,
    sensitivity = 'balanced'
}) {
    const [groupByCategory, setGroupByCategory] = useState(false);
    const [showPipeline, setShowPipeline] = useState(false);
    const toast = useToast();

    // Export handlers
    const handleExportCSV = () => {
        try {
            const exportData = clausesWithScores.map(clause => ({
                'Clause Index': clause.clause_index ?? clause.originalIndex + 1,
                'Category': clause.category,
                'Risk Level': (clause.risk && clause.risk.risk_level) || clause.risk_level || 'unknown',
                'Risk Score': clause.riskScore,
                'Text': clause.text || clause.clause_text
            }));
            exportToCSV(exportData, 'contract_analysis.csv');
            toast.showSuccess('Exported to CSV successfully!');
        } catch (error) {
            toast.showError('Failed to export CSV');
        }
    };

    const handleExportJSON = () => {
        try {
            exportToJSON(docResult, 'contract_analysis.json');
            toast.showSuccess('Exported to JSON successfully!');
        } catch (error) {
            toast.showError('Failed to export JSON');
        }
    };

    // Calculate risk scores for all clauses
    const clausesWithScores = useMemo(() => {
        if (!docResult || !docResult.results) return [];

        return (docResult.results || []).map((clause, idx) => {
            const riskLevel = (clause.risk && clause.risk.risk_level) || clause.risk_level || 'low';
            const explanation = (clause.risk && clause.risk.explanation) || clause.explanation || '';
            const text = clause.text || clause.clause_text || '';

            return {
                ...clause,
                riskScore: calculateRiskScore(text, riskLevel, explanation),
                category: classifyClause(text),
                originalIndex: idx
            };
        });
    }, [docResult]);

    // Group clauses by category if enabled
    const groupedClauses = useMemo(() => {
        if (!groupByCategory) return null;
        return groupClausesByCategory(clausesWithScores);
    }, [clausesWithScores, groupByCategory]);

    // Filter clauses
    const filteredClauses = useMemo(() => {
        return clausesWithScores
            .filter((item) => {
                const text = item.text || item.clause_text || '';
                return text.toLowerCase().includes(search.toLowerCase());
            })
            .filter((item) => {
                if (riskFilter === "all") return true;
                const level = (item.risk && item.risk.risk_level) || item.risk_level;
                return (level && level.toString().toLowerCase() === riskFilter);
            });
    }, [clausesWithScores, search, riskFilter]);

    const renderClauseCard = (item, idx) => {
        const riskLevel = ((item.risk && item.risk.risk_level) || item.risk_level || "low").toString().toLowerCase();
        const colors = getRiskColor(item.riskScore);
        const categoryInfo = getCategoryInfo(item.category);

        return (
            <div
                key={idx}
                style={{
                    padding: '16px',
                    background: colors.bg,
                    border: `2px solid ${colors.border}`,
                    borderRadius: '12px',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    marginBottom: '12px'
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px' }}>{categoryInfo.icon}</span>
                        <div style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            color: colors.text,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            Clause {item.clause_index ?? item.originalIndex + 1}
                        </div>
                        <div style={{
                            fontSize: '11px',
                            color: colors.text,
                            opacity: 0.8,
                            background: 'rgba(0,0,0,0.05)',
                            padding: '2px 8px',
                            borderRadius: '12px'
                        }}>
                            {categoryInfo.label}
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                        <span style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            background: '#374151',
                            color: 'white'
                        }}>
                            Score: {item.riskScore}/100
                        </span>
                    </div>
                </div>
                <p style={{
                    margin: '0 0 12px 0',
                    fontSize: '14px',
                    color: colors.text,
                    lineHeight: '1.6'
                }}>
                    {item.text ?? item.clause_text}
                </p>

                {/* Explainability Panel */}
                <ExplainabilityPanel
                    clause={item}
                    backendResult={item.risk || item}
                    riskScore={item.riskScore}
                />
            </div>
        );
    };

    return (
        <div className="card">
            <div className="card-header" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '24px',
                gap: '20px',
                flexWrap: 'wrap'
            }}>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>Analyze Full Document</h2>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <label
                        className="file-upload btn"
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '14px',
                            border: 'none',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                            transition: 'all 0.2s',
                            display: 'inline-block',
                            whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                        aria-label="Choose PDF contract file"
                    >
                        <input
                            type="file"
                            accept="application/pdf"
                            onChange={handleFileChange}
                            style={{ display: "none" }}
                            aria-label="PDF file input"
                        />
                        {file ? `${file.name}` : "Choose PDF Contract"}
                    </label>

                    {docResult && (
                        <button
                            onClick={handleDownloadReport}
                            style={{
                                background: '#10b981',
                                color: 'white',
                                padding: '12px 24px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '14px',
                                border: 'none',
                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = '#059669';
                                e.target.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = '#10b981';
                                e.target.style.transform = 'translateY(0)';
                            }}
                            aria-label="Download risk analysis report as PDF"
                        >
                            Download Report
                        </button>
                    )}

                    {docResult && (
                        <>
                            <button
                                onClick={handleExportCSV}
                                style={{
                                    background: '#3b82f6',
                                    color: 'white',
                                    padding: '12px 24px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    border: 'none',
                                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                                    transition: 'all 0.2s',
                                    whiteSpace: 'nowrap'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = '#2563eb';
                                    e.target.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = '#3b82f6';
                                    e.target.style.transform = 'translateY(0)';
                                }}
                                aria-label="Export analysis to CSV"
                            >
                                Export CSV
                            </button>
                            <button
                                onClick={handleExportJSON}
                                style={{
                                    background: '#8b5cf6',
                                    color: 'white',
                                    padding: '12px 24px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    border: 'none',
                                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                                    transition: 'all 0.2s',
                                    whiteSpace: 'nowrap'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = '#7c3aed';
                                    e.target.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = '#8b5cf6';
                                    e.target.style.transform = 'translateY(0)';
                                }}
                                aria-label="Export analysis to JSON"
                            >
                                Export JSON
                            </button>
                        </>
                    )}

                    <button
                        className="btn"
                        onClick={clearDocument}
                        style={{
                            background: '#f3f4f6',
                            color: '#374151',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '14px',
                            border: 'none',
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#e5e7eb'}
                        onMouseLeave={(e) => e.target.style.background = '#f3f4f6'}
                        aria-label="Clear document and results"
                    >
                        Clear
                    </button>
                </div>
            </div>

            {/* Pipeline Visualization Toggle */}
            {docResult && (
                <div style={{ margin: '20px 0' }}>
                    <button
                        onClick={() => setShowPipeline(!showPipeline)}
                        style={{
                            padding: '8px 16px',
                            background: showPipeline ? '#3b82f6' : '#f3f4f6',
                            color: showPipeline ? 'white' : '#374151',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '13px',
                            transition: 'all 0.2s'
                        }}
                    >
                        {showPipeline ? 'Hide' : 'Show'} Analysis Pipeline
                    </button>
                </div>
            )}

            {/* Pipeline Visualization */}
            {showPipeline && docResult && (
                <div style={{ marginBottom: '20px' }}>
                    <PipelineVisualization currentStage="complete" showDetails={false} />
                </div>
            )}

            {/* Risk Filters and View Options */}
            {docResult && (
                <div style={{
                    margin: '20px 0',
                    padding: '16px',
                    background: '#f9fafb',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <label style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#6b7280',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            Filter by Risk Level
                        </label>
                        <button
                            onClick={() => setGroupByCategory(!groupByCategory)}
                            style={{
                                padding: '6px 12px',
                                background: groupByCategory ? '#3b82f6' : 'white',
                                color: groupByCategory ? 'white' : '#374151',
                                border: `2px solid ${groupByCategory ? '#3b82f6' : '#e5e7eb'}`,
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '600',
                                transition: 'all 0.2s'
                            }}
                        >
                            {groupByCategory ? '📋 Grouped View' : '📄 List View'}
                        </button>
                    </div>
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
                    <Suspense fallback={
                        <div style={{
                            padding: '40px',
                            textAlign: 'center',
                            background: '#f9fafb',
                            borderRadius: '12px'
                        }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
                            <p style={{ color: '#6b7280', margin: 0 }}>Loading PDF viewer...</p>
                        </div>
                    }>
                        <PDFViewer ref={viewerRef} file={file} />
                    </Suspense>
                </div>
            )}

            {/* LOADING INDICATOR */}
            {loadingDoc && (
                <DocumentSkeleton />
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
                            {clausesWithScores.length} clauses analyzed with quantitative risk scoring
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
                        {groupByCategory && groupedClauses ? (
                            // Grouped by Category View
                            Object.entries(groupedClauses).map(([category, clauses]) => {
                                const categoryInfo = getCategoryInfo(category);
                                return (
                                    <div key={category} style={{ marginBottom: '24px' }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            marginBottom: '12px',
                                            padding: '12px',
                                            background: '#f9fafb',
                                            borderRadius: '8px'
                                        }}>
                                            <span style={{ fontSize: '20px' }}>{categoryInfo.icon}</span>
                                            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                                                {categoryInfo.label}
                                            </h4>
                                            <span style={{
                                                fontSize: '12px',
                                                color: '#6b7280',
                                                background: '#e5e7eb',
                                                padding: '2px 8px',
                                                borderRadius: '12px'
                                            }}>
                                                {clauses.length} clause{clauses.length !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        {clauses.map((clause, idx) => renderClauseCard(clause, `${category}-${idx}`))}
                                    </div>
                                );
                            })
                        ) : (
                            // List View
                            filteredClauses.map((clause, idx) => renderClauseCard(clause, idx))
                        )}

                        {filteredClauses.length === 0 && (
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

                    {/* Academic Disclaimer */}
                    <div style={{
                        marginTop: '20px',
                        padding: '16px',
                        background: '#fef3c7',
                        border: '2px solid #fde68a',
                        borderRadius: '12px',
                        fontSize: '12px',
                        color: '#92400e'
                    }}>
                        <strong>⚠️ Decision Support Tool - Not Legal Advice</strong>
                        <p style={{ margin: '8px 0 0 0', lineHeight: '1.6' }}>
                            Risk scores are advisory and approximate, calculated using client-side heuristics for academic presentation.
                            This analysis is provided for educational and decision support purposes only.
                            Always consult qualified legal professionals for contract review and advice.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
