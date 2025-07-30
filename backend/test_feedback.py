#!/usr/bin/env python3
"""
Test script for the feedback learning system.
This script simulates user feedback to test the model learning functionality.
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BASE_URL = "http://127.0.0.1:8000"

def simulate_user_search():
    """Simulate a user search request."""
    search_data = {
        "answers": {
            "subjects": ["Math", "Science"],
            "fields": ["Technology", "Engineering"],
            "activities": ["Solving problems", "Building things"],
            "skills": ["Critical thinking", "Coding"],
            "tools": ["Computer", "Software"],
            "workStyle": ["Independent", "Analytical"],
            "impact": ["Driving economic growth"],
            "custom": {
                "subjects": "",
                "fields": "",
                "activities": "",
                "skills": "",
                "tools": "",
                "workStyle": "",
                "impact": ""
            }
        },
        "school_type": "any",
        "locations": ["Angeles", "San Fernando"],
        "max_budget": None
    }

    try:
        response = requests.post(f"{BASE_URL}/search", json=search_data)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"\u274c Search failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"\u274c Error during search: {e}")
        return None

def submit_feedback(search_result, feedback_type):
    """Submit feedback for a search result."""
    if not search_result:
        return False

    feedback_data = {
        "session_id": f"test_session_{int(time.time())}",
        "user_answers": search_result.get("user_embeddings", {}),
        "user_embeddings": search_result.get("user_embeddings", {}),
        "recommended_programs": search_result.get("results", []),
        "feedback_type": feedback_type,
        "feedback_details": f"Test feedback: {feedback_type}",
        "selected_program": None,
        "timestamp": datetime.now().isoformat()
    }

    try:
        response = requests.post(f"{BASE_URL}/feedback", json=feedback_data)
        if response.status_code == 200:
            print(f"\u2705 Feedback submitted: {feedback_type}")
            return True
        else:
            print(f"\u274c Feedback submission failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"\u274c Error submitting feedback: {e}")
        return False

def get_feedback_stats():
    """Get feedback statistics."""
    try:
        response = requests.get(f"{BASE_URL}/feedback/stats")
        if response.status_code == 200:
            return response.json()
        else:
            print(f"\u274c Failed to get stats: {response.status_code}")
            return None
    except Exception as e:
        print(f"\u274c Error getting stats: {e}")
        return None

def trigger_model_retraining():
    """Trigger model retraining."""
    try:
        response = requests.post(f"{BASE_URL}/model/retrain", json={
            "force_retrain": False,
            "min_feedback_count": 10  # Lower threshold for testing
        })
        if response.status_code == 200:
            return response.json()
        else:
            print(f"\u274c Retraining failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"\u274c Error during retraining: {e}")
        return None

def main():
    """Main test function."""
    print("\U0001F9EA Testing Feedback Learning System")
    print("=" * 50)

    # Step 1: Get initial stats
    print("\n\U0001F4CA Initial Feedback Statistics:")
    initial_stats = get_feedback_stats()
    if initial_stats:
        print(f"   Total feedback: {initial_stats.get('total_feedback', 0)}")
        print(f"   Ready for retraining: {initial_stats.get('ready_for_retraining', False)}")

    # Step 2: Simulate multiple user searches and feedback
    feedback_types = ["positive", "negative", "not_relevant"]

    print(f"\n\uD83D\uDD04 Simulating {len(feedback_types) * 3} user interactions...")

    for i in range(3):  # 3 rounds of feedback
        for feedback_type in feedback_types:
            # Simulate search
            search_result = simulate_user_search()
            if search_result:
                # Submit feedback
                submit_feedback(search_result, feedback_type)
                time.sleep(0.5)  # Small delay between requests

    # Step 3: Get updated stats
    print("\n\U0001F4CA Updated Feedback Statistics:")
    updated_stats = get_feedback_stats()
    if updated_stats:
        print(f"   Total feedback: {updated_stats.get('total_feedback', 0)}")
        print(f"   Ready for retraining: {updated_stats.get('ready_for_retraining', False)}")

        if updated_stats.get('feedback_distribution'):
            print("   Feedback distribution:")
            for item in updated_stats['feedback_distribution']:
                print(f"     {item['_id']}: {item['count']}")

    # Step 4: Trigger model retraining
    print("\n\U0001F3AF Triggering Model Retraining:")
    retrain_result = trigger_model_retraining()
    if retrain_result:
        print(f"   Success: {retrain_result.get('success', False)}")
        print(f"   Message: {retrain_result.get('message', 'N/A')}")
        if retrain_result.get('feedback_used'):
            print(f"   Feedback used: {retrain_result['feedback_used']}")
        if retrain_result.get('training_time'):
            print(f"   Training time: {retrain_result['training_time']:.2f}s")
        if retrain_result.get('improvement_score'):
            print(f"   Improvement score: {retrain_result['improvement_score']:.3f}")

    print("\n\u2705 Test completed!")

if __name__ == "__main__":
    main()
