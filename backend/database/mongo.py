# database/mongo.py

import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    raise ValueError("⚠️ MONGO_URI not set in .env file.")

try:
    # Connect to MongoDB
    client = MongoClient(MONGO_URI)

    # Use the correct database name: 'Unifinder'
    db = client["unifinder_db"]

    # Test the connection
    client.admin.command("ping")
    print("✅ Connected to MongoDB — database: 'Unifinder'")

    # Define MongoDB collections
    school_rankings_collection = db["school_rankings"]
    school_strengths_collection = db["school_strengths"]
    program_vectors_collection = db["program_vectors"]
    feedback_collection = db["feedback"]


except Exception as e:
    print(f"❌ MongoDB connection failed: {e}")
    raise RuntimeError("Could not connect to MongoDB.")
