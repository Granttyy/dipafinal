import json
import numpy as np
from sentence_transformers import SentenceTransformer
from numpy.linalg import norm

# Load your raw programs
with open("data/programs.json", "r", encoding="utf-8") as f:
    programs = json.load(f)

# Load the Nomic embedding model
print("⏳ Loading model...")
model = SentenceTransformer("nomic-ai/nomic-embed-text-v1.5", trust_remote_code=True)
print("✅ Model loaded.")

processed = 0
failed = 0

for p in programs:
    description = p.get("description", "").strip()
    if not description:
        print(f"⚠️ Skipping program with missing description: {p.get('program', 'N/A')}")
        p["vector"] = []
        failed += 1
        continue

    try:
        vec = model.encode(description)
        vec = vec / norm(vec)
        p["vector"] = vec.tolist()
        processed += 1
    except Exception as e:
        print(f"❌ Error encoding '{p.get('program', 'Unknown')}': {e}")
        p["vector"] = []
        failed += 1

# Save to output
with open("data/program_vectors.json", "w", encoding="utf-8") as f:
    json.dump(programs, f, indent=2)

print(f"\n✅ Embedded {processed} programs")
if failed:
    print(f"⚠️ Skipped or failed: {failed} programs")
print("📁 Saved to: data/program_vectors.json")
