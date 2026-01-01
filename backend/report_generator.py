# backend/report_generator.py

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
import tempfile
import uuid

def generate_pdf_report(clauses):
    """
    clauses = [
        {
            "clause_index": int,
            "text": str,
            "risk_level": "LOW/MEDIUM/HIGH",
            "issue": str,
            "explanation": str,
            "suggested_rewrite": str
        }
    ]
    """

    tmp_path = tempfile.gettempdir() + f"/report_{uuid.uuid4().hex}.pdf"
    doc = SimpleDocTemplate(tmp_path, pagesize=letter)

    styles = getSampleStyleSheet()
    elements = []

    elements.append(Paragraph("<b>Contract Risk Analysis Report</b>", styles["Title"]))
    elements.append(Spacer(1, 20))

    table_data = [
        ["Clause#", "Risk", "Issue", "Explanation"]
    ]

    for c in clauses:
        table_data.append([
            str(c["clause_index"]),
            c.get("risk_level", "—"),
            c.get("issue", "—"),
            c.get("explanation", "—"),
        ])

    table = Table(table_data, colWidths=[50, 60, 150, 250])

    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("GRID", (0, 0), (-1, -1), 0.25, colors.black),
    ]))

    elements.append(table)

    doc.build(elements)
    return tmp_path
