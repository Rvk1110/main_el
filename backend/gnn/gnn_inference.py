# backend/gnn/gnn_inference.py
import torch
import pandas as pd
import numpy as np
from pathlib import Path
from torch_geometric.nn import SAGEConv
from sentence_transformers import SentenceTransformer
from torch.nn import functional as F

# 1. SETUP PATHS
ROOT = Path(__file__).resolve().parents[1] / "data" / "gnn"
nodes_df = pd.read_csv(ROOT / "nodes.csv")
edges_df = pd.read_csv(ROOT / "edges.csv")

# 2. LOAD GRAPH DATA
# Parse embeddings (stored as strings in CSV)
embs_list = [np.array(eval(s)) for s in nodes_df["embedding"].values]
X_train = torch.tensor(np.vstack(embs_list), dtype=torch.float)

# Load Edges
edge_index_train = torch.tensor(edges_df[["src", "dst"]].values.T, dtype=torch.long)

# Load Embedding Model
embed_model = SentenceTransformer("all-MiniLM-L6-v2")

# 3. DEFINE MODEL (Must match train_gnn.py exactly)
class GraphSAGE(torch.nn.Module):
    def __init__(self, in_channels, hidden_channels, out_channels):
        super().__init__()
        self.conv1 = SAGEConv(in_channels, hidden_channels)
        self.conv2 = SAGEConv(hidden_channels, out_channels)

    def forward(self, x, edge_index):
        x = self.conv1(x, edge_index)
        x = torch.relu(x)
        x = self.conv2(x, edge_index)
        return x

# 4. LOAD WEIGHTS
checkpoint = torch.load(ROOT / "gnn_model.pt", map_location=torch.device("cpu"))
num_classes = checkpoint.get("num_classes", 3)
model = GraphSAGE(X_train.shape[1], 64, num_classes)
model.load_state_dict(checkpoint["model_state_dict"])
model.eval()

def gnn_predict_clause(text: str, k_neighbors=3):
    """
    Predicts risk by connecting the new clause to the 'k' most similar
    clauses in the training set (Transductive Inference).
    """
    # A. Embed the new text
    new_emb = embed_model.encode(text).reshape(1, -1)
    new_emb_tensor = torch.tensor(new_emb, dtype=torch.float)

    # B. Find k-Nearest Neighbors in X_train to create edges
    # Calculate Cosine Similarity between new node and all training nodes
    # Normalize for cosine calc
    x_norm = F.normalize(X_train, p=2, dim=1)
    new_norm = F.normalize(new_emb_tensor, p=2, dim=1)
    
    # Dot product
    scores = torch.mm(new_norm, x_norm.t()).squeeze() # shape: [num_training_nodes]
    
    # Get top K indices
    topk_scores, topk_indices = torch.topk(scores, k=k_neighbors)
    
    # C. Build Dynamic Edges
    # Edges: [source, target]. Source = New Node (index = len(X_train)), Target = Training Nodes
    new_node_idx = X_train.shape[0]
    
    new_edges_src = []
    new_edges_dst = []
    
    for neighbor_idx in topk_indices:
        # Bi-directional connection
        new_edges_src.extend([new_node_idx, neighbor_idx.item()])
        new_edges_dst.extend([neighbor_idx.item(), new_node_idx])
        
    new_edges = torch.tensor([new_edges_src, new_edges_dst], dtype=torch.long)
    
    # D. Combine Graph (Train + New Node)
    X_combined = torch.cat([X_train, new_emb_tensor], dim=0)
    edge_index_combined = torch.cat([edge_index_train, new_edges], dim=1)
    
    # E. Inference
    with torch.no_grad():
        out = model(X_combined, edge_index_combined)
        
    # The result for our new node is the LAST row
    logits = out[-1]
    probs = torch.softmax(logits, dim=0)
    
    pred_class = int(torch.argmax(probs))
    confidence = float(torch.max(probs))
    
    return {
        "risk_level": pred_class, # 0=Low, 1=Med, 2=High
        "confidence": confidence,
        "probabilities": probs.tolist()
    }