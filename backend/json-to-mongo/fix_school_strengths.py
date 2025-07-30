import json
from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client["unifinder"]
collection = db["school_strengths"]

# Load your current school_strengths.json
with open("../../frontend/src/data/school_strengths.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# Remove all old documents
collection.delete_many({})

# Insert the new single document
collection.insert_one(data)

print("✅ school_strengths collection fixed and updated in MongoDB!") 