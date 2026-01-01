FEW_SHOT_EXAMPLES = [
    {
        "query": "termination notice period",
        "clause": "Either party may terminate this agreement with only 3 days of notice.",
        "expected_output": {
            "risk_level": "HIGH",
            "issue": "Unreasonably short termination notice period.",
            "explanation": "3 days is insufficient for business continuity and exposes the party to abrupt termination risks.",
            "suggested_rewrite": "Either party may terminate this agreement with at least 30 days prior written notice.",
            "source_clauses": ["Termination"]
        }
    },
    {
        "query": "liability limitation",
        "clause": "The service provider shall have no liability for any damages, regardless of cause.",
        "expected_output": {
            "risk_level": "HIGH",
            "issue": "Unlimited liability waiver heavily favors the service provider.",
            "explanation": "A clause that removes all liability is unfair and exposes the client to significant financial risk.",
            "suggested_rewrite": "The service provider's liability shall be limited to direct damages up to the amount paid in the last 12 months.",
            "source_clauses": ["Liability"]
        }
    },
    {
        "query": "confidentiality",
        "clause": "The recipient may disclose confidential information to third parties without consent.",
        "expected_output": {
            "risk_level": "HIGH",
            "issue": "Unrestricted disclosure of confidential information.",
            "explanation": "Allowing disclosure without permission compromises privacy, IP, and business security.",
            "suggested_rewrite": "The recipient shall not disclose any confidential information to third parties without prior written consent of the disclosing party.",
            "source_clauses": ["Confidentiality"]
        }
    }
]
