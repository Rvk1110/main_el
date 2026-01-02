// frontend/src/components/RiskDistributionChart.jsx
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#10b981'
};

export default function RiskDistributionChart({ data }) {
    if (!data || data.length === 0) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                No data available
            </div>
        );
    }

    const chartData = [
        { name: 'High Risk', value: data.filter(d => d.risk === 'high').length, color: COLORS.high },
        { name: 'Medium Risk', value: data.filter(d => d.risk === 'medium').length, color: COLORS.medium },
        { name: 'Low Risk', value: data.filter(d => d.risk === 'low').length, color: COLORS.low }
    ].filter(item => item.value > 0);

    return (
        <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            border: '2px solid #e5e7eb'
        }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
                Risk Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
