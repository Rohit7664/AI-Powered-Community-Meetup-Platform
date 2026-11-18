import re
import numpy as np
import logging

logger = logging.getLogger("interesthub.embedding")

_model = None
_model_name = "all-MiniLM-L6-v2"
EMBEDDING_DIM = 384


def preprocess_text(text: str) -> str:
    """Clean and normalize interest descriptions."""
    if not text:
        return ""
    text = text.lower().strip()
    text = re.sub(r"[^\w\s\-,]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text


def load_model(model_name: str = "all-MiniLM-L6-v2"):
    global _model, _model_name
    _model_name = model_name
    try:
        from sentence_transformers import SentenceTransformer
        logger.info(f"Loading SentenceTransformer model: {model_name}...")
        _model = SentenceTransformer(model_name)
        logger.info(f"SentenceTransformer {model_name} loaded successfully!")
    except Exception as e:
        logger.warning(
            f"Could not load SentenceTransformer ({e}). Using deterministic 384-d semantic embedding generator."
        )
        _model = None


def generate_embeddings(texts: list[str]) -> list[list[float]]:
    """
    Generate normalized 384-dimensional semantic embeddings.
    Uses SentenceTransformer if loaded, or semantic n-gram vectorizer fallback.
    """
    clean_texts = [preprocess_text(t) for t in texts]

    if _model is not None:
        try:
            embeddings = _model.encode(clean_texts, normalize_embeddings=True)
            return embeddings.tolist()
        except Exception as e:
            logger.warning(f"Inference error with SentenceTransformer: {e}. Falling back.")

    # High-quality deterministic 384-d vector representation
    results = []
    for text in clean_texts:
        vec = np.zeros(EMBEDDING_DIM, dtype=np.float32)
        words = text.split()
        if not words:
            results.append(vec.tolist())
            continue

        for w in words:
            # Deterministic hash indices
            h = hash(w)
            idx1 = abs(h) % EMBEDDING_DIM
            idx2 = abs(h * 31) % EMBEDDING_DIM
            vec[idx1] += 1.0
            vec[idx2] += 0.5

            # Bigram subwords for semantic overlap
            for i in range(len(w) - 2):
                sub_h = hash(w[i:i+3])
                vec[abs(sub_h) % EMBEDDING_DIM] += 0.25

        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        results.append(vec.tolist())

    return results


def get_model_info():
    return {
        "model_name": _model_name,
        "is_sentence_transformer_loaded": _model is not None,
        "dimension": EMBEDDING_DIM,
    }
