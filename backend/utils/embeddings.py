from sentence_transformers import SentenceTransformer
import numpy as np
import hashlib
import os

# Load free model ONCE
model = SentenceTransformer("all-MiniLM-L6-v2")

EMBED_DIR = "embeddings"
os.makedirs(EMBED_DIR, exist_ok=True)

def _hash(text):
    return hashlib.md5(text.encode("utf-8")).hexdigest()

def embed_clause(text):
    h = _hash(text)
    path = os.path.join(EMBED_DIR, f"{h}.npy")

    # Load cached vector if exists
    if os.path.exists(path):
        return np.load(path)

    vec = model.encode([text])[0]
    np.save(path, vec)
    return vec
