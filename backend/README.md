# UniFinder – Course and School Recommender System


How to Install and Run UniFinder Locally:

BACKEND SETUP (FastAPI + Python)
Requirements:
- Python 3.9 or later
- pip

Steps:
1. Open terminal
2. Navigate to backend folder:
   cd backend
3. Create and activate virtual environment:
   For Windows:
     python -m venv venv
     venv\Scripts\activate
   For macOS/Linux:
     python3 -m venv venv
     source venv/bin/activate
4. Install dependencies:
   pip install -r requirements.txt
5. (Optional) If programs.json was changed:
   python generate_vectors.py
6. Run backend server:
   uvicorn main:app --reload
7. Visit in browser:
   http://localhost:8000
8. API docs available at:
   http://localhost:8000/docs

FRONTEND SETUP (React + Tailwind CSS)
Requirements:
- Node.js and npm

Steps:
1. Open another terminal
2. Navigate to frontend folder:
   cd frontend
3. Install dependencies:
   npm install
4. Run development server:
   npm run dev
5. Visit in browser:
   http://localhost:5173


Quick Command Reference:

Backend:
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
source venv/bin/activate       # macOS/Linux
pip install -r requirements.txt
python generate_vectors.py     # only if needed
uvicorn main:app --reload

Frontend:
cd frontend
npm install
npm run dev

Important Notes:
- Do not include venv/ or node_modules/ folders when sharing
- Only regenerate program_vectors.json if programs.json is changed
- Always activate your virtual environment before running backend commands

Tech Stack:
Frontend – React, Tailwind CSS
Backend – FastAPI, Uvicorn
NLP Engine – Sentence Transformers (all-mpnet-base-v2)
Similarity – Cosine Similarity

