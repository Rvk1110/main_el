// frontend/src/components/PipelineVisualization.jsx
import React from 'react';

export default function PipelineVisualization({ currentStage = 'complete', showDetails = false }) {
    const stages = [
        {
            id: 'preprocessing',
            label: 'Preprocessing',
            icon: '📥',
            description: 'Document upload and text extraction',
            details: 'PDF parsing, text normalization, encoding detection'
        },
        {
            id: 'segmentation',
            label: 'Clause Segmentation',
            icon: '✂️',
            description: 'Breaking document into clauses',
            details: 'Sentence boundary detection, clause identification, structural analysis'
        },
        {
            id: 'classification',
            label: 'Risk Classification',
            icon: '🎯',
            description: 'Identifying risk levels',
            details: 'GNN/LLM analysis, risk level assignment, confidence scoring'
        },
        {
            id: 'semantic',
            label: 'Semantic Analysis',
            icon: '🧠',
            description: 'Understanding clause meaning',
            details: 'Context extraction, intent analysis, relationship mapping'
        },
        {
            id: 'recommendation',
            label: 'Recommendation',
            icon: '💡',
            description: 'Suggesting safer alternatives',
            details: 'Alternative generation, legal compliance check, rewrite suggestions'
        }
    ];

    const getStageStatus = (stageId) => {
        const stageIndex = stages.findIndex(s => s.id === stageId);
        const currentIndex = stages.findIndex(s => s.id === currentStage);

        if (currentStage === 'complete') return 'complete';
        if (stageIndex < currentIndex) return 'complete';
        if (stageIndex === currentIndex) return 'active';
        return 'pending';
    };

    return (
        <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            border: '2px solid #e5e7eb'
        }}>
            <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
                    Analysis Pipeline
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                    Multi-stage contract intelligence processing
                </p>
            </div>

            {/* Pipeline Flow */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: showDetails ? '24px' : '0' }}>
                {stages.map((stage, index) => {
                    const status = getStageStatus(stage.id);

                    return (
                        <React.Fragment key={stage.id}>
                            {/* Stage Node */}
                            <div style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                {/* Icon Circle */}
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '24px',
                                    background: status === 'complete' ? '#10b981' :
                                        status === 'active' ? '#3b82f6' : '#e5e7eb',
                                    color: status === 'pending' ? '#6b7280' : 'white',
                                    border: status === 'active' ? '3px solid #3b82f6' : 'none',
                                    boxShadow: status === 'active' ? '0 0 0 4px rgba(59, 130, 246, 0.2)' : 'none',
                                    transition: 'all 0.3s'
                                }}>
                                    {status === 'complete' ? '✓' : stage.icon}
                                </div>

                                {/* Label */}
                                <div style={{
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: status === 'pending' ? '#9ca3af' : '#1f2937',
                                    textAlign: 'center',
                                    lineHeight: '1.3'
                                }}>
                                    {stage.label}
                                </div>

                                {/* Description */}
                                <div style={{
                                    fontSize: '10px',
                                    color: '#6b7280',
                                    textAlign: 'center',
                                    lineHeight: '1.3',
                                    maxWidth: '120px'
                                }}>
                                    {stage.description}
                                </div>
                            </div>

                            {/* Arrow Connector */}
                            {index < stages.length - 1 && (
                                <div style={{
                                    width: '40px',
                                    height: '2px',
                                    background: status === 'complete' ? '#10b981' : '#e5e7eb',
                                    position: 'relative',
                                    top: '-35px'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        right: '-4px',
                                        top: '-3px',
                                        width: 0,
                                        height: 0,
                                        borderTop: '4px solid transparent',
                                        borderBottom: '4px solid transparent',
                                        borderLeft: `8px solid ${status === 'complete' ? '#10b981' : '#e5e7eb'}`
                                    }}></div>
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Detailed Information */}
            {showDetails && (
                <div style={{
                    marginTop: '24px',
                    padding: '16px',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                        Pipeline Details
                    </div>
                    {stages.map(stage => (
                        <div key={stage.id} style={{ marginBottom: '8px', fontSize: '11px', color: '#6b7280' }}>
                            <strong style={{ color: '#374151' }}>{stage.label}:</strong> {stage.details}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
