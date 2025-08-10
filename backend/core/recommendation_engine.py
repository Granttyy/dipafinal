# core/recommendation_engine.py
import numpy as np
from typing import List, Optional, Dict, Any
from collections import defaultdict
from sklearn.metrics.pairwise import cosine_similarity
from utils.vectorizer import embed_text


def compute_similarity(user_embedding: np.ndarray, program_embedding: np.ndarray) -> float:
    """Compute cosine similarity between two embeddings."""
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
    """Generate program recommendations based on user input & filters."""
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

    # --- Deduplicate by (school_name, program_name) ---
    deduped = {}
    desc_map = defaultdict(list)

    for prog in scored_programs:
        school_name = str(prog.get("school", prog.get("school_name", ""))).strip().lower()
        program_name = str(prog.get("name", "")).strip().lower()
        key = f"{school_name}::{program_name}"

        desc_map[key].append(prog.get("description", "").strip())

        if key not in deduped or prog["score"] > deduped[key]["score"]:
            deduped[key] = prog

    # --- Merge descriptions ---
    for key, prog in deduped.items():
        merged_desc = " ".join(set(d for d in desc_map[key] if d))
        prog["description"] = merged_desc

    # --- Sort & threshold ---
    unique_programs = list(deduped.values())
    unique_programs.sort(key=lambda p: p["score"], reverse=True)

    top_matches = [p for p in unique_programs if p["score"] >= min_score]

    # --- Fill in extras if needed ---
    if len(top_matches) < top_n:
        additional = [p for p in unique_programs if p not in top_matches]
        top_matches.extend(additional[:top_n - len(top_matches)])

    return top_matches[:top_n]
