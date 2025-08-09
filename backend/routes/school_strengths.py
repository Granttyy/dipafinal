from fastapi import APIRouter, HTTPException
from database.mongo import school_strengths_collection  # import the existing collection

router = APIRouter()

@router.get("/school-strengths")
def get_school_strengths():
    try:
        results = school_strengths_collection.find({})
        data = {}
        for doc in results:
            # Remove MongoDB ObjectId for JSON serialization
            doc["_id"] = str(doc["_id"])
            school_name = doc.get("name", "Unknown School")
            data[school_name] = {
                "logo": doc.get("logo"),
                "address": doc.get("address"),
                "what_theyre_known_for": doc.get("what_theyre_known_for"),
                "institutional_strengths": doc.get("institutional_strengths", []),
                "unirank": doc.get("unirank", {}),
                "dorm_apartment": doc.get("dorm_apartment"),
                "transport_access": doc.get("transport_access"),
                "scholarships_offered": doc.get("scholarships_offered", []),
                "virtual_tour_photos": doc.get("virtual_tour_photos", []),
            }
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching school strengths: {e}")
