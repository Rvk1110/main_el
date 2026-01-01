# backend/gnn/build_gnn_dataset.py
import json
import pandas as pd
from pathlib import Path
from sentence_transformers import SentenceTransformer

# Paths
ROOT = Path(__file__).resolve().parents[1] / "data" / "contracts_json"
OUT = Path(__file__).resolve().parents[1] / "data" / "gnn"
OUT.mkdir(parents=True, exist_ok=True)

print("Reading JSON dataset from:", ROOT)

# Load embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")

nodes = []
edges = []

node_id = 0

for json_file in sorted(ROOT.glob("*.json")):
    with open(json_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    clauses = data.get("clauses", [])
    prev_node = None

    for clause in clauses:
        text = clause.get("text", "") or ""

        # Generate embedding
        emb = model.encode(text).tolist()

        nodes.append({
            "node_id": int(node_id),
            "contract_file": json_file.name,
            "clause_index": int(clause.get("clause_index", -1)),
            "text": text.replace("\n", " "),  # remove multiline text
            "embedding": emb
        })

        # Sequential edge
        if prev_node is not None:
            edges.append({"src": int(prev_node), "dst": int(node_id)})

        prev_node = node_id
        node_id += 1

# Save nodes
nodes_df = pd.DataFrame(nodes)
nodes_df.to_csv(OUT / "nodes.csv", index=False)

# Save edges
edges_df = pd.DataFrame(edges)
edges_df.to_csv(OUT / "edges.csv", index=False)

# Create labels file
labels_df = pd.DataFrame({
    "node_id": nodes_df["node_id"],
    "label": [-1] * len(nodes_df)
})
labels_df.to_csv(OUT / "labels.csv", index=False)

print("Dataset built successfully!")
print("Nodes:", len(nodes_df))
print("Edges:", len(edges_df))
print("Output saved to:", OUT)
