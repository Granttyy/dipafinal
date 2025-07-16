import json
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer
import numpy as np

model = SentenceTransformer("all-mpnet-base-v2")

with open("data/program_vectors.json", "r", encoding="utf-8") as f:
    program_data = json.load(f)

THRESHOLD = 0.3

def recommend(interest_input: str, school_type: str = None, locations: list[str] = None, max_budget: float = None):
    interest_input = interest_input.lower().strip()

    if not interest_input:
        return {
            "type": "fallback",
            "message": "We couldn't find a strong match for your interest, so here are a few programs you might explore.",
            "results": [],
            "weak_matches": []
        }

    interests = [x.strip() for x in interest_input.replace(" and ", ",").split(",") if x.strip()]
    vectors = model.encode(interests)
    combined_vector = np.mean(vectors, axis=0).reshape(1, -1)

    strong_matches = []
    weak_matches = []

    for entry in program_data:
        entry_type = entry.get("school_type", "").lower()

        # 📌 School type filter
        if school_type and school_type.lower() != "any":
            if entry_type != school_type.lower():
                continue

        # 📌 Location filter (multi-select support)
        if locations:
            entry_location = entry.get("location", "").lower()
            if all(loc.lower() not in entry_location for loc in locations):
                continue

        # 💰 Budget filter (only for private)
        if school_type and school_type.lower() == "private" and max_budget is not None:
            tuition = entry.get("tuition_per_semester")
            if tuition is not None and isinstance(tuition, (int, float)) and tuition > max_budget:
                continue

        # 🧠 Cosine similarity
        score = cosine_similarity([entry["vector"]], combined_vector)[0][0]
        rounded_score = round(score, 3)

        result_item = {
            "school": entry["school"],
            "program": entry["name"],
            "description": entry["description"],
            "score": rounded_score,
            "tuition_per_semester": entry.get("tuition_per_semester"),
            "tuition_annual": entry.get("tuition_annual"),
            "admission_requirements": entry.get("admission_requirements"),
            "grade_requirements": entry.get("grade_requirements"),
            "school_requirements": entry.get("school_requirements"),
            "school_website": entry.get("school_website"),
            "school_type": entry.get("school_type"),
            "location": entry.get("location"),
            "school_logo": entry.get("school_logo"),
        }

        if score >= THRESHOLD:
            strong_matches.append(result_item)
        else:
            weak_matches.append(result_item)

        print(f"🧠 {entry['school']} - {entry['name']}: {score:.3f}")

    strong_matches.sort(key=lambda x: x["score"], reverse=True)
    weak_matches.sort(key=lambda x: x["score"], reverse=True)

    if not strong_matches:
        return {
            "type": "fallback",
            "message": "We couldn't find a strong match for your interest, so here are a few programs you might explore.",
            "results": weak_matches[:3],
            "weak_matches": weak_matches[3:7]
        }

    return {
        "type": "exact",
        "results": strong_matches[:5],
        "weak_matches": weak_matches[:5]
    }
