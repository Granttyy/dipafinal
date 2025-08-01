# backend/routes/feedback.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from datetime import datetime
from sentence_transformers import SentenceTransformer
from database.mongo import feedback_collection

router = APIRouter()

# Load model once (consider dependency injection for better memory management)
model = SentenceTransformer("nomic-ai/nomic-embed-text-v1.5", trust_remote_code=True)

# Valid feedback values
VALID_FEEDBACK = {"positive", "negative", "not_relevant"}

class Feedback(BaseModel):
    school: str = Field(..., min_length=1)
    program: str = Field(..., min_length=1)
    feedback: str = Field(..., description="e.g. positive, negative, not_relevant")

@router.post("/feedback")
def save_feedback(data: Feedback):
    # Validate feedback value
    if data.feedback not in VALID_FEEDBACK:
        raise HTTPException(status_code=400, detail=f"Invalid feedback. Must be one of {VALID_FEEDBACK}.")

    # Generate vector for the feedback
    full_text = f"{data.school} - {data.program}"
    vector = model.encode(full_text).tolist()

    feedback_doc = {
        "school": data.school,
        "program": data.program,
        "feedback": data.feedback,
        "vector": vector,
        "timestamp": datetime.utcnow(),
    }

    try:
        # Save feedback to the database
        feedback_collection.insert_one(feedback_doc)
        return {"message": "✅ Feedback saved successfully!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"❌ Failed to save feedback: {str(e)}")
