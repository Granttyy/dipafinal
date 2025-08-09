import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Heart, MapPin, DollarSign, School, Search } from "lucide-react"
import Navbar from "../components/navbar"
import Footer from "../components/Footer"

function UniFinder() {
  const [step, setStep] = useState(1)
  const navigate = useNavigate()

  const [answers, setAnswers] = useState({
  academics: [],
  fields: [],
  activities: [],
  goals: [],
  environment: [],
  custom: {
    academics: "", fields: "", activities: "", goals: "", environment: "",
  }
})


  const [schoolType, setSchoolType] = useState("any")
  const [locations, setLocations] = useState([])
  const [maxBudget, setMaxBudget] = useState(50000)

  const handleCheckboxChange = (questionKey, choice) => {
  setAnswers(prevAnswers => {
    const selected = prevAnswers[questionKey];
    const isSelected = selected.includes(choice);

    if (isSelected) {
      // Remove the choice if already selected
      return {
        ...prevAnswers,
        [questionKey]: selected.filter(item => item !== choice)
      };
    } else {
      // Limit selection to 3
      if (selected.length >= 3) return prevAnswers;

      return {
        ...prevAnswers,
        [questionKey]: [...selected, choice]
      };
    }
  });
};


  const handleCustomChange = (category, value) => {
    setAnswers(prev => ({
      ...prev,
      custom: { ...prev.custom, [category]: value }
    }))
  }

  const allLocations = ["Angeles", "Apalit", "Bacolor", "Candaba", "Mabalacat", "Magalang", "Malolos", "Mexico", "Porac", "San Fernando"]
  const filteredLocations = schoolType === "private" ? ["Angeles", "San Fernando"] : allLocations

 const questions = [
  {
    key: "academics",
    title: "What subjects or academic areas do you enjoy the most?",
    choices: [
      "Math",
      "Science",
      "English",
      "History or Social Studies",
      "PE or Sports",
      "Arts or Design",
      "Technology or ICT",
      "Business or Economics",
      "Foreign Languages"
    ]
  },
  {
    key: "fields",
    title: "Which fields or careers are you most drawn to?",
    choices: [
      "Engineering & Architecture",
      "Business & Entrepreneurship",
      "Arts & Media",
      "Healthcare & Medicine",
      "Education & Teaching",
      "Social Work & Community Service",
      "Law & Government",
      "Science & Research",
      "Technology & Computing"
    ]
  },
  {
    key: "activities",
    title: "What kinds of tasks or activities do you enjoy doing?",
    choices: [
      "Designing or creating",
      "Solving puzzles or problems",
      "Writing or storytelling",
      "Building or fixing things",
      "Helping or mentoring others",
      "Researching or analyzing",
      "Speaking or presenting",
      "Working in teams or leading",
      "Hands-on or field work"
    ]
  },
  {
    key: "goals",
    title: "What goals matter most to you in a future career?",
    choices: [
      "Innovating or inventing things",
      "Making a positive impact on people’s lives",
      "Educating and spreading knowledge",
      "Advancing technology or science",
      "Protecting the environment",
      "Supporting communities",
      "Driving economic or business growth",
      "Promoting justice or fairness",
      "Working in a stable, practical career"
    ]
  },
  {
    key: "environment",
    title: "What environment or setting do you see yourself working in?",
    choices: [
      "Office or corporate setting",
      "Classroom or academic setting",
      "Hospitals or clinics",
      "Outdoor or field work",
      "Workshop or laboratory",
      "Studio or creative space",
      "Tech-driven/digital environments",
      "Legal or government institutions",
      "Remote or freelance setup"
    ]
  }
];


  const search = async () => {
  const payload = {
    answers,
    school_type: schoolType,
    locations,
  }

  if (schoolType === "private") {
    payload.max_budget = maxBudget
  }

  const response = await fetch("http://127.0.0.1:8000/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  const data = await response.json()

  localStorage.setItem("results", JSON.stringify(data.results || []))
  localStorage.setItem("message", data.message || "")

  // ✅ Add this line:
  localStorage.setItem("type", data.type || "exact")

  navigate("/results")
}

  const ProgressBar = () => {
  const steps = [1, 2, 3]

  return (
    <div className="w-full mb-10 px-2">
      {/* Bar Container */}
      <div className="relative flex items-center justify-between">
        {/* Background Line */}
        <div className="absolute top-1/2 left-0 w-full h-3 bg-green-200 rounded-full -translate-y-1/2 z-0" />

        {/* Foreground Line (Progress) */}
        <div
          className="absolute top-1/2 left-0 h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full z-10 transition-all duration-500 ease-in-out"
          style={{
            width: `${((step - 1) / (steps.length - 1)) * 100}%`,
            transform: "translateY(-50%)",
          }}
        />

        {/* Step Circles */}
        {steps.map((s) => {
          const isCompleted = step > s
          const isCurrent = step === s

          return (
            <div key={s} className="relative z-20">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ease-in-out
                  ${isCompleted
                    ? "bg-green-500 text-white"
                    : isCurrent
                      ? "bg-white border-[4px] border-green-500 text-green-700 shadow-lg"
                      : "bg-white border-[2px] border-green-300 text-gray-500"
                  }`}
              >
                {s}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}


  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-10 px-4">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* Progress Bar */}
          <ProgressBar />

          {/* Note Section */}
          <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4 rounded-xl shadow-sm text-gray-800">
            <p className="text-sm md:text-base">
              <strong>Note:</strong> All the recommendations you see are based on what you share with us — your interests, preferences, and goals.
            </p>
          </div>

          {/* Step 1: Questions */}
          {step === 1 && (
            <>
              {questions.map((q) => (
                <div key={q.key} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-pink-100 p-2 rounded-md">
                      <Heart className="text-pink-600 w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-medium text-gray-800">{q.title}</h2>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {q.choices.map((choice) => (
                      <label key={choice} className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <div className="relative">
                          <input
                            type="checkbox"
                            className="peer appearance-none h-5 w-5 border-2 border-pink-400 rounded-sm checked:bg-pink-500 checked:border-pink-500 focus:ring-2 focus:ring-pink-400 transition"
                            checked={answers[q.key].includes(choice)}
                            onChange={() => handleCheckboxChange(q.key, choice)}
                          />
                          <div className="pointer-events-none absolute top-0 left-0 h-5 w-5 flex items-center justify-center text-white text-xs font-bold peer-checked:opacity-100 opacity-0">
                            ✓
                          </div>
                        </div>
                        <span>{choice}</span>
                      </label>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="Other (optional)..."
                    className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
                    value={answers.custom[q.key]}
                    onChange={(e) => handleCustomChange(q.key, e.target.value)}
                  />
                </div>
              ))}

              <div className="text-right">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-base font-medium shadow transition"
                  onClick={() => setStep(2)}
                >
                  Next
                </button>
              </div>
            </>
          )}

          {/* Step 2: School type & budget */}
          {step === 2 && (
            <>
              <div className="border-2 rounded-xl bg-white shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <School className="text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800">Preferred School Type</h2>
                    <p className="text-sm text-gray-600">Choose which type of school you prefer</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { value: "public", label: "Public Schools", desc: "State-funded, affordable options" },
                    { value: "private", label: "Private Schools", desc: "Privately-run with more variety" },
                    { value: "any", label: "Both Types", desc: "I'm open to all options" },
                  ].map(({ value, label, desc }) => (
                    <label key={value} className={`flex items-start gap-3 p-4 rounded-lg border transition cursor-pointer ${schoolType === value ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"}`}>
                      <span className="relative w-5 h-5">
                        <input
                          type="radio"
                          name="schoolType"
                          value={value}
                          checked={schoolType === value}
                          onChange={(e) => {
                            const selected = e.target.value
                            setSchoolType(selected)
                            if (selected === "private") {
                              setLocations(prev => prev.filter(loc => ["Angeles", "San Fernando"].includes(loc)))
                            }
                          }}
                          className="absolute w-5 h-5 opacity-0 cursor-pointer"
                        />
                        <span className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${schoolType === value ? "bg-blue-600 border-blue-600" : "bg-transparent border-gray-300"}`} />
                      </span>

                      <div>
                        <span className="font-medium text-gray-800">{label}</span>
                        <p className="text-sm text-gray-600">{desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {schoolType === "private" && (
                <div className="border-2 border-green-200 bg-green-50/60 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <DollarSign className="text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-800">Maximum Tuition</h2>
                      <p className="text-sm text-gray-600">Set your budget per semester</p>
                    </div>
                  </div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Selected: ₱{maxBudget.toLocaleString()}
                  </label>
                  <input
                    type="range"
                    min={5000}
                    max={100000}
                    step={1000}
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(Number(e.target.value))}
                    className="w-full accent-green-600"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <span>₱5,000</span><span>₱50,000</span><span>₱100,000</span>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <button className="text-sm text-blue-700 hover:underline" onClick={() => setStep(1)}>← Back</button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-base font-medium shadow transition" onClick={() => setStep(3)}>Next</button>
              </div>
            </>
          )}

          {/* Step 3: Location + Submit */}
          {step === 3 && (
            <>
              <div className="border-2 rounded-xl bg-white shadow-sm hover:shadow-md transition p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <MapPin className="text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800">Preferred Locations</h2>
                    <p className="text-base text-gray-600">Choose cities in Pampanga where you'd like to study</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-y-4 text-base text-gray-800">
                  {filteredLocations.map((loc) => (
                    <label key={loc} className="flex items-center gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        value={loc}
                        checked={locations.includes(loc)}
                        onChange={(e) => {
                          const checked = e.target.checked
                          setLocations((prev) =>
                            checked ? [...prev, loc] : prev.filter((l) => l !== loc)
                          )
                        }}
                        className="w-5 h-5 rounded border-2 border-purple-300 checked:bg-purple-600 checked:border-purple-600"
                      />
                      {loc}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button className="text-sm text-blue-700 hover:underline" onClick={() => setStep(2)}>← Back</button>
                <button onClick={search} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-md transition">
                  <Search className="inline-block w-5 h-5 mr-2" />
                  Find Programs
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </>
  )
}

export default UniFinder
