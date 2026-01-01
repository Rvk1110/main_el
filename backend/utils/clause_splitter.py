import re

CLAUSE_PATTERN = re.compile(
    r"""
    (                               # Start capture group
        (?:\d+\.)+                  # Numbered clauses like 1. or 1.1. or 2.5.3
        |                           # OR
        (?:Section\s+\d+)           # "Section 5"
        |                           # OR
        (?:Clause\s+\d+)            # "Clause 10"
        |                           # OR
        (?:[A-Z]\.)                 # A. B. C. style clauses
    )
    """,
    re.VERBOSE
)


def split_into_clauses(cleaned_text: str):
    """
    Splits contract text into clauses using numbering patterns.
    Returns a list of clause dicts: {id, text}
    """

    if not cleaned_text:
        return []

    # Find clause boundaries
    matches = list(CLAUSE_PATTERN.finditer(cleaned_text))

    if not matches:
        # fallback — split by long paragraphs
        paragraphs = cleaned_text.split("\n")
        return [
            {"id": f"P{i+1}", "text": p.strip()}
            for i, p in enumerate(paragraphs)
            if len(p.strip()) > 0
        ]

    clauses = []
    for i, match in enumerate(matches):
        start = match.start()

        # determine end of clause
        if i + 1 < len(matches):
            end = matches[i + 1].start()
        else:
            end = len(cleaned_text)

        clause_text = cleaned_text[start:end].strip()
        clause_id = match.group().strip()

        if len(clause_text) > 10:  # avoid junk
            clauses.append({"id": clause_id, "text": clause_text})

    return clauses
