import json
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer
import numpy as np
from pymongo import MongoClient
import os
from dotenv import load_dotenv
import pickle
from datetime import datetime
import joblib
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import lightgbm as lgb

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["unifinder"]

model = SentenceTransformer("nomic-ai/nomic-embed-text-v1.5", trust_remote_code=True)
EMBEDDING_DIMENSION = 768

program_data = list(db["program_vectors"].find({}, {"_id": 0}))
rankings_doc = db["school_rankings"].find_one({}, {"_id": 0})
rankings_data = rankings_doc["programs"] if rankings_doc and "programs" in rankings_doc else {}

THRESHOLD = 0.3
CATEGORY_WEIGHT = 0.3
LEARNING_RATE = 0.01
FEEDBACK_WEIGHT = 0.2

PREFERENCE_WEIGHTS = {
    "subjects": 0.25,
    "fields": 0.25,
    "activities": 0.15,
    "skills": 0.15,
    "tools": 0.1,
    "workStyle": 0.05,
    "impact": 0.05,
}

feedback_model = None
feedback_model_path = "feedback_model.pkl"
model_performance_history = []

def get_school_rating(school_name, category):
    ranked_list = rankings_data.get(category, [])
    for school in ranked_list:
        if school_name.lower() in school["school"].lower():
            return school["rating"]
    return None

def load_feedback_model():
    global feedback_model
    try:
        if os.path.exists(feedback_model_path):
            feedback_model = joblib.load(feedback_model_path)
            print(f"📊 Loaded LightGBM feedback model from {feedback_model_path}")
            return True
    except Exception as e:
        print(f"⚠️ Could not load LightGBM feedback model: {e}")
    return False

def save_feedback_model():
    global feedback_model
    if feedback_model is not None:
        try:
            joblib.dump(feedback_model, feedback_model_path)
            print(f"💾 Saved LightGBM feedback model to {feedback_model_path}")
            return True
        except Exception as e:
            print(f"❌ Error saving LightGBM feedback model: {e}")
    return False

def recommend(answers: dict, school_type: str = None, locations: list[str] = None, max_budget: float = None):
    print("\n📊 Starting Program Matching Breakdown")

    vectors = {}
    print("\n📅 Question-wise Input Vectorization:")
    for key in PREFERENCE_WEIGHTS:
        items = answers.get(key, [])
        custom = answers.get("custom", {}).get(key, "")
        merged = items + ([custom] if custom.strip() else [])
        text = " ".join(merged)
        if text.strip():
            vec = model.encode(f"search_query: {text}")
        else:
            vec = np.zeros(EMBEDDING_DIMENSION)
        vectors[key] = vec
        print(f"🔹 {key} → {text}")
        print(f"   🔸 Vector: {vec[:5]}...")

    combined_vector = np.zeros(EMBEDDING_DIMENSION)
    total_weight = 0
    for key, weight in PREFERENCE_WEIGHTS.items():
        if key in vectors and np.linalg.norm(vectors[key]) > 0:
            combined_vector += vectors[key] * weight
            total_weight += weight

    if total_weight == 0:
        return {
            "type": "fallback",
            "message": "No valid input provided. Please answer at least one question.",
            "results": [],
            "weak_matches": []
        }

    combined_vector = (combined_vector / total_weight).reshape(1, -1)

    print("\n🧪 Weighted (Combined) User Vector:")
    print(f"   🔸 Dimensions: {combined_vector.shape[1]}")
    print(f"   🔸 First 5 values: {combined_vector[0][:5]}")

    strong_matches = []
    weak_matches = []

    for entry in program_data:
        entry_type = entry.get("school_type", "").lower()
        if school_type and school_type.lower() != "any" and entry_type != school_type.lower():
            continue

        if locations:
            entry_location = entry.get("location", "").lower()
            if all(loc.lower() not in entry_location for loc in locations):
                continue

        if school_type and school_type.lower() == "private" and max_budget is not None:
            tuition = entry.get("tuition_per_semester")
            if tuition is not None and isinstance(tuition, (int, float)) and tuition > max_budget:
                continue

        program_vector = np.array(entry["vector"]).reshape(1, -1)
        similarity_score = cosine_similarity(program_vector, combined_vector)[0][0]

        category = entry.get("category")
        rating_score = get_school_rating(entry["school"], category) or 0

        final_score = similarity_score * (1 - CATEGORY_WEIGHT) + rating_score * CATEGORY_WEIGHT

        result_item = {
            "school": entry["school"],
            "program": entry["name"],
            "description": entry["description"],
            "score": final_score,
            "similarity_score": round(similarity_score, 3),
            "rating_score": rating_score,
            "tuition_per_semester": entry.get("tuition_per_semester"),
            "tuition_annual": entry.get("tuition_annual"),
            "tuition_notes": entry.get("tuition_notes"),
            "admission_requirements": entry.get("admission_requirements"),
            "grade_requirements": entry.get("grade_requirements"),
            "school_requirements": entry.get("school_requirements"),
            "school_website": entry.get("school_website"),
            "school_type": entry.get("school_type"),
            "location": entry.get("location"),
            "school_logo": entry.get("school_logo"),
            "board_passing_rate": entry.get("board_passing_rate"),
            "category": category,
        }

        if final_score >= THRESHOLD:
            strong_matches.append(result_item)
        else:
            weak_matches.append(result_item)

        print(f"🏫 {entry['school']} - {entry['name']}: Similarity={similarity_score:.3f}, Rating={rating_score}, Final Score={final_score:.3f}")

    strong_matches.sort(key=lambda x: x["score"], reverse=True)
    weak_matches.sort(key=lambda x: x["score"], reverse=True)

    top_category = strong_matches[0]["category"] if strong_matches else None
    top_ranked_schools = rankings_data.get(top_category, [])[:5] if top_category else []

    response = {
        "type": "exact" if strong_matches else "fallback",
        "results": strong_matches[:5] if strong_matches else weak_matches[:3],
        "weak_matches": weak_matches[:5] if strong_matches else weak_matches[3:7],
        "matched_category": top_category,
        "top_schools_for_category": top_ranked_schools,
        "user_embeddings": {k: v.tolist() for k, v in vectors.items()},
        "message": "We couldn't find a strong match for your interest, so here are a few programs you might explore." if not strong_matches else None
    }

    return response

load_feedback_model()
