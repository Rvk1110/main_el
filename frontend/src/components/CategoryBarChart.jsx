// frontend/src/components/CategoryBarChart.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const CATEGORY_COLORS = {
    'Payment Terms': '#3b82f6',
    'Termination': '#ef4444',
    'Liability': '#f59e0b',
    'Confidentiality': '#8b5cf6',
    'Intellectual Property': '#10b981',
    'General': '#6b7280'
};

export default function CategoryBarChart({ data }) {
    if (!data || data.length === 0) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                No data available
            </div>
        );
    }

    // Count clauses by category
    const categoryCounts = data.reduce((acc, clause) => {
        const category = clause.category || 'General';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
    }, {});

    const chartData = Object.entries(categoryCounts).map(([name, count]) => ({
        name,
        count,
        color: CATEGORY_COLORS[name] || '#6b7280'
    }));

    return (
        <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            border: '2px solid #e5e7eb'
        }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
                Clause Categories
            </h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Number of Clauses">
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
