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

# Load environment variables from .env
load_dotenv()

# Import routers
from routes import recommendation, feedback, programs
from routes.recommendation import RecommendationRequest, recommend_handler

# Initialize FastAPI app
app = FastAPI(
    title="UniFinder API",
    description="An AI-powered school and program recommender",
    version="1.0.0"
)

# Setup allowed CORS origins from .env
raw_origins = os.getenv("ALLOWED_ORIGINS", "*")
ALLOWED_ORIGINS = [origin.strip() for origin in raw_origins.split(",")]

print(f"✅ Allowed Origins: {ALLOWED_ORIGINS}")  # Debug only, remove in production

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check route
@app.get("/", tags=["Health"])
async def root():
    return {"message": "✅ UniFinder API is up and running!"}

# Register API routes
app.include_router(recommendation.router, prefix="/api/recommendation", tags=["Recommendation"])
app.include_router(feedback.router, prefix="/api/feedback", tags=["Feedback"])
app.include_router(programs.router, prefix="/api", tags=["Programs"])

# Shortcut POST endpoint: /search
@app.post("/search")
async def search_root_alias(request: Request):
    data = await request.json()
    answers = data.get("answers", {})

    return recommend_handler(RecommendationRequest(
        user_input=", ".join(answers.get("subjects", [])),
        school_type=answers.get("school_type", "any"),
        locations=answers.get("locations", []),
        max_budget=answers.get("budget", None)
    ))
