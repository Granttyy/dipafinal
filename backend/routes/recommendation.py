from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict

from core.recommendation_engine import recommend_programs
from database.mongo import db

router = APIRouter()

class UserAnswers(BaseModel):
    academics: List[str] = Field(default_factory=list)
    fields: List[str] = Field(default_factory=list)
    activities: List[str] = Field(default_factory=list)
    goals: List[str] = Field(default_factory=list)
    environment: List[str] = Field(default_factory=list)
    custom: Dict[str, str] = Field(default_factory=dict)

class RecommendationRequest(BaseModel):
    answers: UserAnswers  # required, no default
    school_type: Optional[str] = "any"
    locations: List[str] = Field(default_factory=list)
    max_budget: Optional[int] = None

def format_user_input(answers: UserAnswers) -> str:
    def join_list(items: List[str]) -> str:
        return ', '.join(items) if items else "None"

    input_text = (
        f"Subjects I enjoy: {join_list(answers.academics)}. "
        f"Fields I'm drawn to: {join_list(answers.fields)}. "
        f"Activities I enjoy: {join_list(answers.activities)}. "
        f"Career goals: {join_list(answers.goals)}. "
        f"Preferred work environment: {join_list(answers.environment)}."
    )

    if answers.custom:
        for key, val in answers.custom.items():
            if val and val.strip():
                input_text += f" Custom {key}: {val.strip()}."

    return input_text

@router.post("/recommend")
async def recommend_handler(request: RecommendationRequest):
    try:
        user_input = format_user_input(request.answers)

        programs = list(db["program_vectors"].find())
        if not programs:
            return {"results": [], "message": "⚠️ No programs found in database."}

        top_matches = recommend_programs(
            user_input=user_input,
            school_data=programs,
            school_type=request.school_type,
            locations=request.locations,
            max_budget=request.max_budget,
        )

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

@router.post("/search")
async def search_alias_handler(request: RecommendationRequest):
    return await recommend_handler(request)
