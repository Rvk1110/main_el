// frontend/src/components/Sidebar.jsx
import React, { useState } from 'react';

export default function Sidebar({ tab, setTab, clauseResult, docResult }) {
  const [collapsed, setCollapsed] = useState(false);

  const getRiskLabel = (res) => {
    if (!res) return "UNKNOWN";
    if (res.risk_label) return res.risk_label;
    if (typeof res.risk_level === "string") return res.risk_level;
    if (typeof res.risk_level === "number") {
      const map = { 0: "LOW", 1: "MEDIUM", 2: "HIGH" };
      return map[res.risk_level] ?? String(res.risk_level);
    }
    return "UNKNOWN";
  };

  const getConfidence = (res) => {
    if (!res) return 0;
    if (typeof res.confidence === "number") return res.confidence;
    if (res.gnn_prediction && typeof res.gnn_prediction.confidence === "number")
      return res.gnn_prediction.confidence;
    return 0;
  };

  const navItems = [
    { id: 'clause', label: 'Clause Analysis', icon: '📝' },
    { id: 'document', label: 'Document Analysis', icon: '📄' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div
      style={{
        width: collapsed ? '70px' : '280px',
        background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
        zIndex: 1000,
        overflowY: 'auto',
        overflowX: 'hidden'
      }}
    >
      {/* Header with Toggle */}
      <div style={{
        padding: collapsed ? '20px 10px' : '20px',
        borderBottom: '1px solid rgba(255,255,255,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between'
      }}>
        {!collapsed && (
          <h2 style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: '600',
            whiteSpace: 'nowrap'
          }}>
            AI ClauseGuard
          </h2>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Navigation Items */}
      <div style={{ padding: collapsed ? '10px 5px' : '20px 10px', flex: 1 }}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            style={{
              width: '100%',
              padding: collapsed ? '12px 0' : '12px 16px',
              marginBottom: '8px',
              background: tab === item.id ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
              border: tab === item.id ? '2px solid rgba(255,255,255,0.4)' : '2px solid transparent',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontSize: collapsed ? '20px' : '14px',
              fontWeight: tab === item.id ? '600' : '500',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: '10px',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => {
              if (tab !== item.id) {
                e.target.style.background = 'rgba(255,255,255,0.15)';
              }
            }}
            onMouseLeave={(e) => {
              if (tab !== item.id) {
                e.target.style.background = 'rgba(255,255,255,0.1)';
              }
            }}
          >
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </div>

      {/* Analysis Summary */}
      {!collapsed && (
        <div style={{
          padding: '20px',
          borderTop: '1px solid rgba(255,255,255,0.2)'
        }}>
          {/* Clause Analysis Summary */}
          {tab === 'clause' && clauseResult && !clauseResult.error && (
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <div style={{
                fontSize: '11px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '8px',
                opacity: 0.9
              }}>
                Last Analysis
              </div>
              <div style={{
                fontSize: '20px',
                fontWeight: '700',
                marginBottom: '4px'
              }}>
                {getRiskLabel(clauseResult)}
              </div>
              {getConfidence(clauseResult) > 0 && (
                <div style={{
                  fontSize: '12px',
                  opacity: 0.9
                }}>
                  Confidence: {(getConfidence(clauseResult) * 100).toFixed(1)}%
                </div>
              )}
              {clauseResult.source && (
                <div style={{
                  fontSize: '11px',
                  opacity: 0.8,
                  marginTop: '4px'
                }}>
                  Source: {clauseResult.source}
                </div>
              )}
            </div>
          )}

          {/* Document Analysis Summary */}
          {tab === 'document' && docResult && (docResult.results || docResult.clauses) && (
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <div style={{
                fontSize: '11px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '8px',
                opacity: 0.9
              }}>
                Document Summary
              </div>
              <div style={{
                fontSize: '20px',
                fontWeight: '700',
                marginBottom: '8px'
              }}>
                {(docResult.results ?? docResult.clauses ?? []).length} Clauses
              </div>
              {(() => {
                const clauses = docResult.results ?? docResult.clauses ?? [];
                const high = clauses.filter(c => {
                  const level = (c.risk && c.risk.risk_level) || c.risk_level;
                  return level && level.toString().toLowerCase() === 'high';
                }).length;
                const medium = clauses.filter(c => {
                  const level = (c.risk && c.risk.risk_level) || c.risk_level;
                  return level && level.toString().toLowerCase() === 'medium';
                }).length;
                const low = clauses.filter(c => {
                  const level = (c.risk && c.risk.risk_level) || c.risk_level;
                  return level && level.toString().toLowerCase() === 'low';
                }).length;

                return (
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>
                    <div style={{ marginBottom: '4px' }}>🔴 High: {high}</div>
                    <div style={{ marginBottom: '4px' }}>🟡 Medium: {medium}</div>
                    <div>🟢 Low: {low}</div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
