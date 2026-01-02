// frontend/src/components/DashboardMetrics.jsx
import React from 'react';

export default function DashboardMetrics({ metrics }) {
    if (!metrics) {
        return (
            <div style={{
                padding: '60px',
                textAlign: 'center',
                background: '#f9fafb',
                borderRadius: '12px',
                border: '2px dashed #e5e7eb'
            }}>
                <h3 style={{ color: '#6b7280', marginBottom: '10px' }}>No Metrics Available</h3>
                <p style={{ color: '#9ca3af', margin: 0 }}>
                    Analyze a document to see contract risk metrics
                </p>
            </div>
        );
    }

    const { totalClauses = 0, highRisk = 0, mediumRisk = 0, lowRisk = 0, overallScore = 0 } = metrics;

    // Calculate percentages
    const highPercent = totalClauses > 0 ? (highRisk / totalClauses) * 100 : 0;
    const mediumPercent = totalClauses > 0 ? (mediumRisk / totalClauses) * 100 : 0;
    const lowPercent = totalClauses > 0 ? (lowRisk / totalClauses) * 100 : 0;

    // Determine overall risk level
    const getOverallRiskLevel = () => {
        if (overallScore >= 70) return { label: 'HIGH RISK', color: '#ef4444', bg: '#fef2f2' };
        if (overallScore >= 40) return { label: 'MEDIUM RISK', color: '#f59e0b', bg: '#fffbeb' };
        return { label: 'LOW RISK', color: '#10b981', bg: '#f0fdf4' };
    };

    const riskLevel = getOverallRiskLevel();

    return (
        <div>
            {/* Overall Risk Score Card */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '16px',
                padding: '32px',
                color: 'white',
                marginBottom: '24px',
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)'
            }}>
                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Overall Contract Risk Score
                </div>
                <div style={{ fontSize: '64px', fontWeight: '700', marginBottom: '12px' }}>
                    {overallScore.toFixed(1)}
                    <span style={{ fontSize: '32px', opacity: 0.8 }}>/100</span>
                </div>
                <div style={{
                    display: 'inline-block',
                    padding: '8px 20px',
                    borderRadius: '20px',
                    background: 'rgba(255,255,255,0.2)',
                    fontSize: '14px',
                    fontWeight: '600'
                }}>
                    {riskLevel.label}
                </div>
            </div>

            {/* Statistics Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '24px'
            }}>
                {/* Total Clauses */}
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '2px solid #e5e7eb'
                }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Total Clauses
                    </div>
                    <div style={{ fontSize: '36px', fontWeight: '700', color: '#1f2937' }}>
                        {totalClauses}
                    </div>
                </div>

                {/* High Risk */}
                <div style={{
                    background: '#fef2f2',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '2px solid #fecaca'
                }}>
                    <div style={{ fontSize: '12px', color: '#991b1b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        High Risk
                    </div>
                    <div style={{ fontSize: '36px', fontWeight: '700', color: '#991b1b' }}>
                        {highRisk}
                    </div>
                    <div style={{ fontSize: '12px', color: '#991b1b', marginTop: '4px' }}>
                        {highPercent.toFixed(1)}%
                    </div>
                </div>

                {/* Medium Risk */}
                <div style={{
                    background: '#fffbeb',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '2px solid #fde68a'
                }}>
                    <div style={{ fontSize: '12px', color: '#92400e', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Medium Risk
                    </div>
                    <div style={{ fontSize: '36px', fontWeight: '700', color: '#92400e' }}>
                        {mediumRisk}
                    </div>
                    <div style={{ fontSize: '12px', color: '#92400e', marginTop: '4px' }}>
                        {mediumPercent.toFixed(1)}%
                    </div>
                </div>

                {/* Low Risk */}
                <div style={{
                    background: '#f0fdf4',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '2px solid #bbf7d0'
                }}>
                    <div style={{ fontSize: '12px', color: '#166534', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Low Risk
                    </div>
                    <div style={{ fontSize: '36px', fontWeight: '700', color: '#166534' }}>
                        {lowRisk}
                    </div>
                    <div style={{ fontSize: '12px', color: '#166534', marginTop: '4px' }}>
                        {lowPercent.toFixed(1)}%
                    </div>
                </div>
            </div>

            {/* Risk Distribution Bar */}
            <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '24px',
                border: '2px solid #e5e7eb'
            }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>Risk Distribution</h3>
                <div style={{
                    display: 'flex',
                    height: '40px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    background: '#f3f4f6'
                }}>
                    {highPercent > 0 && (
                        <div style={{
                            width: `${highPercent}%`,
                            background: '#ef4444',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: '600'
                        }}>
                            {highPercent > 10 && `${highPercent.toFixed(0)}%`}
                        </div>
                    )}
                    {mediumPercent > 0 && (
                        <div style={{
                            width: `${mediumPercent}%`,
                            background: '#f59e0b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: '600'
                        }}>
                            {mediumPercent > 10 && `${mediumPercent.toFixed(0)}%`}
                        </div>
                    )}
                    {lowPercent > 0 && (
                        <div style={{
                            width: `${lowPercent}%`,
                            background: '#10b981',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: '600'
                        }}>
                            {lowPercent > 10 && `${lowPercent.toFixed(0)}%`}
                        </div>
                    )}
                </div>

                {/* Legend */}
                <div style={{ display: 'flex', gap: '20px', marginTop: '16px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '2px' }}></div>
                        <span>High ({highRisk})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '12px', height: '12px', background: '#f59e0b', borderRadius: '2px' }}></div>
                        <span>Medium ({mediumRisk})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '12px', height: '12px', background: '#10b981', borderRadius: '2px' }}></div>
                        <span>Low ({lowRisk})</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
