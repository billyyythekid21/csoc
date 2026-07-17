from functools import lru_cache

from sentence_transformers import SentenceTransformer

@lru_cache(maxsize=1)
def get_model():
    return SentenceTransformer("all-MiniLM-L6-v2")

def embed_text(text: str) -> list[float]:
    model = get_model()
    vector = model.encode(text, normalize_embeddings=True)
    return vector.tolist()

def embed_profile(bio: str, course: str, interests: str) -> list[float]:
    parts = []
    if course:
        parts.append(f"Studies {course}.")
    if interests:
        parts.append(f"Interested in {interests}.")
    if bio:
        parts.append(bio)
    text = " ".join(parts) if parts else "No profile yet."
    return embed_text(text)
