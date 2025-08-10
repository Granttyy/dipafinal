import os
import sys
from dotenv import load_dotenv
from pymongo import MongoClient

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
    
    # Check programs with tuition data
    programs_with_tuition = []
    programs_without_tuition = []
    
    for prog in all_programs:
        tuition_semester = prog.get('tuition_per_semester')
        tuition_annual = prog.get('tuition_annual')
        tuition = prog.get('tuition')
        
        if any(val is not None and val != 0 for val in [tuition_semester, tuition_annual, tuition]):
            programs_with_tuition.append(prog)
        else:
            programs_without_tuition.append(prog)
    
    print(f"\n💰 Programs WITH tuition data: {len(programs_with_tuition)}")
    print(f"❌ Programs WITHOUT tuition data: {len(programs_without_tuition)}")
    
    # Show some examples of programs with tuition
    if programs_with_tuition:
        print("\n--- Sample Programs WITH Tuition ---")
        for i, prog in enumerate(programs_with_tuition[:5]):
            print(f"\nProgram {i+1}:")
            print(f"  Name: {prog.get('name', 'N/A')}")
            print(f"  School: {prog.get('school', 'N/A')}")
            print(f"  School Type: {prog.get('school_type', 'N/A')}")
            print(f"  Location: {prog.get('location', 'N/A')}")
            print(f"  tuition_per_semester: {prog.get('tuition_per_semester')}")
            print(f"  tuition_annual: {prog.get('tuition_annual')}")
            print(f"  Has vector: {bool(prog.get('vector'))}")
    
    # Check if programs with tuition have valid vectors
    valid_vectors_with_tuition = [p for p in programs_with_tuition if isinstance(p.get('vector'), list) and len(p.get('vector', [])) == 768]
    print(f"\n🔍 Programs with tuition AND valid vectors: {len(valid_vectors_with_tuition)}")
    
    # Check school types
    school_types_with_tuition = {}
    for prog in programs_with_tuition:
        school_type = prog.get('school_type', 'unknown')
        school_types_with_tuition[school_type] = school_types_with_tuition.get(school_type, 0) + 1
    
    print(f"\n🏫 School types with tuition data:")
    for school_type, count in school_types_with_tuition.items():
        print(f"  {school_type}: {count}")
    
    # Check if the issue is with Private schools specifically
    private_with_tuition = [p for p in programs_with_tuition if p.get('school_type', '').lower() == 'private']
    print(f"\n🎯 Private schools with tuition data: {len(private_with_tuition)}")
    
    if private_with_tuition:
        print("--- Sample Private Schools with Tuition ---")
        for i, prog in enumerate(private_with_tuition[:3]):
            print(f"\nPrivate School {i+1}:")
            print(f"  Name: {prog.get('name', 'N/A')}")
            print(f"  School: {prog.get('school', 'N/A')}")
            print(f"  tuition_per_semester: {prog.get('tuition_per_semester')}")
            print(f"  tuition_annual: {prog.get('tuition_annual')}")
    
except Exception as e:
    print(f"❌ Error: {e}")
finally:
    if 'client' in locals():
        client.close() 