# backend/utils/extract_text_with_bbox.py
import fitz  # PyMuPDF
from typing import List, Dict, Any


def _clean_whitespace(s: str) -> str:
    return " ".join(s.replace("\u00A0", " ").split()).strip()


def extract_text_with_bbox(pdf_path: str) -> List[Dict[str, Any]]:
    """
    Extract line-level text and detailed spans (word-level) with bounding boxes.

    Output format (list of line entries):
    [
      {
        "page": 0,
        "line_text": "This is a line of text.",
        "bbox": [x0, y0, x1, y1],            # line bbox (float)
        "spans": [
           { "text": "This", "bbox": [x0,y0,x1,y1] },
           ...
        ]
      },
      ...
    ]

    Coordinates: same coordinate space as PyMuPDF (origin bottom-left).
    """
    doc = fitz.open(pdf_path)
    out = []

    for page_number, page in enumerate(doc):
        # get a structured representation
        # 'dict' gives hierarchy: blocks -> lines -> spans
        try:
            page_dict = page.get_text("dict")
        except Exception as e:
            # fallback: skip page if extraction fails
            print(f"[extract_text_with_bbox] page {page_number} get_text('dict') failed: {e}")
            continue

        # iterate blocks in reading order
        for block in page_dict.get("blocks", []):
            # lines present in text blocks
            for line in block.get("lines", []):
                # join spans to form full line text
                spans = line.get("spans", [])
                if not spans:
                    continue

                line_text_parts = []
                span_entries = []

                # Compute bbox of line from spans if line doesn't have bbox
                x0_line, y0_line, x1_line, y1_line = None, None, None, None

                for sp in spans:
                    txt = sp.get("text", "")
                    if not txt.strip():
                        continue

                    # PyMuPDF span bbox keys: 'bbox' or 'origin' + 'size' in some versions
                    bbox = sp.get("bbox")
                    if not bbox:
                        # try fallback keys
                        bbox = sp.get("origin")
                        if bbox and isinstance(bbox, (list, tuple)) and len(bbox) >= 2:
                            # we can't compute x1,y1 from origin alone; skip bbox then
                            bbox = None

                    # add text
                    line_text_parts.append(txt)

                    if bbox:
                        # bbox is [x0, y0, x1, y1]
                        sx0, sy0, sx1, sy1 = float(bbox[0]), float(bbox[1]), float(bbox[2]), float(bbox[3])

                        span_entries.append({
                            "text": _clean_whitespace(txt),
                            "bbox": [sx0, sy0, sx1, sy1]
                        })

                        # expand line bbox
                        if x0_line is None:
                            x0_line, y0_line, x1_line, y1_line = sx0, sy0, sx1, sy1
                        else:
                            x0_line = min(x0_line, sx0)
                            y0_line = min(y0_line, sy0)
                            x1_line = max(x1_line, sx1)
                            y1_line = max(y1_line, sy1)
                    else:
                        # still include span without bbox (rare)
                        span_entries.append({
                            "text": _clean_whitespace(txt),
                            "bbox": None
                        })

                if not line_text_parts:
                    continue

                line_text = _clean_whitespace(" ".join(line_text_parts))

                # If spans didn't provide bbox, attempt to compute using line 'bbox' property
                # In PyMuPDF, some versions provide 'bbox' on line object:
                line_bbox_obj = line.get("bbox")
                if (x0_line is None or y0_line is None) and line_bbox_obj:
                    try:
                        lx0, ly0, lx1, ly1 = float(line_bbox_obj[0]), float(line_bbox_obj[1]), float(line_bbox_obj[2]), float(line_bbox_obj[3])
                        x0_line, y0_line, x1_line, y1_line = lx0, ly0, lx1, ly1
                    except Exception:
                        pass

                # final bbox fallback: calculate from block bbox if still None
                if (x0_line is None or y0_line is None) and block.get("bbox"):
                    try:
                        bx0, by0, bx1, by1 = block["bbox"]
                        x0_line, y0_line, x1_line, y1_line = float(bx0), float(by0), float(bx1), float(by1)
                    except Exception:
                        pass

                if x0_line is None or y0_line is None:
                    # if absolutely no bbox, skip this line (should be rare)
                    continue

                out.append({
                    "page": page_number,
                    "line_text": line_text,
                    "bbox": [float(x0_line), float(y0_line), float(x1_line), float(y1_line)],
                    "spans": span_entries
                })

    doc.close()
    return out
