import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Heart, MapPin, DollarSign, School, Search } from "lucide-react"
import Navbar from "../components/navbar"
import Footer from "../components/Footer"

function UniFinder() {
  const [interest, setInterest] = useState("")
  const [schoolType, setSchoolType] = useState("any")
  const [locations, setLocations] = useState([])
  const [maxBudget, setMaxBudget] = useState(50000)

  const navigate = useNavigate()

  const search = async () => {
    const payload = {
      interest,
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

    navigate("/results")
  }

  const allLocations = [
    "Angeles", "Apalit", "Bacolor", "Candaba", "Mabalacat",
    "Magalang", "Malolos", "Mexico", "Porac", "San Fernando",
  ]

  const filteredLocations = schoolType === "private"
    ? ["Angeles", "San Fernando"]
    : allLocations

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-10 px-4">
        <div className="max-w-5xl mx-auto space-y-10">

          {/* Note Section */}
          <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4 rounded-xl shadow-sm text-gray-800">
            <p className="text-sm md:text-base">
              <strong>Note:</strong> All the recommendations you see are based on what you share with us — your interests, preferences, and goals. These are just suggestions to help you explore your options. We're here to guide you, not to decide for you. What matters most is what feels right for you.
            </p>
          </div>

          {/* Interest Input */}
          <div className="border-2 rounded-xl bg-white shadow-sm hover:shadow-md transition p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-pink-100 p-2 rounded-lg">
                <Heart className="text-pink-600" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">Your Interests</h2>
                <p className="text-sm text-gray-600">What subjects or hobbies are you passionate about?</p>
              </div>
            </div>
            <input
              type="text"
              placeholder="e.g., Business, Engineering, Arts..."
              className="w-full px-4 py-3 border rounded-xl text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
            />
          </div>

          {/* School Type Selector */}
          <div className="border-2 rounded-xl bg-white shadow-sm hover:shadow-md transition p-6">
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
                { value: "any", label: "Both Types", desc: "I’m open to all options" },
              ].map(({ value, label, desc }) => (
                <label
                  key={value}
                  className={`flex items-start gap-3 p-4 rounded-lg border transition cursor-pointer
                    ${schoolType === value ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"}`}
                >
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
                          setLocations((prev) =>
                            prev.filter((loc) => ["Angeles", "San Fernando"].includes(loc))
                          )
                        }
                      }}
                      className="absolute w-5 h-5 opacity-0 cursor-pointer"
                    />
                    <span
                      className={`w-5 h-5 rounded-full border-2 transition-all duration-200
                        ${schoolType === value ? "bg-blue-600 border-blue-600" : "bg-transparent border-transparent"}`}
                    />
                  </span>

                  <div>
                    <span className="font-medium text-gray-800">{label}</span>
                    <p className="text-sm text-gray-600">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Budget Slider */}
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
                <span>₱5,000</span>
                <span>₱50,000</span>
                <span>₱100,000</span>
              </div>
            </div>
          )}

          {/* Location Checkboxes */}
          <div className="border-2 rounded-xl bg-white shadow-sm hover:shadow-md transition p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-purple-100 p-2 rounded-lg">
                <MapPin className="text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">Preferred Locations</h2>
                <p className="text-base text-gray-600">Choose cities in Pampanga where you’d like to study</p>
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
                    className={`w-5 h-5 rounded border-2 transition duration-200 appearance-none relative
                      ${locations.includes(loc)
                        ? "bg-purple-600 border-purple-600 text-white"
                        : "bg-transparent border-purple-300"}
                      checked:bg-purple-600 checked:border-purple-600 checked:text-white
                      after:content-['✔'] after:absolute after:top-0.5 after:left-[5px] after:text-white after:text-sm after:opacity-${locations.includes(loc) ? "100" : "0"}`}
                  />
                  {loc}
                </label>
              ))}
            </div>
          </div>

          {/* Search Button */}
          <div className="text-center pt-6">
            <button
              onClick={search}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-md transition"
            >
              <Search className="inline-block w-5 h-5 mr-2" />
              Find Programs
            </button>
            <p className="text-sm text-gray-600 mt-2">
              We’ll match you with the best schools and courses
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}

export default UniFinder
