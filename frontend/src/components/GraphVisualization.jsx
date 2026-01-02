// frontend/src/components/GraphVisualization.jsx
import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

export default function GraphVisualization({ graphData, onNodeClick }) {
    // Transform backend graph data to React Flow format
    const initialNodes = useMemo(() => {
        if (!graphData || !graphData.nodes) return [];

        return graphData.nodes.map((node, idx) => {
            const riskLevel = (node.risk_level || 'low').toLowerCase();
            const colors = {
                high: { bg: '#fecaca', border: '#ef4444', text: '#991b1b' },
                medium: { bg: '#fde68a', border: '#f59e0b', text: '#92400e' },
                low: { bg: '#bbf7d0', border: '#10b981', text: '#166534' }
            };
            const color = colors[riskLevel] || colors.low;

            return {
                id: node.id || `node-${idx}`,
                type: 'default',
                data: {
                    label: `Clause ${node.clause_index || idx + 1}`,
                    riskLevel: riskLevel,
                    text: node.text || node.clause_text || '',
                    ...node
                },
                position: node.position || {
                    x: (idx % 5) * 200,
                    y: Math.floor(idx / 5) * 150
                },
                style: {
                    background: color.bg,
                    border: `2px solid ${color.border}`,
                    borderRadius: '8px',
                    padding: '10px',
                    color: color.text,
                    fontWeight: '600',
                    fontSize: '12px',
                    width: 150,
                },
            };
        });
    }, [graphData]);

    const initialEdges = useMemo(() => {
        if (!graphData || !graphData.edges) return [];

        return graphData.edges.map((edge, idx) => ({
            id: edge.id || `edge-${idx}`,
            source: edge.source,
            target: edge.target,
            type: edge.type || 'default',
            label: edge.label || '',
            animated: edge.type === 'reference',
            style: {
                stroke: edge.type === 'similarity' ? '#8b5cf6' :
                    edge.type === 'reference' ? '#3b82f6' : '#6b7280',
                strokeWidth: 2
            },
        }));
    }, [graphData]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onNodeClickHandler = useCallback((event, node) => {
        console.log('Node clicked:', node);
        if (onNodeClick) {
            onNodeClick(node.data);
        }
    }, [onNodeClick]);

    if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
        return (
            <div style={{
                padding: '60px',
                textAlign: 'center',
                background: '#f9fafb',
                borderRadius: '12px',
                border: '2px dashed #e5e7eb'
            }}>
                <h3 style={{ color: '#6b7280', marginBottom: '10px' }}>No Graph Data Available</h3>
                <p style={{ color: '#9ca3af', margin: 0 }}>
                    Analyze a document to see the clause dependency graph
                </p>
            </div>
        );
    }

    return (
        <div style={{ width: '100%', height: '600px', background: 'white', borderRadius: '12px', overflow: 'hidden', border: '2px solid #e5e7eb' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClickHandler}
                fitView
                attributionPosition="bottom-left"
            >
                <Controls />
                <MiniMap
                    nodeColor={(node) => {
                        const riskLevel = node.data?.riskLevel || 'low';
                        return riskLevel === 'high' ? '#ef4444' :
                            riskLevel === 'medium' ? '#f59e0b' : '#10b981';
                    }}
                    style={{
                        background: '#f9fafb',
                        border: '1px solid #e5e7eb'
                    }}
                />
                <Background variant="dots" gap={12} size={1} />
            </ReactFlow>

            {/* Legend */}
            <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'white',
                padding: '12px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                fontSize: '12px'
            }}>
                <div style={{ fontWeight: '600', marginBottom: '8px' }}>Risk Levels</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <div style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '2px' }}></div>
                    <span>High Risk</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <div style={{ width: '12px', height: '12px', background: '#f59e0b', borderRadius: '2px' }}></div>
                    <span>Medium Risk</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', background: '#10b981', borderRadius: '2px' }}></div>
                    <span>Low Risk</span>
                </div>
            </div>
        </div>
    );
}
