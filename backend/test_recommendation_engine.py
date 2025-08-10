import os
import sys
from dotenv import load_dotenv
from pymongo import MongoClient

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.recommendation_engine import recommend_programs

# Load environment variables
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    print("❌ MONGO_URI not set in .env file.")
    sys.exit(1)

try:
    # Connect to MongoDB
    client = MongoClient(MONGO_URI)
    db = client["Unifinder"]
    
    # Test connection
    client.admin.command("ping")
    print("✅ Connected to MongoDB")
    
    # Get all programs
    all_programs = list(db["program_vectors"].find())
    print(f"📦 Total programs in database: {len(all_programs)}")
    
    # Test recommendation with a simple query
    test_query = "I want to study computer science and technology"
    print(f"\n🔍 Testing recommendation with query: '{test_query}'")
    
    # Get recommendations
    recommendations = recommend_programs(
        user_input=test_query,
        school_data=all_programs,
        school_type=None,  # No school type filter
        locations=[],       # No location filter
        max_budget=None,    # No budget filter
        min_score=0.1,      # Lower threshold to see more results
        top_n=10
    )
    
    print(f"\n📋 Recommendations returned: {len(recommendations)}")
    
    # Analyze the recommendations
    recommendations_with_tuition = []
    recommendations_without_tuition = []
    
    for i, prog in enumerate(recommendations):
        tuition_semester = prog.get('tuition_per_semester')
        tuition_annual = prog.get('tuition_annual')
        tuition = prog.get('tuition')
        
        has_tuition = any(val is not None and val != 0 for val in [tuition_semester, tuition_annual, tuition])
        
        if has_tuition:
            recommendations_with_tuition.append(prog)
        else:
            recommendations_without_tuition.append(prog)
        
        print(f"\n--- Recommendation {i+1} ---")
        print(f"  Name: {prog.get('name', 'N/A')}")
        print(f"  School: {prog.get('school', 'N/A')}")
        print(f"  School Type: {prog.get('school_type', 'N/A')}")
        print(f"  Score: {prog.get('score', 'N/A')}")
        print(f"  Has Tuition: {'Yes' if has_tuition else 'No'}")
        if has_tuition:
            print(f"    tuition_per_semester: {tuition_semester}")
            print(f"    tuition_annual: {tuition_annual}")
    
    print(f"\n📊 Summary:")
    print(f"  Recommendations WITH tuition: {len(recommendations_with_tuition)}")
    print(f"  Recommendations WITHOUT tuition: {len(recommendations_without_tuition)}")
    
    # Check if the issue is with the recommendation engine or the data
    if recommendations_with_tuition:
        print(f"\n✅ The recommendation engine IS returning programs with tuition data")
        print("   The issue might be in the frontend or API response formatting")
    else:
        print(f"\n❌ The recommendation engine is NOT returning programs with tuition data")
        print("   This suggests an issue with the recommendation logic")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
finally:
    if 'client' in locals():
        client.close() 