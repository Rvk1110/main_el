print("RUNNING FILE:", __file__)


import re

from backend.utils.extract_text_with_bbox import extract_text_with_bbox




def clean_text(t):
    return " ".join(t.replace("\n", " ").split()).strip()


def fuzzy_ratio(a, b):
    """
    Returns fuzzy string similarity between clause and block.
    """
    return SequenceMatcher(None, a, b).ratio()


def split_into_clauses(text):
    """
    Smarter clause splitting:
    - splits on periods
    - preserves clauses longer than ~25 chars
    """
    raw = re.split(r"\.\s+", text)
    clauses = [c.strip() for c in raw if len(c.strip()) > 25]
    return clauses

def is_clause_heading(line: str) -> bool:
    line = line.strip()

    if not line:
        return False

    # Case 1: Numbered clauses (1, 1.1, 2.3.4) with or without space
    if re.match(r"^\d+(\.\d+)*(\s+|$)", line):
        return True

    # Case 2: ARTICLE / SECTION style
    if re.match(r"^(ARTICLE|SECTION)\s+\d+", line.upper()):
        return True

    # Case 3: ALL CAPS headings (short)
    if line.isupper() and len(line.split()) <= 6:
        return True

    return False

def merge_bboxes(bboxes):
    x0 = min(b[0] for b in bboxes)
    y0 = min(b[1] for b in bboxes)
    x1 = max(b[2] for b in bboxes)
    y1 = max(b[3] for b in bboxes)
    return [x0, y0, x1, y1]
def clean_clause_text(text: str) -> str:
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def process_contract(pdf_path):
    lines = extract_text_with_bbox(pdf_path)

    clauses = []
    found_heading = False
    current_clause = None

    for entry in lines:
        text = entry["line_text"]
        page = entry["page"]
        bbox = entry["bbox"]

        if is_clause_heading(text):
            found_heading = True

            # start a new clause
            if current_clause:
                clauses.append(current_clause)

            current_clause = {
                "clause_id": str(len(clauses) + 1),
                "heading": text,
                "text": "",
                "page": page,
                "bboxes": [bbox],
            }
        else:
            if current_clause is None:
                # skip text before first clause heading
                continue

            current_clause["text"] += " " + text
            current_clause["bboxes"].append(bbox)

    # main loop ends here

    if current_clause:
        clauses.append(current_clause)

    # 🔁 FALLBACK GOES HERE — BEFORE RETURN
    if not found_heading:
        clauses = []
        buffer_text = ""
        buffer_bboxes = []
        start_page = None

        for entry in lines:
            t = entry["line_text"]
            if not t.strip():
                continue

            if start_page is None:
                start_page = entry["page"]

            # If numbering appears inside text, flush previous clause
            if (
                re.search(r"\b\d+(\.\d+)*\.\s+[A-Z]", t)
                and buffer_text.strip()
            ):


                clauses.append({
                    "clause_id": str(len(clauses) + 1),
                    "heading": None,
                    "text": buffer_text.strip(),
                    "page": start_page,
                    "bboxes": buffer_bboxes,
                })
                buffer_text = ""
                buffer_bboxes = []
                start_page = entry["page"]

            buffer_text += " " + t
            buffer_bboxes.append(entry["bbox"])

            buffer_bboxes.append(entry["bbox"])

            if len(buffer_text) >= 600:
                clauses.append({
                    "clause_id": str(len(clauses) + 1),
                    "heading": None,
                    "text": buffer_text.strip(),
                    "page": start_page,
                    "bboxes": buffer_bboxes,
                })
                buffer_text = ""
                buffer_bboxes = []
                start_page = None

        if buffer_text.strip():
            clauses.append({
                "clause_id": str(len(clauses) + 1),
                "heading": None,
                "text": buffer_text.strip(),
                "page": start_page,
                "bboxes": buffer_bboxes,
            })

    # ✅ Clean up clause texts and merge bboxes
    final_clauses = []

    for c in clauses:
        final_clauses.append({
            "clause_id": c["clause_id"],
            "heading": c.get("heading"),
            "text": clean_clause_text(c["text"]),
            "page": c["page"],
            "bbox": merge_bboxes(c["bboxes"]) if c.get("bboxes") else None,
        })

    return final_clauses

