import numpy as np
from typing import List, Optional, Dict, Any
from sklearn.metrics.pairwise import cosine_similarity
from utils.vectorizer import embed_text


def compute_similarity(user_embedding: np.ndarray, program_embedding: np.ndarray) -> float:
    return float(cosine_similarity([user_embedding], [program_embedding])[0][0])


def recommend_programs(
    user_input: str,
    school_data: List[Dict[str, Any]],
    school_type: Optional[str] = None,
    locations: Optional[List[str]] = None,
    max_budget: Optional[float] = None,
    min_score: float = 0.3,
    top_n: int = 10
) -> List[Dict[str, Any]]:
    user_embedding = embed_text(user_input)
    scored_programs = []

    for entry in school_data:
        # --- Filter by school_type ---
        if school_type and school_type.lower() != "any":
            if entry.get("school_type", "").lower() != school_type.lower():
                continue

        # --- Filter by location ---
        if locations:
            location_match = any(
                loc.lower() in entry.get("location", "").lower()
                for loc in locations if loc.strip()
            )
            if not location_match:
                continue

        # --- Filter by budget ---
        if max_budget is not None:
            tuition = (
                entry.get("tuition_per_semester") or
                entry.get("tuition_annual") or
                entry.get("tuition") or 0
            )
            if isinstance(tuition, (int, float)) and tuition > max_budget:
                continue

        # --- Skip if vector is invalid ---
        vector = entry.get("vector")
        if not isinstance(vector, list) or len(vector) != 768:
            continue

        # --- Compute similarity ---
        score = compute_similarity(user_embedding, np.array(vector))
        enriched_entry = entry.copy()
        enriched_entry["score"] = round(score, 4)
        scored_programs.append(enriched_entry)

    # --- Sort by score ---
    scored_programs.sort(key=lambda p: p["score"], reverse=True)

    # --- Take programs above threshold ---
    top_matches = [p for p in scored_programs if p["score"] >= min_score]

    # --- Fill in with extras if not enough ---
    if len(top_matches) < top_n:
        additional = [p for p in scored_programs if p not in top_matches]
        top_matches.extend(additional[:top_n - len(top_matches)])

    return top_matches[:top_n]
