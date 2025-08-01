import numpy as np
from sentence_transformers import SentenceTransformer

# Load model once at module level (with trust enabled)
model = SentenceTransformer("nomic-ai/nomic-embed-text-v1.5", trust_remote_code=True)

def embed_text(text: str) -> list:
    """
    Embeds and normalizes a string using the SentenceTransformer model.
    """
    if not isinstance(text, str) or not text.strip():
        return [0.0] * model.get_sentence_embedding_dimension()

    vec = model.encode(text, normalize_embeddings=True)  # Normalized for cosine similarity
    return vec.tolist()
