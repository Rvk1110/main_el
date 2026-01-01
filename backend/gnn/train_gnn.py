# backend/gnn/train_gnn.py
import torch
import torch.nn as nn
import torch.optim as optim
import pandas as pd
import numpy as np
from torch_geometric.data import Data
from torch_geometric.nn import SAGEConv
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score

ROOT = Path(__file__).resolve().parents[1] / "data" / "gnn"
print("Loading from:", ROOT)

nodes_df = pd.read_csv(ROOT / "nodes.csv")
edges_df = pd.read_csv(ROOT / "edges.csv")
labels_df = pd.read_csv(ROOT / "labels.csv")

# parse embeddings (strings of lists) into numpy array
embs = np.vstack(nodes_df["embedding"].apply(lambda s: np.array(eval(s))).values)
X = torch.tensor(embs, dtype=torch.float)

# Labels aligned by node order (ensure same length)
y_all = labels_df["label"].values
if len(y_all) != X.shape[0]:
    raise SystemExit(f"Label count ({len(y_all)}) != node count ({X.shape[0]}). Check labels.csv alignment.")

y = torch.tensor(y_all, dtype=torch.long)

# edge_index: expects columns src,dst
if {"src","dst"}.issubset(edges_df.columns):
    edge_index = torch.tensor(edges_df[["src","dst"]].values.T, dtype=torch.long)
else:
    # If edges are stored as two-column unnamed CSV, try fallback
    edge_index = torch.tensor(edges_df.values.T, dtype=torch.long)

data = Data(x=X, edge_index=edge_index, y=y)

print("Nodes:", data.num_nodes, "Edges:", data.num_edges, "Feat dim:", data.num_node_features)

# Build labeled index list (exclude -1 labels)
labeled_mask = (data.y != -1).numpy()
labeled_indices = np.where(labeled_mask)[0]
print("Total labeled nodes:", len(labeled_indices), " / ", data.num_nodes)

if len(labeled_indices) < 2:
    raise SystemExit("Need at least 2 labeled nodes to train. Label more clauses in backend/data/gnn/labels.csv")

# Check how many classes exist among labeled nodes
unique_labels = np.unique(data.y[labeled_indices].numpy())
print("Label classes present among labeled nodes:", unique_labels)
if len(unique_labels) < 2:
    raise SystemExit("Need at least 2 distinct label classes among labeled nodes to train.")

# Split labeled indices into train/test
train_idx, test_idx = train_test_split(labeled_indices, test_size=0.25, random_state=42, stratify=data.y[labeled_indices].numpy())

train_idx = torch.tensor(train_idx, dtype=torch.long)
test_idx = torch.tensor(test_idx, dtype=torch.long)

print("Train size:", train_idx.numel(), " Test size:", test_idx.numel())

class GraphSAGE(nn.Module):
    def __init__(self, in_channels, hidden_channels, out_channels):
        super().__init__()
        self.conv1 = SAGEConv(in_channels, hidden_channels)
        self.conv2 = SAGEConv(hidden_channels, out_channels)
    def forward(self, x, edge_index):
        x = self.conv1(x, edge_index)
        x = torch.relu(x)
        x = self.conv2(x, edge_index)
        return x

model = GraphSAGE(in_channels=data.num_node_features, hidden_channels=64, out_channels=int(unique_labels.max()+1))
optimizer = optim.Adam(model.parameters(), lr=0.005)
criterion = nn.CrossEntropyLoss()

EPOCHS = 40
for epoch in range(EPOCHS):
    model.train()
    optimizer.zero_grad()
    out = model(data.x, data.edge_index)  # shape: [num_nodes, num_classes]

    # compute loss only on train indices (which are labeled)
    logits_train = out[train_idx]
    labels_train = data.y[train_idx]
    loss = criterion(logits_train, labels_train)
    loss.backward()
    optimizer.step()

    if epoch % 5 == 0 or epoch == EPOCHS-1:
        print(f"Epoch {epoch}/{EPOCHS} loss={loss.item():.4f}")

# Evaluation on test set (only labeled test nodes)
model.eval()
with torch.no_grad():
    out = model(data.x, data.edge_index)
    preds = out.argmax(dim=1)

y_test = data.y[test_idx].numpy()
pred_test = preds[test_idx].numpy()

test_acc = accuracy_score(y_test, pred_test)
test_f1 = f1_score(y_test, pred_test, average="weighted") if len(unique_labels) > 1 else 0.0

print("\nEvaluation Results:")
print("Test Accuracy:", test_acc)
print("Test F1 Score:", test_f1)

MODEL_PATH = ROOT / "gnn_model.pt"
torch.save({
    "model_state_dict": model.state_dict(),
    "num_classes": int(unique_labels.max()+1)
}, MODEL_PATH)

print("\nModel saved to:", MODEL_PATH)
print("Training complete!")
