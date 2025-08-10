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
    
    # Check program_vectors collection
    programs = list(db["program_vectors"].find())
    print(f"📦 Total programs: {len(programs)}")
    
    if programs:
        # Find programs with actual tuition values
        programs_with_tuition = []
        for prog in programs:
            tuition_semester = prog.get('tuition_per_semester')
            tuition_annual = prog.get('tuition_annual')
            tuition = prog.get('tuition')
            
            if any(val is not None and val != 0 for val in [tuition_semester, tuition_annual, tuition]):
                programs_with_tuition.append(prog)
        
        print(f"\n💰 Programs with tuition data: {len(programs_with_tuition)}")
        
        if programs_with_tuition:
            print("\n--- Sample Programs with Tuition ---")
            for i, prog in enumerate(programs_with_tuition[:5]):
                print(f"\nProgram {i+1}:")
                print(f"  Name: {prog.get('name', 'N/A')}")
                print(f"  School: {prog.get('school', 'N/A')}")
                print(f"  tuition_per_semester: {prog.get('tuition_per_semester')}")
                print(f"  tuition_annual: {prog.get('tuition_annual')}")
                print(f"  tuition: {prog.get('tuition')}")
        
        # Check data types
        print(f"\n📊 Data type analysis:")
        tuition_fields = ['tuition_per_semester', 'tuition_annual', 'tuition']
        for field in tuition_fields:
            types = {}
            for prog in programs:
                val = prog.get(field)
                if val is not None:
                    val_type = type(val).__name__
                    types[val_type] = types.get(val_type, 0) + 1
            
            print(f"  {field}: {types}")
        
        # Check for string values that might need conversion
        string_tuition = []
        for prog in programs:
            for field in tuition_fields:
                val = prog.get(field)
                if isinstance(val, str) and val.strip():
                    string_tuition.append((prog.get('name', 'N/A'), field, val))
        
        if string_tuition:
            print(f"\n⚠️ Programs with string tuition values (need conversion):")
            for name, field, val in string_tuition[:5]:
                print(f"  {name}: {field} = '{val}'")
    
except Exception as e:
    print(f"❌ Error: {e}")
finally:
    if 'client' in locals():
        client.close() 