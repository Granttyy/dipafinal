import math
import re
from collections import defaultdict
from typing import Any, Dict, Iterable, List, Optional, Tuple

import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

from utils.vectorizer import embed_text

# ---------------------------------------------
# Utility helpers
# ---------------------------------------------

def _to_float(value: Any) -> Optional[float]:
    """Best-effort conversion of tuition-like fields to a float.
    Handles numbers as strings like "₱50,000 - 60,000 per sem" by extracting the average.
    Returns None if it cannot parse a number.
    """
    if value is None:
        return None

    if isinstance(value, (int, float)):
        return float(value)

    if isinstance(value, str):
        # Grab all numbers (with optional commas/decimals)
        nums = [
            float(n.replace(",", ""))
            for n in re.findall(r"\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+(?:\.\d+)?", value)
        ]
        if not nums:
            return None
        # Average if range present
        return float(sum(nums) / len(nums))

    return None


def _normalize_vec(v: np.ndarray) -> np.ndarray:
    v = np.asarray(v, dtype=float)
    n = np.linalg.norm(v)
    if n == 0 or not np.isfinite(n):
        return v
    return v / n


def _safe_program_vector(entry: Dict[str, Any]) -> Optional[np.ndarray]:
    """Return an embedding for the program.
    Priority:
      1) Existing vector if usable
      2) Embed from concatenated text fields (name, description, tags, outcomes)
    Returns None if nothing to embed.
    """
    vec = entry.get("vector")
    if isinstance(vec, list) or isinstance(vec, np.ndarray):
        vec = np.asarray(vec, dtype=float)
        if vec.size > 0 and np.all(np.isfinite(vec)):
            return _normalize_vec(vec)

    # Build text to embed if vector missing/invalid
    name = str(entry.get("name") or entry.get("program_name") or "").strip()
    desc = str(entry.get("description") or "").strip()
    tags = entry.get("tags") or entry.get("skills") or []
    if isinstance(tags, (list, tuple)):
        tags_text = " ".join(map(str, tags))
    else:
        tags_text = str(tags)

    extras = [str(entry.get(k, "")) for k in ("outcomes", "keywords", "specializations")]
    payload = " ".join([name, desc, tags_text] + extras).strip()

    if not payload:
        return None

    try:
        emb = embed_text(payload)
        return _normalize_vec(np.asarray(emb, dtype=float))
    except Exception:
        return None


def _tokenize(text: str) -> List[str]:
    return re.findall(r"[a-z0-9]+", (text or "").casefold())


def _keyword_overlap_score(user_text: str, program_text: str) -> float:
    """A lightweight keyword match: Jaccard over tokens with IDF-ish dampening.
    Returns 0..1.
    """
    u = set(_tokenize(user_text))
    p = set(_tokenize(program_text))
    if not u or not p:
        return 0.0
    inter = len(u & p)
    # Dampen very short user queries
    denom = max(len(u), 4)
    return min(1.0, inter / denom)


def _school_type_score(preferred: Optional[str], got: str) -> float:
    if not preferred or preferred.lower() == "any":
        return 0.5  # neutral
    return 1.0 if preferred.strip().casefold() == (got or "").strip().casefold() else 0.0


def _location_score(preferred_locs: Optional[Iterable[str]], got_loc: str) -> float:
    if not preferred_locs:
        return 0.5  # neutral
    got = (got_loc or "").casefold()
    for loc in preferred_locs:
        if loc and str(loc).casefold() in got:
            return 1.0
    return 0.0


def _budget_score(max_budget: Optional[float], tuition: Optional[float]) -> float:
    if max_budget is None or tuition is None:
        return 0.5  # neutral
    if tuition <= max_budget:
        return 1.0
    # Soft falloff: within +20% => partial credit
    if tuition <= 1.2 * max_budget:
        return 0.6
    return 0.0


def _compose_program_text(entry: Dict[str, Any]) -> str:
    fields = [
        entry.get("name"),
        entry.get("program_name"),
        entry.get("description"),
        " ".join(map(str, entry.get("tags", []) or [])),
        " ".join(map(str, entry.get("skills", []) or [])),
        str(entry.get("school") or entry.get("school_name") or ""),
    ]
    return " \n".join([str(x) for x in fields if x])


# ---------------------------------------------
# Core similarity + diversification
# ---------------------------------------------

def compute_similarity(user_embedding: np.ndarray, program_embedding: np.ndarray) -> float:
    """Cosine similarity between two embeddings (returns 0..1 after rescale)."""
    u = _normalize_vec(np.asarray(user_embedding, dtype=float))
    p = _normalize_vec(np.asarray(program_embedding, dtype=float))
    # sklearn returns [-1,1]; map to [0,1]
    sim = float(cosine_similarity([u], [p])[0][0])
    return 0.5 * (sim + 1.0)


def _mmr_select(
    candidates: List[Dict[str, Any]],
    query_vec: np.ndarray,
    top_n: int,
    lambda_diversity: float = 0.3,
    similarity_key: str = "semantic_score",
    vector_key: str = "_vec",
) -> List[Dict[str, Any]]:
    """Maximal Marginal Relevance selection to promote diversity across picks.

    Args:
        candidates: items containing precomputed similarity and vectors
        query_vec: normalized query vector
        top_n: number to select
        lambda_diversity: 0..1 (higher => more diversity)
    """
    selected: List[Dict[str, Any]] = []
    rest = candidates.copy()

    def cos(u: np.ndarray, v: np.ndarray) -> float:
        return float(np.dot(u, v))

    while rest and len(selected) < top_n:
        best = None
        best_score = -1e9
        for item in rest:
            rel = item.get(similarity_key, 0.0)
            if not selected:
                mmr = rel
            else:
                max_sim_to_selected = max(
                    cos(item[vector_key], s[vector_key]) for s in selected if vector_key in s and s[vector_key] is not None
                )
                mmr = lambda_diversity * rel - (1 - lambda_diversity) * max_sim_to_selected
            if mmr > best_score:
                best_score = mmr
                best = item
        selected.append(best)
        rest.remove(best)

    return selected


# ---------------------------------------------
# Public API
# ---------------------------------------------

def recommend_programs(
    user_input: str,
    school_data: List[Dict[str, Any]],
    school_type: Optional[str] = None,
    locations: Optional[List[str]] = None,
    max_budget: Optional[float] = None,
    min_score: Optional[float] = None,
    top_n: int = 10,
    ensure_top_n: bool = True,
    weights: Optional[Dict[str, float]] = None,
    diversity_lambda: float = 0.3,
) -> List[Dict[str, Any]]:
    """Generate program recommendations with improved accuracy + diversity.

    Scoring blends:
      - semantic similarity (major weight)
      - keyword overlap (user text vs program text)
      - soft preferences: school_type, locations, budget

    It also deduplicates by (school_name, program_name) and merges descriptions.

    If `ensure_top_n` is True, this function will progressively relax thresholds and
    backfill to return up to `top_n` results when the dataset size allows it.

    Notes on guarantees:
      • If the dataset has at least `top_n` usable entries, you will always get `top_n` results.
      • If the dataset itself has fewer usable entries, you'll get as many as exist.
    """
    # -- Prepare query embedding --
    user_vec_raw = embed_text(user_input)
    user_vec = _normalize_vec(np.asarray(user_vec_raw, dtype=float))

    # -- Weights (tune as needed) --
    w = {
        "semantic": 0.65,
        "keyword": 0.15,
        "budget": 0.08,
        "location": 0.06,
        "school_type": 0.06,
    }
    if weights:
        w.update({k: float(v) for k, v in weights.items() if k in w})

    # -- Score all items (soft filters to allow backfilling)
    scored: List[Dict[str, Any]] = []

    for entry in school_data:
        # Vector
        vec = _safe_program_vector(entry)
        if vec is None:
            # Skip if truly nothing to compare
            continue

        # Tuition parsing
        tuition = (
            _to_float(entry.get("tuition_per_semester"))
            or _to_float(entry.get("tuition_annual"))
            or _to_float(entry.get("tuition"))
        )

        # Soft preference scores
        st_score = _school_type_score(school_type, str(entry.get("school_type", "")))
        loc_score = _location_score(locations, str(entry.get("location", "")))
        bud_score = _budget_score(max_budget, tuition)

        # Semantic + keyword
        sem = compute_similarity(user_vec, vec)
        kw = _keyword_overlap_score(user_input, _compose_program_text(entry))

        # Composite
        final = (
            w["semantic"] * sem
            + w["keyword"] * kw
            + w["budget"] * bud_score
            + w["location"] * loc_score
            + w["school_type"] * st_score
        )

        enriched = dict(entry)
        enriched.update(
            {
                "score": round(float(final), 6),
                "semantic_score": round(float(sem), 6),
                "keyword_score": round(float(kw), 6),
                "budget_score": round(float(bud_score), 6),
                "location_score": round(float(loc_score), 6),
                "school_type_score": round(float(st_score), 6),
                "_vec": vec,  # keep for MMR
                "_tuition_numeric": tuition,
                "_reasons": _build_reasons(sem, kw, bud_score, loc_score, st_score, entry),
            }
        )
        scored.append(enriched)

    if not scored:
        return []

    # -- Deduplicate by (school_name, program_name)
    deduped: Dict[str, Dict[str, Any]] = {}
    desc_map: defaultdict[str, List[str]] = defaultdict(list)

    for prog in scored:
        school_name = str(
            prog.get("school") or prog.get("school_name") or ""
        ).strip().casefold()
        program_name = str(prog.get("name") or prog.get("program_name") or "").strip().casefold()
        key = f"{school_name}::{program_name}"

        desc_map[key].append(str(prog.get("description", "")).strip())

        if key not in deduped or prog["score"] > deduped[key]["score"]:
            deduped[key] = prog

    for key, prog in deduped.items():
        merged_desc = " ".join(
            sorted({d for d in desc_map[key] if d}, key=lambda x: (-len(x), x))
        )
        prog["description"] = merged_desc

    items = list(deduped.values())

    # -- Dynamic thresholding (percentile) if min_score not provided
    if min_score is None:
        # Target: keep roughly the top 40–60% depending on spread
        scores = np.array([p["score"] for p in items], dtype=float)
        pctl = float(np.nanpercentile(scores, 50))  # median
        min_score_eff = max(0.3, min(0.75, pctl))
    else:
        min_score_eff = float(min_score)

    # -- Pre-sort by score
    items.sort(key=lambda p: p["score"], reverse=True)

    # -- First cut by threshold
    preselected = [p for p in items if p["score"] >= min_score_eff]

    # -- Ensure enough by relaxing progressively if requested
    if ensure_top_n and len(preselected) < top_n:
        # lower threshold stepwise until we have enough or exhausted
        thresholds = np.linspace(min_score_eff, 0.0, num=5, endpoint=True)
        pool = preselected.copy()
        for th in thresholds[1:]:
            if len(pool) >= top_n:
                break
            pool = [p for p in items if p["score"] >= float(th)]
        preselected = pool if pool else items[: max(top_n, 1)]

    # -- Diversify with MMR (based on semantic vectors)
    diversified = _mmr_select(preselected, user_vec, min(top_n, len(preselected)), diversity_lambda)

    # -- Backfill if still short and dataset allows
    if ensure_top_n and len(diversified) < top_n:
        chosen_ids = {id(p) for p in diversified}
        for p in items:
            if id(p) in chosen_ids:
                continue
            diversified.append(p)
            if len(diversified) >= top_n:
                break

    # Final slice; if dataset has fewer than top_n, this returns all of them
    result = diversified[: min(top_n, len(diversified))]

    # Remove internal keys
    for r in result:
        r.pop("_vec", None)
        r.pop("_tuition_numeric", None)

    return result


def _build_reasons(
    sem: float, kw: float, bud: float, loc: float, st: float, entry: Dict[str, Any]
) -> List[str]:
    reasons: List[str] = []
    name = str(entry.get("name") or entry.get("program_name") or "This program").strip()
    if sem >= 0.6:
        reasons.append("Strong semantic match to your interests")
    elif sem >= 0.5:
        reasons.append("Good overall fit to your described goals")

    if kw >= 0.4:
        reasons.append("Relevant keywords align with your query")

    if bud >= 1.0:
        reasons.append("Inside your budget")
    elif bud >= 0.6:
        reasons.append("Slightly above budget but close")

    if loc >= 1.0:
        reasons.append("Matches your preferred location")

    if st >= 1.0:
        reasons.append("Matches your preferred school type")

    if not reasons:
        reasons.append(f"{name} is a reasonable alternative worth considering")
    return reasons
