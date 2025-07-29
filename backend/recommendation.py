import json
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer
import numpy as np
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()  # add this at the top, after imports

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["unifinder"]

model = SentenceTransformer("all-mpnet-base-v2")

# Load program_data from MongoDB
program_data = list(db["program_vectors"].find({}, {"_id": 0}))

# Load rankings_data from MongoDB (get 'programs' field from first doc)
rankings_doc = db["school_rankings"].find_one({}, {"_id": 0})
rankings_data = rankings_doc["programs"] if rankings_doc and "programs" in rankings_doc else {}

THRESHOLD = 0.3
CATEGORY_WEIGHT = 0.3  # weight of the school rating in final score


def get_school_rating(school_name, category):
    ranked_list = rankings_data.get(category, [])
    for school in ranked_list:
        if school_name.lower() in school["school"].lower():
            return school["rating"]
    return None


def recommend(answers: dict, school_type: str = None, locations: list[str] = None, max_budget: float = None):
    print("\n📊 Starting Program Matching Breakdown")

    # Step 1: Per-question vectorization
    vectors = {}
    print("\n📅 Question-wise Input Vectorization:")
    for key in ["subjects", "fields", "activities", "skills", "tools", "workStyle", "impact"]:
        items = answers.get(key, [])
        custom = answers.get("custom", {}).get(key, "")
        merged = items + ([custom] if custom.strip() else [])
        text = " ".join(merged)
        if text.strip():
            vec = model.encode(text)
        else:
            vec = np.zeros(768)  # assuming model uses 768 dimensions
        vectors[key] = vec
        print(f"🔹 {key} → {text}")
        print(f"   🔸 Vector: {vec[:5]}...")  # show first 5 dims only

    # Step 2: Combine vectors into one
    valid_vectors = [v for v in vectors.values() if np.linalg.norm(v) > 0]
    if not valid_vectors:
        return {
            "type": "fallback",
            "message": "No valid input provided. Please answer at least one question.",
            "results": [],
            "weak_matches": []
        }

    combined_vector = np.mean(valid_vectors, axis=0).reshape(1, -1)

    print("\n🧪 Average (Combined) User Vector:")
    print(f"   🔸 Dimensions: {combined_vector.shape[1]}")
    print(f"   🔸 First 5 values: {combined_vector[0][:5]}")

    # Step 3: Match against programs
    strong_matches = []
    weak_matches = []

    for entry in program_data:
        entry_type = entry.get("school_type", "").lower()

        # 🎓 School type filter
        if school_type and school_type.lower() != "any":
            if entry_type != school_type.lower():
                continue

        # 📍 Location filter
        if locations:
            entry_location = entry.get("location", "").lower()
            if all(loc.lower() not in entry_location for loc in locations):
                continue

        # 💰 Budget filter
        if school_type and school_type.lower() == "private" and max_budget is not None:
            tuition = entry.get("tuition_per_semester")
            if tuition is not None and isinstance(tuition, (int, float)) and tuition > max_budget:
                continue

        # 📈 Cosine similarity
        program_vector = np.array(entry["vector"]).reshape(1, -1)
        similarity_score = cosine_similarity(program_vector, combined_vector)[0][0]

        category = entry.get("category")
        rating_score = get_school_rating(entry["school"], category) or 0
        final_score = round((similarity_score * (1 - CATEGORY_WEIGHT)) + (rating_score / 10 * CATEGORY_WEIGHT), 3)

        result_item = {
            "school": entry["school"],
            "program": entry["name"],
            "description": entry["description"],
            "score": final_score,
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

        if similarity_score >= THRESHOLD:
            strong_matches.append(result_item)
        else:
            weak_matches.append(result_item)

        print(f"🏫 {entry['school']} - {entry['name']}: Similarity={similarity_score:.3f}, Rating={rating_score}, Final={final_score:.3f}")

    strong_matches.sort(key=lambda x: x["score"], reverse=True)
    weak_matches.sort(key=lambda x: x["score"], reverse=True)

    top_category = strong_matches[0].get("category") if strong_matches else None
    top_ranked_schools = rankings_data.get(top_category, [])[:5] if top_category else []

    if not strong_matches:
        return {
            "type": "fallback",
            "message": "We couldn't find a strong match for your interest, so here are a few programs you might explore.",
            "results": weak_matches[:3],
            "weak_matches": weak_matches[3:7],
            "matched_category": top_category,
            "top_schools_for_category": top_ranked_schools
        }

    return {
        "type": "exact",
        "results": strong_matches[:5],
        "weak_matches": weak_matches[:5],
        "matched_category": top_category,
        "top_schools_for_category": top_ranked_schools
    }
