from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from io import BytesIO

def build_report(results):
    """
    Build a PDF from analyzed clause results.
    results: list of dicts: { "text": "...", "risk": {"risk_level": "..."} }
    """

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()

    story = []

    story.append(Paragraph("<b>Contract Risk Report</b>", styles["Title"]))
    story.append(Spacer(1, 20))

    for i, r in enumerate(results):
        clause = r.get("text", "—")
        risk = (
            r.get("risk", {}).get("risk_level")
            or r.get("risk_level")
            or "UNKNOWN"
        )

        story.append(Paragraph(f"<b>Clause {i+1}</b>", styles["Heading3"]))
        story.append(Paragraph(f"<b>Risk Level:</b> {risk}", styles["Normal"]))
        story.append(Paragraph(f"<b>Text:</b> {clause}", styles["Normal"]))
        story.append(Spacer(1, 12))

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
