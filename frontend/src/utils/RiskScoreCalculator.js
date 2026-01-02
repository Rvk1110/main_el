// frontend/src/utils/RiskScoreCalculator.js

/**
 * Calculate quantitative risk score (0-100) from backend analysis results
 * This is a CLIENT-SIDE calculation for academic presentation only
 */

export function calculateRiskScore(clause, backendRiskLevel, backendExplanation = '') {
    // Base score from backend risk level
    let score = 0;
    const riskLevel = (backendRiskLevel || 'low').toString().toLowerCase();

    if (riskLevel === 'high') score = 75;
    else if (riskLevel === 'medium') score = 50;
    else if (riskLevel === 'low') score = 25;

    // Adjust based on severity keywords in explanation
    const severityKeywords = {
        'critical': 20,
        'severe': 15,
        'significant': 10,
        'substantial': 10,
        'major': 8,
        'moderate': 5,
        'minor': -5,
        'minimal': -10
    };

    const explanation = backendExplanation.toLowerCase();
    for (const [keyword, adjustment] of Object.entries(severityKeywords)) {
        if (explanation.includes(keyword)) {
            score += adjustment;
            break; // Only apply first matching keyword
        }
    }

    // Additional adjustments based on risk indicators
    if (explanation.includes('unilateral')) score += 5;
    if (explanation.includes('no notice')) score += 5;
    if (explanation.includes('unlimited')) score += 8;
    if (explanation.includes('vague')) score += 3;
    if (explanation.includes('missing protection')) score += 5;

    // Clamp to 0-100 range
    return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Calculate overall contract risk score from all clause scores
 */
export function calculateOverallRiskScore(clauses) {
    if (!clauses || clauses.length === 0) return 0;

    const scores = clauses.map(c => {
        const riskLevel = (c.risk && c.risk.risk_level) || c.risk_level || 'low';
        const explanation = (c.risk && c.risk.explanation) || c.explanation || '';
        return calculateRiskScore(c.text || c.clause_text, riskLevel, explanation);
    });

    const totalScore = scores.reduce((sum, score) => sum + score, 0);
    return Math.round(totalScore / clauses.length);
}

/**
 * Apply sensitivity threshold to determine risk level from score
 */
export function applyThreshold(score, mode = 'balanced') {
    const thresholds = {
        conservative: { high: 60, medium: 30 },
        balanced: { high: 70, medium: 40 },
        aggressive: { high: 80, medium: 50 }
    };

    const t = thresholds[mode] || thresholds.balanced;

    if (score >= t.high) return 'high';
    if (score >= t.medium) return 'medium';
    return 'low';
}

/**
 * Get color for risk score
 */
export function getRiskColor(score) {
    if (score >= 70) return { bg: '#fef2f2', border: '#fecaca', text: '#991b1b', badge: '#ef4444' };
    if (score >= 40) return { bg: '#fffbeb', border: '#fde68a', text: '#92400e', badge: '#f59e0b' };
    return { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534', badge: '#10b981' };
}

/**
 * Get risk intensity for heatmap (0-1 opacity)
 */
export function getRiskIntensity(score) {
    return Math.min(1, score / 100);
}
