// frontend/src/utils/ExplainabilityParser.js

/**
 * Parse backend explanations into structured XAI format
 * This is CLIENT-SIDE parsing for better presentation only
 */

/**
 * Extract simplified explanation from backend text
 */
export function parseSimplifiedExplanation(backendExplanation) {
    if (!backendExplanation) return 'No explanation available';

    // Remove technical jargon and simplify
    let simplified = backendExplanation;

    // Replace complex terms
    const replacements = {
        'unilateral': 'one-sided',
        'indemnification': 'responsibility for damages',
        'jurisdiction': 'legal authority',
        'arbitration': 'dispute resolution',
        'proprietary': 'private/confidential'
    };

    for (const [complex, simple] of Object.entries(replacements)) {
        simplified = simplified.replace(new RegExp(complex, 'gi'), simple);
    }

    return simplified;
}

/**
 * Extract detected deviations from explanation
 */
export function parseDetectedDeviations(backendExplanation, clauseText) {
    const deviations = [];

    if (!backendExplanation) return deviations;

    const text = backendExplanation.toLowerCase();

    // Common deviation patterns
    if (text.includes('no notice') || text.includes('without notice')) {
        deviations.push('Missing notice period requirement');
    }

    if (text.includes('unilateral') || text.includes('one-sided')) {
        deviations.push('Unilateral/one-sided terms');
    }

    if (text.includes('unlimited') || text.includes('no limit')) {
        deviations.push('Unlimited liability or scope');
    }

    if (text.includes('vague') || text.includes('unclear')) {
        deviations.push('Vague or ambiguous language');
    }

    if (text.includes('no compensation') || text.includes('without compensation')) {
        deviations.push('No compensation provision');
    }

    if (text.includes('no appeal') || text.includes('final decision')) {
        deviations.push('No appeal or review process');
    }

    return deviations;
}

/**
 * Extract missing protections from explanation
 */
export function parseMissingProtections(backendExplanation) {
    const missing = [];

    if (!backendExplanation) return missing;

    const text = backendExplanation.toLowerCase();

    // Common missing protection patterns
    if (text.includes('missing') || text.includes('lacks') || text.includes('no protection')) {
        if (text.includes('notice')) {
            missing.push('Notice period clause');
        }
        if (text.includes('compensation')) {
            missing.push('Compensation or remedy clause');
        }
        if (text.includes('appeal') || text.includes('review')) {
            missing.push('Appeal or review mechanism');
        }
        if (text.includes('mutual')) {
            missing.push('Mutual agreement requirement');
        }
        if (text.includes('limitation')) {
            missing.push('Liability limitation clause');
        }
    }

    return missing;
}

/**
 * Extract risk factors from explanation
 */
export function parseRiskFactors(backendExplanation, riskLevel) {
    const factors = [];

    if (!backendExplanation) return factors;

    const text = backendExplanation.toLowerCase();

    // Extract key risk indicators
    if (text.includes('one-sided') || text.includes('unilateral')) {
        factors.push('One-sided terms favoring one party');
    }

    if (text.includes('vague') || text.includes('unclear') || text.includes('ambiguous')) {
        factors.push('Vague or ambiguous language');
    }

    if (text.includes('broad') || text.includes('wide')) {
        factors.push('Overly broad scope');
    }

    if (text.includes('no limit') || text.includes('unlimited')) {
        factors.push('Unlimited liability or obligations');
    }

    if (text.includes('discretion') || text.includes('sole discretion')) {
        factors.push('Excessive discretionary power');
    }

    if (text.includes('waive') || text.includes('waiver')) {
        factors.push('Waiver of important rights');
    }

    // Add risk level as a factor
    if (riskLevel && riskLevel.toLowerCase() === 'high') {
        factors.push('Classified as high risk by analysis');
    }

    return factors;
}

/**
 * Parse full explainability structure
 */
export function parseExplainability(clause, backendResult) {
    const explanation = backendResult.explanation || backendResult.issue || '';
    const riskLevel = backendResult.risk_level || backendResult.risk_label || 'low';
    const clauseText = clause.text || clause.clause_text || '';

    return {
        simplifiedExplanation: parseSimplifiedExplanation(explanation),
        detectedDeviations: parseDetectedDeviations(explanation, clauseText),
        missingProtections: parseMissingProtections(explanation),
        riskFactors: parseRiskFactors(explanation, riskLevel),
        originalExplanation: explanation,
        suggestedRewrite: backendResult.suggested_rewrite || null
    };
}

/**
 * Format explainability for display
 */
export function formatExplainabilityDisplay(explainability) {
    const sections = [];

    if (explainability.simplifiedExplanation) {
        sections.push({
            title: 'Explanation',
            icon: '💡',
            content: explainability.simplifiedExplanation
        });
    }

    if (explainability.detectedDeviations && explainability.detectedDeviations.length > 0) {
        sections.push({
            title: 'Detected Issues',
            icon: '⚠️',
            items: explainability.detectedDeviations
        });
    }

    if (explainability.missingProtections && explainability.missingProtections.length > 0) {
        sections.push({
            title: 'Missing Protections',
            icon: '🛡️',
            items: explainability.missingProtections
        });
    }

    if (explainability.riskFactors && explainability.riskFactors.length > 0) {
        sections.push({
            title: 'Risk Factors',
            icon: '🔍',
            items: explainability.riskFactors
        });
    }

    if (explainability.suggestedRewrite) {
        sections.push({
            title: 'Suggested Safer Alternative',
            icon: '✅',
            content: explainability.suggestedRewrite
        });
    }

    return sections;
}
