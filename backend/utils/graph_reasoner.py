import networkx as nx
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

def build_similarity_graph(nodes, embeddings, threshold=0.65):
    """
    nodes = list of clause_ids
    embeddings = list of vectors
    """
    G = nx.Graph()

    for i, nid in enumerate(nodes):
        G.add_node(nid, embedding=embeddings[i])

    sims = cosine_similarity(embeddings)

    for i in range(len(nodes)):
        for j in range(i + 1, len(nodes)):
            if sims[i][j] >= threshold:
                G.add_edge(nodes[i], nodes[j], weight=float(sims[i][j]))

    return G

def propagate_risk(G, risk_dict):
    """
    risk_dict = {clause_id: raw_risk_score(0–1)}
    """
    scores = {nid: risk_dict.get(nid, 0.3) for nid in G.nodes}

    for _ in range(3):  # 3 iterations
        new_scores = {}
        for nid in G.nodes:
            neigh = list(G.neighbors(nid))
            if not neigh:
                new_scores[nid] = scores[nid]
                continue

            avg = np.mean([scores[n] * G[nid][n]["weight"] for n in neigh])
            new_scores[nid] = 0.6 * scores[nid] + 0.4 * avg

        scores = new_scores

    return scores
