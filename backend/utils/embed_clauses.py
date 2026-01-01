import pandas as pd
import numpy as np
from pathlib import Path

from backend.utils.embeddings import ClauseEmbedder

def embed_clauses(csv_path: str, save_npy: bool = True):
    """
    Loads clause CSV, embeds each clause using MiniLM, 
    and saves embeddings to embeddings/<file>.npy
    """
    csv_path = Path(csv_path)
    if not csv_path.exists():
        raise FileNotFoundError(f"Clause CSV not found: {csv_path}")

    print(f"[INFO] Loading CSV: {csv_path}")
    df = pd.read_csv(csv_path)

    embedder = ClauseEmbedder()
    texts = df["clause_text"].tolist()

    print("[INFO] Embedding clauses...")
    vectors = embedder.encode(texts)

    df["embedding"] = vectors.tolist()

    if save_npy:
        out_dir = Path("embeddings")
        out_dir.mkdir(exist_ok=True)

        out_path = out_dir / f"{csv_path.stem}_embeddings.npy"
        np.save(out_path, vectors)
        print(f"[INFO] Saved embeddings to: {out_path.resolve()}")

    return df
