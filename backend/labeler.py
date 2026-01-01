# backend/labeler.py
from fastapi import APIRouter, Request, Form, Depends
from fastapi.responses import RedirectResponse, HTMLResponse
from fastapi.templating import Jinja2Templates
from pathlib import Path
import pandas as pd
import csv

router = APIRouter()
PROJECT_ROOT = Path(__file__).resolve().parents[1]
BACKEND_ROOT = PROJECT_ROOT / "backend"
GNN_DIR = BACKEND_ROOT / "data" / "gnn"
TEMPLATES_DIR = BACKEND_ROOT / "templates"
TEMPLATES_DIR.mkdir(parents=True, exist_ok=True)

templates = Jinja2Templates(directory=str(TEMPLATES_DIR))

NODES_CSV = GNN_DIR / "nodes.csv"
LABELS_CSV = GNN_DIR / "labels.csv"

# Ensure labels file exists and aligned with nodes
def ensure_labels():
    if not NODES_CSV.exists():
        raise FileNotFoundError(f"nodes.csv not found at {NODES_CSV}")
    nodes = pd.read_csv(NODES_CSV)
    if not LABELS_CSV.exists():
        # create labels.csv with -1 for all node ids
        lbl_df = pd.DataFrame({
            "node_id": nodes["node_id"].astype(int),
            "label": [-1] * len(nodes)
        })
        lbl_df.to_csv(LABELS_CSV, index=False)
    else:
        lbl_df = pd.read_csv(LABELS_CSV)
        # if mismatch, reindex preserving existing labels where possible
        if len(lbl_df) != len(nodes):
            new_lbl = pd.DataFrame({"node_id": nodes["node_id"].astype(int)})
            new_lbl = new_lbl.merge(lbl_df, on="node_id", how="left")
            new_lbl["label"] = new_lbl["label"].fillna(-1).astype(int)
            new_lbl.to_csv(LABELS_CSV, index=False)

def load_data():
    ensure_labels()
    nodes = pd.read_csv(NODES_CSV)
    labels = pd.read_csv(LABELS_CSV)
    merged = nodes.merge(labels, on="node_id", how="left")
    merged["label"] = merged["label"].fillna(-1).astype(int)
    return merged

@router.get("/label", response_class=HTMLResponse)
def label_ui(request: Request, index: int = 0):
    """
    UI: /label?index=0
    """
    df = load_data()
    total = len(df)
    if index < 0:
        index = 0
    if index >= total:
        index = total - 1
    row = df.iloc[index]
    context = {
        "request": request,
        "index": index,
        "total": total,
        "node_id": int(row["node_id"]),
        "contract_file": row.get("contract_file", ""),
        "clause_index": int(row.get("clause_index", -1)),
        "text": row.get("text", ""),
        "current_label": int(row.get("label", -1)),
    }
    return templates.TemplateResponse("label.html", context)

@router.post("/label/submit")
def submit_label(node_id: int = Form(...), label: int = Form(...), index: int = Form(...)):
    """
    Form posts here: updates labels.csv and redirects to next index.
    label: -1/0/1/2
    """
    ensure_labels()
    # read labels, update row
    labels = pd.read_csv(LABELS_CSV)
    if node_id not in labels["node_id"].values:
        # append if missing
        labels = labels.append({"node_id": node_id, "label": int(label)}, ignore_index=True)
    else:
        labels.loc[labels["node_id"] == node_id, "label"] = int(label)
    labels.to_csv(LABELS_CSV, index=False)

    # redirect forward by default
    next_index = int(index) + 1
    return RedirectResponse(url=f"/label?index={next_index}", status_code=303)

@router.get("/label/progress", response_class=HTMLResponse)
def label_progress(request: Request):
    df = load_data()
    total = len(df)
    labeled = len(df[df["label"] != -1])
    pct = int((labeled / total) * 100) if total else 0
    html = f"""
    <html><body>
    <h3>Labeling Progress</h3>
    <p>Total clauses: {total}</p>
    <p>Labeled clauses: {labeled}</p>
    <p>Progress: {pct}%</p>
    <p><a href="/label?index=0">Start labeling</a></p>
    </body></html>
    """
    return HTMLResponse(html)
