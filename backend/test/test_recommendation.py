# test_recommend_api.py

import requests
from pprint import pprint

# Change this if your FastAPI server runs on another port or has a prefix
BASE_URL = "http://localhost:8000/api"


def run_test():
    # 📝 Sample payload with location set to Bacolor
    payload = {
        "answers": {
            "academics": ["Mathematics", "Physics"],
            "fields": ["Engineering", "Technology"],
            "activities": ["Building robots", "Programming"],
            "goals": ["Work in aerospace industry"],
            "environment": ["Collaborative", "Innovative"],
            "custom": {"hobby": "Drone flying"}
        },
        "school_type": "any",
        "locations": ["Bacolor"],  # ✅ Changed location filter
        "max_budget": 60000
    }

    print("📤 Sending request to backend...")
    try:
        response = requests.post(f"{BASE_URL}/recommend", json=payload)
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to the backend. Is uvicorn running?")
        return

    print(f"📥 Status Code: {response.status_code}")
    try:
        data = response.json()
    except ValueError:
        print("❌ Response is not JSON.")
        print(response.text)
        return

    print("\n=== Raw JSON Output ===")
    pprint(data)

    if "results" in data:
        print("\n=== Formatted Results ===")
        for idx, program in enumerate(data["results"], start=1):
            print(f"{idx}. {program['name']} ({program['school']['name']}) - Score: {program['score']}")

if __name__ == "__main__":
    run_test()
