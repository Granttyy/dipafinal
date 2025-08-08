#bac
from fastapi import APIRouter, HTTPException
from database.mongo import db
from typing import Dict, Any, List

router = APIRouter()

# Helper function to format MongoDB document for JSON response
def school_strength_helper(school) -> Dict[str, Any]:
    return {
        "id": str(school.get("_id")),
        "school_name": school.get("school_name"),
        "maps_query": school.get("maps_query"),
        "coords": school.get("coords"),
        # Add other fields as needed
    }

# Endpoint
@router.get("/school-strengths")
def get_school_strengths() -> List[Dict[str, Any]]:
    try:
        # Fetch all documents from the collection
        schools = list(db["school_strengths"].find())

        # Convert each document into a JSON-safe dict
        formatted_schools = [school_strength_helper(school) for school in schools]

        # Return as a list (so frontend .map works)
        return formatted_schools
    except Exception as e:
        print(f"Error fetching school strengths: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
