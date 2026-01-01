import re

HIGH_PATTERNS = [
    r"indemnify",
    r"hold harmless",
    r"not be liable",
    r"waive.*rights",
    r"unlimited liability",
]

MEDIUM_PATTERNS = [
    r"termination",
    r"confidentiality",
    r"data retention",
    r"intellectual property",
]

def classify_risk(text):
    t = text.lower()

    for p in HIGH_PATTERNS:
        if re.search(p, t):
            return "HIGH"

    for p in MEDIUM_PATTERNS:
        if re.search(p, t):
            return "MEDIUM"

    return "LOW"
