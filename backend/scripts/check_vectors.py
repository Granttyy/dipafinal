# backend/scripts/check_vectors.py

import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from ..database.mongo import db

def check_vectors():
    programs = list(db["program_vectors"].find())
    total = len(programs)
    valid = sum(1 for p in programs if isinstance(p.get("vector"), list) and len(p["vector"]) == 768)

    print(f"📦 Total programs: {total}")
    print(f"✅ With valid vectors: {valid}")
    print(f"❌ Missing or invalid vectors: {total - valid}")

if __name__ == "__main__":
    check_vectors()
