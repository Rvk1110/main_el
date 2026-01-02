// frontend/src/components/ClauseAnalysisTab.jsx
import React from 'react';

export default function ClauseAnalysisTab({
  clause,
  setClause,
  modelMode,
  setModelMode,
  loadingClause,
  clauseResult,
  handleClauseAnalyze,
  clearClause,
  getRiskLabel,
  getConfidence
}) {
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
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>Analyze a Clause</h2>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            className="btn"
            onClick={clearClause}
            style={{
              background: '#f3f4f6',
              color: '#374151',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => e.target.style.background = '#e5e7eb'}
            onMouseLeave={(e) => e.target.style.background = '#f3f4f6'}
          >
            Clear
          </button>
          <button
            className="btn primary"
            onClick={handleClauseAnalyze}
            disabled={loadingClause}
            style={{
              background: loadingClause ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: loadingClause ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              boxShadow: loadingClause ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.4)',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
          >
            {loadingClause ? "Analyzing..." : "Analyze Clause"}
          </button>
        </div>
      </div>

      {/* Model Selector - Enhanced */}
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
          Analysis Model
        </label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setModelMode("gnn")}
            style={{
              flex: 1,
              padding: '12px 20px',
              border: modelMode === "gnn" ? '2px solid #8b5cf6' : '2px solid #e5e7eb',
              borderRadius: '10px',
              background: modelMode === "gnn" ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' : 'white',
              color: modelMode === "gnn" ? 'white' : '#374151',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s',
              boxShadow: modelMode === "gnn" ? '0 4px 12px rgba(139, 92, 246, 0.3)' : 'none'
            }}
            onMouseEnter={(e) => {
              if (modelMode !== "gnn") {
                e.target.style.background = '#f9fafb';
                e.target.style.borderColor = '#d1d5db';
              }
            }}
            onMouseLeave={(e) => {
              if (modelMode !== "gnn") {
                e.target.style.background = 'white';
                e.target.style.borderColor = '#e5e7eb';
              }
            }}
          >
            GNN
          </button>

          <button
            onClick={() => setModelMode("llm")}
            style={{
              flex: 1,
              padding: '12px 20px',
              border: modelMode === "llm" ? '2px solid #3b82f6' : '2px solid #e5e7eb',
              borderRadius: '10px',
              background: modelMode === "llm" ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'white',
              color: modelMode === "llm" ? 'white' : '#374151',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s',
              boxShadow: modelMode === "llm" ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none'
            }}
            onMouseEnter={(e) => {
              if (modelMode !== "llm") {
                e.target.style.background = '#f9fafb';
                e.target.style.borderColor = '#d1d5db';
              }
            }}
            onMouseLeave={(e) => {
              if (modelMode !== "llm") {
                e.target.style.background = 'white';
                e.target.style.borderColor = '#e5e7eb';
              }
            }}
          >
            LLM
          </button>

          <button
            onClick={() => setModelMode("hybrid")}
            style={{
              flex: 1,
              padding: '12px 20px',
              border: modelMode === "hybrid" ? '2px solid #10b981' : '2px solid #e5e7eb',
              borderRadius: '10px',
              background: modelMode === "hybrid" ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'white',
              color: modelMode === "hybrid" ? 'white' : '#374151',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s',
              boxShadow: modelMode === "hybrid" ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none'
            }}
            onMouseEnter={(e) => {
              if (modelMode !== "hybrid") {
                e.target.style.background = '#f9fafb';
                e.target.style.borderColor = '#d1d5db';
              }
            }}
            onMouseLeave={(e) => {
              if (modelMode !== "hybrid") {
                e.target.style.background = 'white';
                e.target.style.borderColor = '#e5e7eb';
              }
            }}
          >
            Hybrid
          </button>
        </div>
        <p style={{
          fontSize: '12px',
          color: '#6b7280',
          marginTop: '10px',
          marginBottom: 0
        }}>
          {modelMode === "gnn" && "Fast graph neural network predictions"}
          {modelMode === "llm" && "Deep language model analysis with explanations"}
          {modelMode === "hybrid" && "Best of both: GNN speed with LLM fallback"}
        </p>
      </div>

      <textarea
        className="clause-textarea"
        placeholder="Enter or paste contract clause here...

Example: 'The vendor may terminate this agreement at any time without prior notice or compensation to the client.'"
        value={clause}
        onChange={(e) => setClause(e.target.value)}
        rows={10}
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: '12px',
          border: '2px solid #e5e7eb',
          fontSize: '15px',
          fontFamily: 'inherit',
          resize: 'vertical',
          transition: 'border-color 0.2s',
          background: 'white'
        }}
        onFocus={(e) => e.target.style.borderColor = '#667eea'}
        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
      />

      {loadingClause && (
        <div style={{
          marginTop: 20,
          padding: '30px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px',
          color: 'white'
        }}>
          <div className="loader" style={{
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
            Analyzing clause with {modelMode.toUpperCase()}...
          </p>
        </div>
      )}

      {/* Enhanced Result Display */}
      {clauseResult && !loadingClause && (
        <div style={{ marginTop: 24 }}>
          {clauseResult.error ? (
            <div style={{
              padding: '20px',
              background: '#fef2f2',
              border: '2px solid #fecaca',
              borderRadius: '12px',
              color: '#991b1b'
            }}>
              <p style={{ margin: 0, fontWeight: '600' }}>❌ {clauseResult.error}</p>
            </div>
          ) : (
            <div style={{
              background: 'white',
              border: '2px solid #e5e7eb',
              borderRadius: '16px',
              overflow: 'hidden'
            }}>
              {/* Header */}
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '20px 24px',
                color: 'white'
              }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', fontWeight: '600' }}>
                  Risk Assessment Results
                </h3>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{
                    padding: '6px 16px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    background: getRiskLabel(clauseResult).toLowerCase() === "high"
                      ? '#ef4444'
                      : getRiskLabel(clauseResult).toLowerCase() === "medium"
                        ? '#f59e0b'
                        : '#10b981',
                    color: 'white'
                  }}>
                    {getRiskLabel(clauseResult)} RISK
                  </span>
                  <span style={{
                    padding: '6px 16px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: '500',
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white'
                  }}>
                    Source: {clauseResult.source ?? "LLM"}
                  </span>
                  {getConfidence(clauseResult) > 0 && (
                    <span style={{
                      padding: '6px 16px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: '500',
                      background: 'rgba(255,255,255,0.2)',
                      color: 'white'
                    }}>
                      Confidence: {(getConfidence(clauseResult) * 100).toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: '24px' }}>
                {/* Issue */}
                {clauseResult.issue && (
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '8px'
                    }}>
                      Issue Identified
                    </div>
                    <p style={{
                      margin: 0,
                      fontSize: '15px',
                      color: '#1f2937',
                      lineHeight: '1.6'
                    }}>
                      {clauseResult.issue}
                    </p>
                  </div>
                )}

                {/* Explanation */}
                {clauseResult.explanation && (
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '8px'
                    }}>
                      Explanation
                    </div>
                    <p style={{
                      margin: 0,
                      fontSize: '15px',
                      color: '#1f2937',
                      lineHeight: '1.6'
                    }}>
                      {clauseResult.explanation}
                    </p>
                  </div>
                )}

                {/* Suggested Rewrite */}
                {clauseResult.suggested_rewrite && (
                  <div style={{
                    padding: '16px',
                    background: '#f0fdf4',
                    border: '2px solid #86efac',
                    borderRadius: '12px'
                  }}>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#166534',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '8px'
                    }}>
                      Suggested Safer Alternative
                    </div>
                    <p style={{
                      margin: 0,
                      fontSize: '15px',
                      color: '#166534',
                      lineHeight: '1.6',
                      fontStyle: 'italic'
                    }}>
                      "{clauseResult.suggested_rewrite}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
