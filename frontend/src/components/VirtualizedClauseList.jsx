// frontend/src/components/VirtualizedClauseList.jsx
import React from 'react';
import { FixedSizeList as List } from 'react-window';

export default function VirtualizedClauseList({ clauses, renderClause, itemHeight = 150 }) {
    if (!clauses || clauses.length === 0) {
        return null;
    }

    // Calculate height - show max 5 items at once, or fewer if list is shorter
    const visibleItems = Math.min(5, clauses.length);
    const listHeight = visibleItems * itemHeight;

    const Row = ({ index, style }) => {
        const clause = clauses[index];
        return (
            <div style={style} className="clause-card-enter">
                {renderClause(clause, index)}
            </div>
        );
    };

    return (
        <List
            height={listHeight}
            itemCount={clauses.length}
            itemSize={itemHeight}
            width="100%"
            style={{
                borderRadius: '12px',
                overflow: 'auto'
            }}
        >
            {Row}
        </List>
    );
}
