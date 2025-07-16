from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from recommendation import recommend
from typing import List, Optional  

from fastapi.responses import JSONResponse

import json
import os
app = FastAPI()
# Serve school logos

# Serve the program data from JSON
@app.get("/programs/all")
def get_all_programs():
    file_path = os.path.join("data", "all_programs.json")
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return JSONResponse(content=data)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SearchRequest(BaseModel):
    interest: str
    school_type: str = "any"
    locations: Optional[List[str]] = None  
    max_budget: Optional[float] = None

@app.post("/search")
def search(data: SearchRequest):
    print(f"🟢 Interest: {data.interest} | Type: {data.school_type} | Locations: {data.locations} | Max Budget: {data.max_budget}")
    
    result = recommend(
        interest_input=data.interest,
        school_type=data.school_type,
        locations=data.locations,
        max_budget=data.max_budget,
    )

    return result

@app.get("/programs/showcase")
def get_program_showcase():
    return [
        {
            "school": "Don Honorio Ventura State University",
            "school_logo": "/logos/psu.png",
            "name": "BS Business Administration - Operations Management",
            "category": "business",
            "icon": "Briefcase",
            "description": "Focuses on streamlining business logistics, production, and supply chain efficiency.",
            "tuition_per_semester": None,
            "tuition_annual": None,
            "tuition_notes": "Miscellaneous fees not included, varies by campus and program.",
            "admission_requirements": "HS diploma, entrance exam, interview.",
            "grade_requirements": "85% in Math and English.",
            "school_requirements": "Form 138, PSA Birth Certificate, Certificate of Good Moral.",
            "school_website": "https://www.dhvsu.edu.ph",
            "location": "Mexico, Pampanga",
            "school_type": "Public"
        },
        {
            "school": "Don Honorio Ventura State University",
            "school_logo": "/logos/psu.png",
            "name": "BS Computer Science",
            "category": "technology",
            "icon": "Code",
            "description": "Covers algorithms, data structures, and software design, preparing students for tech careers.",
            "tuition_per_semester": None,
            "tuition_annual": None,
            "tuition_notes": "Miscellaneous fees not included, varies by campus and program.",
            "admission_requirements": "Entrance exam and interview.",
            "grade_requirements": "GWA 85%, strong Math background.",
            "school_requirements": "Form 138, PSA, good moral, 2x2 ID picture.",
            "school_website": "https://www.dhvsu.edu.ph",
            "location": "Mexico, Pampanga",
            "school_type": "Public"
        },
        {
            "school": "Don Honorio Ventura State University",
            "school_logo": "/logos/psu.png",
            "name": "BS Architecture",
            "category": "design",
            "icon": "Ruler",
            "description": "Covers architectural design, building technology, and planning for urban and rural settings.",
            "tuition_per_semester": None,
            "tuition_annual": None,
            "tuition_notes": "Miscellaneous fees not included, varies by campus and program.",
            "admission_requirements": "Drawing exam, HS diploma.",
            "grade_requirements": "85% in Math and Arts-related subjects.",
            "school_requirements": "Form 138, PSA, portfolio (if any), good moral.",
            "school_website": "https://www.dhvsu.edu.ph",
            "location": "Mexico, Pampanga",
            "school_type": "Public"
        },
        {
            "school": "Don Honorio Ventura State University",
            "school_logo": "/logos/psu.png",
            "name": "BS Nursing",
            "category": "health",
            "icon": "Stethoscope",
            "description": "Trains students in patient care, health assessment, and clinical practice.",
            "tuition_per_semester": None,
            "tuition_annual": None,
            "tuition_notes": "Miscellaneous fees not included, varies by campus and program.",
            "admission_requirements": "HS diploma, entrance test.",
            "grade_requirements": "GWA 83%, must pass nursing aptitude test.",
            "school_requirements": "Form 138, PSA, good moral certificate.",
            "school_website": "https://www.dhvsu.edu.ph",
            "location": "Mexico, Pampanga",
            "school_type": "Public"
        },
        {
            "school": "Don Honorio Ventura State University",
            "school_logo": "/logos/psu.png",
            "name": "Bachelor of Secondary Education - English",
            "category": "education",
            "icon": "BookOpen",
            "description": "Prepares high school English teachers with strong foundations in literature and communication.",
            "tuition_per_semester": None,
            "tuition_annual": None,
            "tuition_notes": "Miscellaneous fees not included, varies by campus and program.",
            "admission_requirements": "Interview, entrance exam.",
            "grade_requirements": "Minimum GWA of 85%, English grade 87% or above.",
            "school_requirements": "Form 138, good moral, PSA birth certificate.",
            "school_website": "https://www.dhvsu.edu.ph",
            "location": "Mexico, Pampanga",
            "school_type": "Public"
        },
        {
            "school": "Don Honorio Ventura State University",
            "school_logo": "/logos/psu.png",
            "name": "BS Civil Engineering",
            "category": "engineering",
            "icon": "Wrench",
            "description": "Prepares students to design, construct, and maintain infrastructure and public works.",
            "tuition_per_semester": None,
            "tuition_annual": None,
            "tuition_notes": "Miscellaneous fees not included, varies by campus and program.",
            "admission_requirements": "Entrance exam, interview.",
            "grade_requirements": "At least 85% in Math and Science.",
            "school_requirements": "Form 138, good moral, PSA birth certificate.",
            "school_website": "https://www.dhvsu.edu.ph",
            "location": "Mexico, Pampanga",
            "school_type": "Public"
        },
        {
            "school": "Don Honorio Ventura State University",
            "school_logo": "/logos/psu.png",
            "name": "BS Biology",
            "category": "science",
            "icon": "FlaskConical",
            "description": "Focuses on biological sciences, preparing students for research, teaching, or medical careers.",
            "tuition_per_semester": None,
            "tuition_annual": None,
            "tuition_notes": "Miscellaneous fees not included, varies by campus and program.",
            "admission_requirements": "HS diploma, entrance exam.",
            "grade_requirements": "Minimum of 85% in Science and Math.",
            "school_requirements": "Form 138, PSA, medical clearance.",
            "school_website": "https://www.dhvsu.edu.ph",
            "location": "Mexico, Pampanga",
            "school_type": "Public"
        },
        {
            "school": "Don Honorio Ventura State University",
            "school_logo": "/logos/psu.png",
            "name": "Bachelor of Fine Arts",
            "category": "arts",
            "icon": "Palette",
            "description": "Focuses on visual arts, multimedia, and design fundamentals for creative careers.",
            "tuition_per_semester": None,
            "tuition_annual": None,
            "tuition_notes": "Miscellaneous fees not included, varies by campus and program.",
            "admission_requirements": "Art portfolio, HS diploma, entrance test.",
            "grade_requirements": "80% GWA with strength in art subjects.",
            "school_requirements": "Form 138, good moral, PSA.",
            "school_website": "https://www.dhvsu.edu.ph",
            "location": "Mexico, Pampanga",
            "school_type": "Public"
        },
        {
            "school": "Don Honorio Ventura State University",
            "school_logo": "/logos/psu.png",
            "name": "BS Criminology",
            "category": "law",
            "icon": "ShieldCheck",
            "description": "Studies criminal behavior, law enforcement, and forensic science for public safety careers.",
            "tuition_per_semester": None,
            "tuition_annual": None,
            "tuition_notes": "Miscellaneous fees not included, varies by campus and program.",
            "admission_requirements": "Entrance exam, HS graduate.",
            "grade_requirements": "GWA 80%, no failing grade in behavior.",
            "school_requirements": "Form 138, good moral, PSA.",
            "school_website": "https://www.dhvsu.edu.ph",
            "location": "Mexico, Pampanga",
            "school_type": "Public"
        },
        {
            "school": "Don Honorio Ventura State University",
            "school_logo": "/logos/psu.png",
            "name": "Bachelor of Science in Psychology",
            "category": "social_science",
            "icon": "Brain",
            "description": "Explores mental processes, behavior, and human development for counseling or research careers.",
            "tuition_per_semester": None,
            "tuition_annual": None,
            "tuition_notes": "Miscellaneous fees not included, varies by campus and program.",
            "admission_requirements": "Interview, entrance test.",
            "grade_requirements": "80% average or above.",
            "school_requirements": "Form 138, good moral certificate, PSA.",
            "school_website": "https://www.dhvsu.edu.ph",
            "location": "Mexico, Pampanga",
            "school_type": "Public"
        }
    ]
