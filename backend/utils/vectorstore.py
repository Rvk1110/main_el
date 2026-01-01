import os
import numpy as np
import pandas as pd
from pathlib import Path

from chromadb import PersistentClient
from backend.utils.embeddings import ClauseEmbedder

DEFAULT_PERSIST_DIR = "chromadb_store"


def get_chroma_client(persist_directory: str = DEFAULT_PERSIST_DIR):
    """
    Returns a PersistentClient with the new Chroma API.
    """
    return PersistentClient(path=persist_directory)


def build_chroma_collection(
    csv_path: str,
    embeddings_npy: str,
    collection_name: str = "clauses",
    persist_directory: str = DEFAULT_PERSIST_DIR,
    overwrite: bool = True,
):
    """
    Build a persistent Chroma collection using updated API.
    """
    csv_path = Path(csv_path)
    if not csv_path.exists():
        raise FileNotFoundError(f"CSV not found: {csv_path}")

    df = pd.read_csv(csv_path)

    emb_path = Path(embeddings_npy)
    if not emb_path.exists():
        raise FileNotFoundError(f"Embeddings file not found: {emb_path}")

    vectors = np.load(emb_path)

    if len(vectors) != len(df):
        raise ValueError("Embeddings count does not match CSV rows.")

    client = get_chroma_client(persist_directory)

    # delete old collection if needed
    if overwrite:
        try:
            client.delete_collection(collection_name)
        except:
            pass

    # create fresh collection
    collection = client.get_or_create_collection(name=collection_name)

    ids = [f"{csv_path.stem}_{i+1}" for i in range(len(df))]
    documents = df["clause_text"].fillna("").tolist()
    metadatas = df[
        ["clause_index", "clause_id", "length", "source_file"]
    ].to_dict(orient="records")

    collection.add(
        ids=ids,
        embeddings=vectors.tolist(),
        documents=documents,
        metadatas=metadatas,
    )

    print(
        f"[INFO] Built collection '{collection_name}' with {len(ids)} items (persisted at {persist_directory})"
    )

    return collection


def retrieve_similar(
    query: str,
    collection_name: str = "clauses",
    top_k: int = 3,
    persist_directory: str = DEFAULT_PERSIST_DIR,
):
    """
    Semantic search using updated Chroma API.
    """
    client = get_chroma_client(persist_directory)
    collection = client.get_or_create_collection(name=collection_name)

    embedder = ClauseEmbedder()
    query_vec = embedder.encode(query)[0].tolist()

    results = collection.query(
        query_embeddings=[query_vec],
        n_results=top_k,
    )

    return results
