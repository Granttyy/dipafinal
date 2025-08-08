# backend/main.py
import os
import sys
import warnings
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Suppress TensorFlow logs and deprecation warnings
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"
warnings.filterwarnings("ignore", category=DeprecationWarning)

# Ensure backend folder is in the Python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

# Load environment variables
load_dotenv()

# Import routers
from routes import recommendation, feedback, programs
from routes.recommendation import RecommendationRequest, recommend_handler

app = FastAPI(
    title="UniFinder API",
    description="An AI-powered school and program recommender",
    version="1.0.0"
)

# CORS
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in ALLOWED_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/")
async def root():
    return {"message": "✅ UniFinder API is running"}

# Routers
app.include_router(recommendation.router, prefix="/api/recommendation", tags=["Recommendation"])
app.include_router(feedback.router, prefix="/api/feedback", tags=["Feedback"])
app.include_router(programs.router, prefix="/api", tags=["Programs"])

# Optional shortcut to /api/recommendation/search
@app.post("/search")
async def search_root_alias(request: Request):
    data = await request.json()
    req = RecommendationRequest(
        user_input=", ".join(data.get("answers", {}).get("subjects", [])),
        school_type=data.get("answers", {}).get("school_type", "any"),
        locations=data.get("answers", {}).get("locations", []),
        max_budget=data.get("answers", {}).get("budget", None)
    )
    return recommend_handler(req)
