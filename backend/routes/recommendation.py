# routes/recommendation.py
import logging
from typing import Dict, List, Optional
from collections import defaultdict

from fastapi import APIRouter
from pydantic import BaseModel

from core.recommendation_engine import recommend_programs
from database.mongo import db

router = APIRouter()
logger = logging.getLogger("uvicorn.error")


# -----------------------------
# Models
# -----------------------------
class UserAnswers(BaseModel):
    academics: List[str] = []
    fields: List[str] = []
    activities: List[str] = []
    goals: List[str] = []
    environment: List[str] = []
    custom: Dict[str, str] = {}


class RecommendationRequest(BaseModel):
    answers: UserAnswers
    school_type: Optional[str] = "any"
    locations: List[str] = []
    max_budget: Optional[float] = None


# -----------------------------
# Helpers
# -----------------------------
def format_user_input(answers: UserAnswers) -> str:
    join = lambda items: ", ".join(items) if items else "None"
    parts = [
        f"Subjects I enjoy: {join(answers.academics)}.",
        f"Fields I'm drawn to: {join(answers.fields)}.",
        f"Activities I enjoy: {join(answers.activities)}.",
        f"Career goals: {join(answers.goals)}.",
        f"Preferred work environment: {join(answers.environment)}."
    ]
    parts += [f"Custom {k}: {v.strip()}." for k, v in answers.custom.items() if v.strip()]
    return " ".join(parts)


def to_float(value) -> Optional[float]:
    try:
        if isinstance(value, str):
            value = value.replace("₱", "").replace(",", "").replace("$", "").strip()
        return float(value) if value != "" and value is not None else None
    except (ValueError, TypeError):
        return None


def to_str(val, default="") -> str:
    return str(val) if val is not None else default


# -----------------------------
# Routes
# -----------------------------
@router.post("/recommend")
async def recommend_handler(request: RecommendationRequest):
    try:
        # 1. Format user answers
        user_input = format_user_input(request.answers)

        # 2. Load program vectors
        vectors = list(db["program_vectors"].find({}))
        if not vectors:
            return {"results": [], "message": "⚠️ No programs with vectors found in database."}

        # 3. Get matches from engine
        matches = recommend_programs(
            user_input=user_input,
            school_data=vectors,
            school_type=request.school_type,
            locations=request.locations,
            max_budget=request.max_budget,
        )

        # 4. Load detailed program info
        try:
            detailed_lookup = {
                p.get("name", "").strip().lower(): p
                for p in db["all_programs"].find({})
                if isinstance(p.get("name"), str) and p.get("name").strip()
            }
        except Exception:
            logger.exception("Error loading detailed program data")
            detailed_lookup = {}

        # 5. Enrich matches
        results = []
        for prog in matches:
            try:
                prog_name = to_str(prog.get("name")).strip()
                detailed = detailed_lookup.get(prog_name.lower())
                source_doc = detailed or prog

                def safe_get(doc, key, fallback=None):
                    val = doc.get(key, fallback)
                    if isinstance(val, (list, dict)):
                        return fallback
                    return val if val is not None else fallback

                results.append({
                    "program_id": to_str(prog.get("_id") or prog.get("program_id")),
                    "name": prog_name or "Unnamed Program",
                    "description": to_str(prog.get("description")),
                    "school": {
                        "name": to_str(safe_get(source_doc, "school", prog.get("school"))),
                        "type": to_str(safe_get(source_doc, "school_type", prog.get("school_type", "unknown"))),
                        "location": to_str(safe_get(source_doc, "location", prog.get("location", "unknown"))),
                        "tuition_per_semester": to_float(safe_get(source_doc, "tuition_per_semester", prog.get("tuition_per_semester"))),
                        "miscellaneous_fees_per_semester": to_float(safe_get(source_doc, "miscellaneous_fees_per_semester", prog.get("miscellaneous_fees_per_semester"))),
                        "tuition_annual": to_float(safe_get(source_doc, "tuition_annual", prog.get("tuition_annual"))),
                        "admission_requirements": safe_get(source_doc, "admission_requirements", prog.get("admission_requirements")),
                        "grade_requirements": safe_get(source_doc, "grade_requirements", prog.get("grade_requirements")),
                        "school_requirements": safe_get(source_doc, "school_requirements", prog.get("school_requirements")),
                        "school_website": to_str(safe_get(source_doc, "school_website", prog.get("school_website"))),
                        "board_passing_rate": safe_get(source_doc, "board_passing_rate", prog.get("board_passing_rate")),
                        "category": safe_get(source_doc, "category", prog.get("category")),
                        "tuition_notes": safe_get(source_doc, "tuition_notes", prog.get("tuition_notes")),
                    },
                    "school_logo": to_str(
                        (detailed and safe_get(detailed, "school_logo")) or
                        safe_get(prog, "school_logo") or "/placeholder.svg"
                    ),
                    "score": round(to_float(prog.get("score")) or 0, 3),
                    "_source": "detailed" if detailed else "vector",
                })
            except Exception:
                logger.exception(f"Failed to process program: {prog}")
                continue

        # 6. Final deduplication (just in case)
        deduped = {}
        desc_map = defaultdict(list)

        for rec in results:
            key = f"{rec['school']['name'].strip().lower()}::{rec['name'].strip().lower()}"
            desc_map[key].append(rec["description"])

            if key not in deduped or rec["score"] > deduped[key]["score"]:
                deduped[key] = rec

        for key, rec in deduped.items():
            merged_desc = " ".join(set(d.strip() for d in desc_map[key] if d.strip()))
            if merged_desc:
                rec["description"] = merged_desc

        final_results = list(deduped.values())

        return {
            "results": final_results,
            "message": f"✅ Found {len(final_results)} unique programs."
        }

    except Exception as exc:
        logger.exception("Recommendation pipeline failed unexpectedly.")
        return {"results": [], "message": f"🚨 Recommendation failed: {exc}"}


@router.post("/search")
async def search_alias_handler(request: RecommendationRequest):
    return await recommend_handler(request)
