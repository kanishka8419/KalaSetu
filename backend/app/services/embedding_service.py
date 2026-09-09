"""
Embedding & FAISS service — manages vector embeddings for semantic search.
Mock implementation uses random vectors; swap for Sentence-Transformers in production.
"""

import os
import numpy as np
from typing import Optional
from app.config import settings

# FAISS index — lazy loaded
_faiss_index = None
_id_map: dict[int, str] = {}  # Maps FAISS index position → product_id
_next_id: int = 0


def _get_index():
    """Lazy-initialize FAISS index."""
    global _faiss_index, _next_id, _id_map
    if _faiss_index is None:
        try:
            import faiss
            _faiss_index = faiss.IndexFlatIP(settings.EMBEDDING_DIMENSION)  # Inner product (cosine sim on normalized vecs)
        except ImportError:
            # Fallback: numpy-based similarity if faiss not installed
            _faiss_index = "numpy_fallback"
    return _faiss_index


class EmbeddingService:
    """
    Embedding generation and FAISS vector search.
    Mock: uses random vectors. Real: use sentence-transformers model.
    """

    def __init__(self):
        self._embeddings_store: dict[str, np.ndarray] = {}  # product_id → vector (for numpy fallback)

    def generate_embedding(self, text: str) -> np.ndarray:
        """Generate a text embedding vector. Mock returns deterministic pseudo-random vector."""
        # In production: model.encode(text) via sentence-transformers
        np.random.seed(hash(text) % (2**31))
        vec = np.random.randn(settings.EMBEDDING_DIMENSION).astype(np.float32)
        # Normalize for cosine similarity
        vec = vec / (np.linalg.norm(vec) + 1e-8)
        return vec

    def add_to_index(self, product_id: str, text: str) -> int:
        """Generate embedding for text and add to FAISS index."""
        global _next_id, _id_map
        vec = self.generate_embedding(text)
        index = _get_index()

        if index == "numpy_fallback":
            self._embeddings_store[product_id] = vec
            return len(self._embeddings_store) - 1
        else:
            import faiss
            vec_2d = vec.reshape(1, -1)
            index.add(vec_2d)
            idx = _next_id
            _id_map[idx] = product_id
            _next_id += 1
            return idx

    def search_similar(self, query_text: str, top_k: int = 10) -> list[tuple[str, float]]:
        """Search for similar products by text query. Returns (product_id, score) pairs."""
        query_vec = self.generate_embedding(query_text)
        index = _get_index()

        if index == "numpy_fallback":
            if not self._embeddings_store:
                return []
            scores = []
            for pid, vec in self._embeddings_store.items():
                similarity = float(np.dot(query_vec, vec))
                scores.append((pid, similarity))
            scores.sort(key=lambda x: x[1], reverse=True)
            return scores[:top_k]
        else:
            import faiss
            if index.ntotal == 0:
                return []
            query_2d = query_vec.reshape(1, -1)
            k = min(top_k, index.ntotal)
            scores, indices = index.search(query_2d, k)
            results = []
            for i, idx in enumerate(indices[0]):
                if idx >= 0 and idx in _id_map:
                    results.append((_id_map[idx], float(scores[0][i])))
            return results

    def remove_from_index(self, product_id: str):
        """Remove a product from the embedding store (numpy fallback only)."""
        self._embeddings_store.pop(product_id, None)


embedding_service = EmbeddingService()
