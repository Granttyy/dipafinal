from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

from core.recommendation_engine import recommend_programs
from database.mongo import db

router = APIRouter()

# ✅ Structured user answers based on frontend input
class UserAnswers(BaseModel):
    subjects: List[str]
    fields: List[str]
    activities: List[str]
    skills: List[str]
    tools: List[str]
    workStyle: List[str]
    impact: List[str]

# ✅ Complete recommendation request body
class RecommendationRequest(BaseModel):
    answers: UserAnswers
    school_type: Optional[str] = "any"
    locations: Optional[List[str]] = []
    max_budget: Optional[int] = None

# ✅ Converts user's selected options into semantic input
def format_user_input(answers: UserAnswers) -> str:
    return (
        f"Subjects I enjoy: {', '.join(answers.subjects)}. "
        f"I'm interested in: {', '.join(answers.fields)}. "
        f"Activities I enjoy: {', '.join(answers.activities)}. "
        f"Skills I want to improve: {', '.join(answers.skills)}. "
        f"Tools I like using: {', '.join(answers.tools)}. "
        f"Work style I prefer: {', '.join(answers.workStyle)}. "
        f"Impact I want to make: {', '.join(answers.impact)}."
    )

# ✅ Main recommendation route
@router.post("/recommend")
def recommend_handler(request: RecommendationRequest):
    try:
        # Step 1: Convert answers to semantic query
        user_input = format_user_input(request.answers)

        # Step 2: Load vectorized programs from MongoDB
        programs = list(db["program_vectors"].find())
        if not programs:
            return {"results": [], "message": "⚠️ No programs found in database."}

        # Step 3: Get top matches from the recommendation engine
        top_matches = recommend_programs(
            user_input=user_input,
            school_data=programs,
            school_type=request.school_type,
            locations=request.locations,
            max_budget=request.max_budget,
        )

        # Step 4: Format response
        formatted_results = [
            {
                "program_id": str(prog.get("_id", "")),
                "name": prog.get("name", ""),
                "description": prog.get("description", ""),
                "school": {
                    "name": prog.get("school", ""),
                    "type": prog.get("school_type", "unknown"),
                    "location": prog.get("location", "unknown"),
                    "tuition": prog.get("tuition", None),
                },
                "school_logo": prog.get("school_logo", ""),
                "score": round(prog.get("score", 0), 3)
            }
            for prog in top_matches
        ]

        return {
            "results": formatted_results,
            "message": f"✅ Found {len(formatted_results)} matching programs."
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"🚨 Recommendation failed: {str(e)}")

# ✅ Alias for /search if frontend uses old endpoint
@router.post("/search")
def search_alias_handler(request: RecommendationRequest):
    return recommend_handler(request)
