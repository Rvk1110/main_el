import os
import json
from pathlib import Path
import pandas as pd
import numpy as np
from tqdm import tqdm
from sentence_transformers import SentenceTransformer

# -----------------------------------------
# Paths
# -----------------------------------------
PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATASET_DIR = PROJECT_ROOT / "backend" / "data" / "contracts_json"
OUT_DIR = PROJECT_ROOT / "backend" / "data" / "gnn"
OUT_DIR.mkdir(parents=True, exist_ok=True)

print("📂 Loading from:", DATASET_DIR)
print("📂 Saving to:", OUT_DIR)

# -----------------------------------------
# Load embedding model
# -----------------------------------------
print("🔍 Loading embedding model...")
model = SentenceTransformer("all-MiniLM-L6-v2")

nodes = []
edges = []
labels = []

node_counter = 0

def new_node_id():
    global node_counter
    node_counter += 1
    return node_counter

# -----------------------------------------
# Process each JSON contract
# -----------------------------------------
json_files = list(DATASET_DIR.glob("*.json"))
print(f"📄 Found {len(json_files)} contract files")

for jf in tqdm(json_files):
    data = json.load(open(jf, "r", encoding="utf-8"))
    clauses = data.get("clauses", [])

    prev_node = None

    for c in clauses:
        nid = new_node_id()

        nodes.append({
            "node_id": nid,
            "contract_file": jf.name,
            "clause_index": c["clause_index"],
            "text": c["text"]
        })

        labels.append({
            "node_id": nid,
            "label": -1  # unlabeled placeholder
        })

        # Sequential edge
        if prev_node is not None:
            edges.append({
                "src": prev_node,
                "dst": nid,
                "type": "adjacent"
            })

        prev_node = nid

# -----------------------------------------
# Build embeddings
# -----------------------------------------
print("🧠 Generating embeddings...")
texts = [n["text"] for n in nodes]
embs = model.encode(texts, convert_to_numpy=True)

emb_path = OUT_DIR / "node_embeddings.npy"
np.save(emb_path, embs)

# -----------------------------------------
# Save CSVs
# -----------------------------------------
pd.DataFrame(nodes).to_csv(OUT_DIR / "nodes.csv", index=False)
pd.DataFrame(edges).to_csv(OUT_DIR / "edges.csv", index=False)
pd.DataFrame(labels).to_csv(OUT_DIR / "labels.csv", index=False)

print("✅ DONE!")
print("Nodes:", len(nodes))
print("Edges:", len(edges))
print("Embeddings:", embs.shape)
print("Output written to", OUT_DIR)
