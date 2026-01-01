import sys
import os
from pathlib import Path
import tempfile


# -------------------------------------------------------
# FIX PATHS BEFORE IMPORTING ANY BACKEND MODULES
# -------------------------------------------------------
PROJECT_ROOT = Path(__file__).resolve().parents[1]
BACKEND_ROOT = PROJECT_ROOT / "backend"
sys.path.insert(0, str(PROJECT_ROOT))

print("🚨 PROJECT ROOT:", PROJECT_ROOT)
print("🚨 BACKEND ROOT:", BACKEND_ROOT)
print("🚨 WORKING DIR:", Path(os.getcwd()).absolute())

# -------------------------------------------------------
# FASTAPI IMPORTS
# -------------------------------------------------------
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uuid
import json

# -------------------------------------------------------
# BACKEND MODULE IMPORTS
# -------------------------------------------------------
from backend.utils.risk_analyzer import analyze_clause_risk
from backend.utils.process_contract import process_contract
from backend.labeler import router as labeler_router
from backend.gnn.gnn_inference import gnn_predict_clause

# Dataset storage path
DATASET_DIR = PROJECT_ROOT / "backend" / "data" / "contracts_json"
DATASET_DIR.mkdir(parents=True, exist_ok=True)

# -------------------------------------------------------
# FASTAPI APP
# -------------------------------------------------------
app = FastAPI(title="Contract Risk Analyzer API")
app.include_router(labeler_router)

# -------------------------------------------------------
# CORS CONFIG
# -------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------
# HEALTH CHECK
# -------------------------------------------------------
@app.get("/")
def root():
    return {"message": "Contract Risk Analyzer API is running"}

# -------------------------------------------------------
# CLAUSE ANALYSIS
# -------------------------------------------------------
class ClauseRequest(BaseModel):
    text: str

@app.post("/analyze_clause")
def analyze_clause(req: ClauseRequest):
    return analyze_clause_risk(req.text)

# -------------------------------------------------------
# GNN-ONLY PREDICTION ENDPOINT
# -------------------------------------------------------
@app.post("/gnn_predict")
def gnn_predict(req: ClauseRequest):
    """
    Run ONLY the GNN model (fast, cheap, no LLM).
    """
    try:
        result = gnn_predict_clause(req.text)
        return {
            "source": "GNN",
            "risk_level": result["risk_level"],
            "confidence": result["confidence"],
            "probabilities": result["probabilities"]
        }
    except Exception as e:
        return {"error": str(e), "source": "GNN"}

# -------------------------------------------------------
# HYBRID PREDICT (GNN FIRST → LLM IF UNSURE)
# -------------------------------------------------------
@app.post("/hybrid_predict")
def hybrid_predict(req: ClauseRequest):
    """
    Use GNN first. If confidence < 0.60 → call LLM.
    """
    gnn_res = gnn_predict_clause(req.text)

    if gnn_res["confidence"] >= 0.60:
        return {
            "source": "GNN",
            "risk_level": gnn_res["risk_level"],
            "confidence": gnn_res["confidence"],
            "probabilities": gnn_res["probabilities"],
            "explanation": "High-confidence GNN prediction. No LLM used."
        }

    # fallback to LLM
    # fallback to LLM
    llm_out = analyze_clause_risk(req.text)

    return {
        "source": "HYBRID_LLM",
        "used_fallback": True,
        "fallback_reason": f"GNN confidence {gnn_res['confidence']:.2f} below threshold 0.60",
        "gnn_prediction": gnn_res,
        "llm_prediction": llm_out
    }


# -------------------------------------------------------
# DOCUMENT ANALYSIS (PDF → CLAUSES → LLM)
# -------------------------------------------------------
@app.post("/analyze_document")
async def analyze_document(file: UploadFile = File(...)):

    pdf_path = BACKEND_ROOT / f"temp_{uuid.uuid4()}_{file.filename}"
    with open(pdf_path, "wb") as f:
        f.write(await file.read())

    # 🔹 Phase 2 output: list of clean clauses
    clauses = process_contract(str(pdf_path))

    results = []

    for clause in clauses:
        clause_text = clause["text"]

        risk = analyze_clause_risk(clause_text)

        results.append({
            "clause_id": clause["clause_id"],
            "heading": clause.get("heading"),
            "text": clause_text,
            "page": clause["page"],
            "bbox": clause["bbox"],
            "risk": risk
        })

    pdf_path.unlink(missing_ok=True)

    return {
        "total_clauses": len(results),
        "results": results
    }

from fastapi import File, UploadFile
from fastapi.responses import StreamingResponse
from pdf_report import build_report
from io import BytesIO
import uuid
from pathlib import Path

# --------- Replace existing generate_report endpoints with this single robust implementation ----------
from fastapi.responses import FileResponse
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from fastapi import Body



@app.post("/generate_report")
async def generate_report(payload: dict = Body(...)):
    results = payload.get("results", [])
    print("REPORT CLAUSES:", len(results))
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    pdf_path = tmp.name
    tmp.close()
    doc = SimpleDocTemplate(pdf_path)
    styles = getSampleStyleSheet()
    elements = []
    for clause in results:
        clause_text = clause.get("text", "")

        risk = clause.get("risk", {})
        risk_level = risk.get("risk_level", "UNKNOWN")
        explanation = risk.get("explanation", "")
        rewrite = risk.get("suggested_rewrite", "")

        elements.append(Paragraph(f"<b>Risk Level:</b> {risk_level}", styles["Normal"]))
        elements.append(Spacer(1, 6))

        elements.append(Paragraph("<b>Clause:</b>", styles["Normal"]))
        elements.append(Paragraph(clause_text, styles["Normal"]))
        elements.append(Spacer(1, 6))

        if explanation:
            elements.append(Paragraph("<b>Explanation:</b>", styles["Normal"]))
            elements.append(Paragraph(explanation, styles["Italic"]))
            elements.append(Spacer(1, 6))

        if rewrite:
            elements.append(Paragraph("<b>Suggested Rewrite:</b>", styles["Normal"]))
            elements.append(Paragraph(rewrite, styles["Normal"]))
            elements.append(Spacer(1, 12))
    doc.build(elements)
    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename="contract_risk_report.pdf"
    )
    



    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    doc = SimpleDocTemplate(tmp.name)

    elements = []
    for clause in results:
        clause_text = clause.get("text", "")
        

        risk = clause.get("risk", {})
        risk_level = risk.get("risk_level", "UNKNOWN")
        print("CLAUSE:", risk_level)
        explanation = risk.get("explanation", "")
        rewrite = risk.get("suggested_rewrite", "")
    styles = getSampleStyleSheet()






    """
    Single robust PDF report generator.
    - Extract clauses with process_contract
    - For each clause run GNN first; if low confidence, run LLM
    - Normalize risk labels to strings ("LOW","MEDIUM","HIGH")
    - Produce a PDF and return it as FileResponse
    """

    # helper: normalize risk label (accepts numeric or string)
    def normalize_label(x):
        if x is None:
            return "UNKNOWN"
        if isinstance(x, int):
            return {0: "LOW", 1: "MEDIUM", 2: "HIGH"}.get(x, str(x))
        if isinstance(x, float):
            # defensive: treat floats as indexes if integer-like
            try:
                i = int(x)
                return {0: "LOW", 1: "MEDIUM", 2: "HIGH"}.get(i, str(x))
            except:
                return str(x)
        s = str(x).upper()
        # common forms: "low", "LOW", "Low Risk"
        if "LOW" in s:
            return "LOW"
        if "MED" in s:
            return "MEDIUM"
        if "HIGH" in s:
            return "HIGH"
        return s

    BACKEND_ROOT = Path(__file__).resolve().parents[1]
    tmp_in = BACKEND_ROOT / f"temp_{uuid.uuid4()}_{file.filename}"
    with open(tmp_in, "wb") as f:
        f.write(await file.read())

    # extract clauses -> DataFrame
    df = process_contract(str(tmp_in))

    clauses_out = []
    # hybrid threshold
    THRESHOLD = 0.60

    for _, row in df.iterrows():
        text = row.get("clause_text") or row.get("text") or ""
        # run GNN first (fast)
        try:
            gnn_res = gnn_predict_clause(text)
        except Exception as e:
            gnn_res = {"risk_level": None, "confidence": 0.0, "probabilities": []}

        used_llm = False
        llm_res = None
        final_label = None
        confidence = None
        probs = None

        if gnn_res and isinstance(gnn_res, dict) and gnn_res.get("confidence") is not None:
            confidence = float(gnn_res.get("confidence", 0.0))
            probs = gnn_res.get("probabilities")
            if confidence >= THRESHOLD:
                final_label = normalize_label(gnn_res.get("risk_level"))
            else:
                # call LLM fallback
                used_llm = True
                llm_res = analyze_clause_risk(text)
                # attempt to read label in various forms
                final_label = normalize_label(
                    (llm_res.get("risk_level") if isinstance(llm_res, dict) else None)
                    or (llm_res.get("risk") and llm_res["risk"].get("risk_level") if isinstance(llm_res.get("risk"), dict) else None)
                    or (llm_res.get("risk_label") if isinstance(llm_res, dict) else None)
                )
                # attach LLM confidence if present
                confidence = llm_res.get("confidence") if isinstance(llm_res, dict) and llm_res.get("confidence") is not None else confidence
        else:
            # GNN failed or returned nothing — go straight to LLM
            used_llm = True
            llm_res = analyze_clause_risk(text)
            final_label = normalize_label(
                (llm_res.get("risk_level") if isinstance(llm_res, dict) else None)
                or (llm_res.get("risk") and llm_res["risk"].get("risk_level") if isinstance(llm_res.get("risk"), dict) else None)
                or (llm_res.get("risk_label") if isinstance(llm_res, dict) else None)
            )
            confidence = llm_res.get("confidence") if isinstance(llm_res, dict) and llm_res.get("confidence") is not None else 0.0

        # Build unified clause output
        clause_record = {
            "clause_index": int(row.get("clause_index", -1)),
            "text": text,
            "risk_level": final_label or "UNKNOWN",
            "confidence": float(confidence) if confidence is not None else 0.0,
            "probabilities": probs if probs is not None else [],
            "used_llm": bool(used_llm),
            # include LLM fields if available
            "issue": (llm_res.get("issue") if isinstance(llm_res, dict) else None) or None,
            "explanation": (llm_res.get("explanation") if isinstance(llm_res, dict) else None) or None,
            "suggested_rewrite": (llm_res.get("suggested_rewrite") if isinstance(llm_res, dict) else None) or None,
        }
        clauses_out.append(clause_record)

    # Build PDF bytes using reportlab (SimpleDocTemplate)
    pdf_buffer = BytesIO()
    doc = SimpleDocTemplate(pdf_buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    story.append(Paragraph("<b>Contract Risk Report</b>", styles["Title"]))
    story.append(Spacer(1, 12))

    for c in clauses_out:
        idx = c["clause_index"]
        story.append(Paragraph(f"<b>Clause {idx}</b>", styles["Heading3"]))
        story.append(Paragraph(f"<b>Risk Level:</b> {c['risk_level']}", styles["Normal"]))
        story.append(Paragraph(f"<b>Confidence:</b> {c.get('confidence', 0.0):.2f}", styles["Normal"]))
        if c.get("issue"):
            story.append(Paragraph(f"<b>Issue:</b> {c.get('issue')}", styles["Normal"]))
        if c.get("explanation"):
            story.append(Paragraph(f"<b>Explanation:</b> {c.get('explanation')}", styles["Normal"]))
        if c.get("suggested_rewrite"):
            story.append(Paragraph(f"<b>Suggested Rewrite:</b> {c.get('suggested_rewrite')}", styles["Normal"]))
        # add snippet of text
        snippet = c["text"] if len(c["text"]) <= 800 else c["text"][:800] + "..."
        story.append(Paragraph(f"<b>Text:</b> {snippet}", styles["Normal"]))
        story.append(Spacer(1, 12))

    doc.build(story)
    pdf_bytes = pdf_buffer.getvalue()
    pdf_buffer.close()

    # save to temp file so FileResponse can stream it reliably
    out_path = BACKEND_ROOT / f"contract_report_{uuid.uuid4().hex[:8]}.pdf"
    with open(out_path, "wb") as f:
        f.write(pdf_bytes)

    # cleanup input file
    try:
        tmp_in.unlink(missing_ok=True)
    except:
        pass

    return FileResponse(out_path, filename="contract_report.pdf", media_type="application/pdf")
# -------------------------------------------------------------------------------------------------------


# -------------------------------------------------------
# EXPORT DOCUMENT → TRAINING DATASET JSON
# -------------------------------------------------------
@app.post("/export_document")
async def export_document(pdf: UploadFile = File(...)):

    temp_path = DATASET_DIR / f"temp_{uuid.uuid4()}.pdf"
    with open(temp_path, "wb") as f:
        f.write(await pdf.read())

    df = process_contract(str(temp_path))

    # Build JSON dataset
    clauses_output = []
    for _, row in df.iterrows():
        risk = analyze_clause_risk(row["clause_text"])
        clauses_output.append({
            "clause_index": int(row["clause_index"]),
            "text": row["clause_text"],
            "blocks": row["blocks"],
            "risk": risk
        })

    file_id = uuid.uuid4().hex[:8]
    out_path = DATASET_DIR / f"contract_{file_id}.json"

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump({"clauses": clauses_output}, f, indent=2)

    temp_path.unlink(missing_ok=True)

    return {
        "status": "saved",
        "file": str(out_path),
        "clauses": len(clauses_output)
    }

# -------------------------------------------------------
# HYBRID PREDICT (GNN → fallback → LLM)
# -------------------------------------------------------

from pydantic import BaseModel

class HybridRequest(BaseModel):
    text: str
    threshold: float = 0.70  # default fallback threshold

@app.post("/hybrid_predict")
def hybrid_predict(req: HybridRequest):

    text = req.text
    threshold = req.threshold

    # ------------------------------
    # 1. Run GNN first
    # ------------------------------
    gnn_out = gnn_predict_clause(text)
    gnn_conf = gnn_out["confidence"]

    # ------------------------------
    # 2. If confidence strong → trust GNN
    # ------------------------------
    if gnn_conf >= threshold:
        return {
            "source": "GNN",
            "used_fallback": False,
            "risk_level": gnn_out["risk_level"],
            "confidence": gnn_conf,
            "probabilities": gnn_out["probabilities"],
        }

    # ------------------------------
    # 3. Else → fallback to LLM
    # ------------------------------
    llm_out = analyze_clause_risk(text)

    return {
        "source": "HYBRID_LLM",
        "used_fallback": True,
        "fallback_reason": f"GNN confidence {gnn_conf:.2f} below threshold {threshold:.2f}",
        "gnn_prediction": gnn_out,
        "llm_prediction": llm_out,
    }
