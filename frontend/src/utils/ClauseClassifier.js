// frontend/src/utils/ClauseClassifier.js

/**
 * Classify clauses into semantic categories based on keywords
 * This is a CLIENT-SIDE classification for UI organization only
 */

const CATEGORY_KEYWORDS = {
    termination: {
        keywords: ['terminate', 'termination', 'cancel', 'cancellation', 'end', 'ending', 'expiration', 'expire', 'dissolution'],
        icon: '🔴',
        label: 'Termination',
        description: 'Contract ending conditions'
    },
    payment: {
        keywords: ['payment', 'pay', 'fee', 'fees', 'cost', 'costs', 'price', 'pricing', 'invoice', 'billing', 'compensation', 'remuneration'],
        icon: '💰',
        label: 'Payment',
        description: 'Financial obligations'
    },
    liability: {
        keywords: ['liability', 'liable', 'indemnify', 'indemnification', 'damages', 'loss', 'losses', 'harm', 'injury', 'negligence'],
        icon: '⚖️',
        label: 'Liability',
        description: 'Risk and responsibility'
    },
    confidentiality: {
        keywords: ['confidential', 'confidentiality', 'proprietary', 'secret', 'non-disclosure', 'nda', 'privacy', 'private'],
        icon: '🔒',
        label: 'Confidentiality',
        description: 'Information protection'
    },
    arbitration: {
        keywords: ['arbitration', 'arbitrate', 'dispute', 'disputes', 'mediation', 'court', 'litigation', 'jurisdiction', 'governing law'],
        icon: '📋',
        label: 'Arbitration',
        description: 'Dispute resolution'
    },
    intellectual_property: {
        keywords: ['intellectual property', 'ip', 'patent', 'trademark', 'copyright', 'ownership', 'license'],
        icon: '💡',
        label: 'Intellectual Property',
        description: 'IP rights and ownership'
    },
    warranty: {
        keywords: ['warranty', 'warranties', 'guarantee', 'representation', 'assurance'],
        icon: '✓',
        label: 'Warranty',
        description: 'Guarantees and representations'
    }
};

/**
 * Classify a clause into a category based on keyword matching
 */
export function classifyClause(clauseText) {
    if (!clauseText) return 'general';

    const text = clauseText.toLowerCase();

    // Check each category
    for (const [categoryId, categoryData] of Object.entries(CATEGORY_KEYWORDS)) {
        const hasKeyword = categoryData.keywords.some(keyword =>
            text.includes(keyword.toLowerCase())
        );

        if (hasKeyword) {
            return categoryId;
        }
    }

    return 'general';
}

/**
 * Get category metadata
 */
export function getCategoryInfo(categoryId) {
    if (categoryId === 'general') {
        return {
            icon: '📄',
            label: 'General',
            description: 'Other clauses'
        };
    }

    return CATEGORY_KEYWORDS[categoryId] || {
        icon: '📄',
        label: 'Unknown',
        description: 'Uncategorized'
    };
}

/**
 * Group clauses by category
 */
export function groupClausesByCategory(clauses) {
    const grouped = {};

    clauses.forEach((clause, index) => {
        const text = clause.text || clause.clause_text || '';
        const category = classifyClause(text);

        if (!grouped[category]) {
            grouped[category] = [];
        }

        grouped[category].push({
            ...clause,
            category,
            originalIndex: index
        });
    });

    return grouped;
}

/**
 * Get all available categories
 */
export function getAllCategories() {
    return [
        ...Object.keys(CATEGORY_KEYWORDS),
        'general'
    ];
}

/**
 * Get category statistics
 */
export function getCategoryStats(clauses) {
    const stats = {};

    clauses.forEach(clause => {
        const text = clause.text || clause.clause_text || '';
        const category = classifyClause(text);

        if (!stats[category]) {
            stats[category] = {
                count: 0,
                highRisk: 0,
                mediumRisk: 0,
                lowRisk: 0
            };
        }

        stats[category].count++;

        const riskLevel = ((clause.risk && clause.risk.risk_level) || clause.risk_level || 'low').toString().toLowerCase();
        if (riskLevel === 'high') stats[category].highRisk++;
        else if (riskLevel === 'medium') stats[category].mediumRisk++;
        else stats[category].lowRisk++;
    });

    return stats;
}
