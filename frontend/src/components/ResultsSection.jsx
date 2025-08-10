import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { GraduationCap, MapPin, DollarSign, FileText, BookOpen, ListChecks, LinkIcon, Building2, Ruler, ThumbsUp, ThumbsDown, X } from 'lucide-react';
import { useNavigate } from "react-router-dom";

// --- Data Definitions ---
const knownCities = [
  "San Fernando",
  "Angeles",
  "Mabalacat",
  "Apalit",
  "Bacolor",
  "Candaba",
  "Magalang",
  "Malolos",
  "Mexico",
  "Porac",
];

const cityCoordinates = {
  "San Fernando": { lat: 15.0305, lng: 120.6845 },
  Angeles: { lat: 15.1472, lng: 120.5849 },
  Mabalacat: { lat: 15.2086, lng: 120.5736 },
  Apalit: { lat: 14.9536, lng: 120.7681 },
  Bacolor: { lat: 14.9936, lng: 120.6507 },
  Candaba: { lat: 15.0954, lng: 120.8276 },
  Magalang: { lat: 15.2156, lng: 120.6593 },
  Malolos: { lat: 14.8433, lng: 120.8114 },
  Mexico: { lat: 15.0644, lng: 120.7196 },
  Porac: { lat: 15.0707, lng: 120.5423 },
};

function formatValue(val, fallback = "N/A") {
  if (
    val === null ||
    val === undefined ||
    val === "" ||
    (Array.isArray(val) && val.length === 0)
  ) {
    return fallback;
  }
  return val;
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function ResultsSection({ results, message }) {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [selectedSchools, setSelectedSchools] = useState([]);
  const [userLocation, setUserLocation] = useState({ lat: null, lng: null });
  const [userCity, setUserCity] = useState(null);
  const [manualCity, setManualCity] = useState(
    typeof window !== "undefined" ? localStorage.getItem("manualCity") || "" : ""
  );
  const [schoolStrengths, setSchoolStrengths] = useState({});
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const navigate = useNavigate();

  // --- Effects ---
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          )
            .then((res) => res.json())
            .then((data) => {
              const address = data.address || {};
              const city =
                address.city || address.town || address.village || address.county;
              setUserCity(city || null);
            })
            .catch((error) => console.error("Reverse geocoding error:", error));
        },
        (error) => {
          console.error("Geolocation error:", error.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, []);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/school-strengths")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setSchoolStrengths(data || {});
      })
      .catch((error) => {
        console.error("Error fetching school strengths:", error);
        setSchoolStrengths({});
      });
  }, []);

  // --- Handlers & Render Logic ---
  const displayedCity = manualCity || userCity || "";

  const handleCityChange = (value) => {
    setManualCity(value);
    localStorage.setItem("manualCity", value);
  };

  const handleCheckboxChange = (item) => {
    const isAlreadySelected = selectedSchools.some(
      (school) => school.program_id === item.program_id
    );
    if (isAlreadySelected) {
      setSelectedSchools((prev) =>
        prev.filter((school) => school.program_id !== item.program_id)
      );
    } else {
      setSelectedSchools((prev) => [...prev, item]);
    }
  };

  const handleFeedback = async (feedbackType) => {
    if (feedbackSubmitted) return;
    setFeedbackLoading(true);
    try {
      const storedResults = JSON.parse(localStorage.getItem("results") || "[]");
      const userAnswers = JSON.parse(localStorage.getItem("userAnswers") || "{}");
      const userEmbeddings = JSON.parse(
        localStorage.getItem("userEmbeddings") || "{}"
      );

      const feedbackData = {
        session_id: Date.now().toString(),
        user_answers: userAnswers,
        user_embeddings: userEmbeddings,
        recommended_programs: storedResults,
        feedback_type: feedbackType,
        feedback_details: `User provided ${feedbackType} feedback for recommendations`,
        selected_program: null,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch("http://127.0.0.1:8000/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedbackData),
      });

      if (response.ok) {
        setFeedbackSubmitted(true);
        console.log("Feedback submitted successfully");
      } else {
        console.error("Failed to submit feedback");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setFeedbackLoading(false);
    }
  };

  if (!results || results.length === 0) {
    return (
      <p className="text-center text-gray-500">{message || "No results found."}</p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="text-sm text-gray-700">
            {displayedCity ? (
              <span>
                {"📍 You're viewing from: "}
                <span className="font-semibold">{displayedCity}</span>
              </span>
            ) : (
              <span className="italic text-gray-500">
                Location not detected yet
              </span>
            )}
          </div>
          <div className="md:ml-auto flex items-center gap-2">
            <label className="text-gray-600 text-xs">Not accurate?</label>
            <select
              className="border rounded px-2 py-1 text-sm text-gray-700"
              value={manualCity}
              onChange={(e) => handleCityChange(e.target.value)}
              aria-label="Select your city"
            >
              <option value="">Select your city</option>
              {knownCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {message && (
        <p className="text-center text-yellow-600 font-medium text-sm mb-4">
          {message}
        </p>
      )}

      {results.map((item, index) => {
        const isExpanded = expandedIndex === index;
        const isSelected = selectedSchools.some(
          (school) => school.program_id === item.program_id
        );

        // Extract school information (fallbacks kept for display above)
        const schoolName = item.school || "Unknown School";
        const schoolType = item.school?.type || "N/A";
        const schoolLocation = item.school?.location || "N/A";

        // Strengths lookup (kept for distance coords fallback)
        const strengthsInfo = schoolStrengths[schoolName] || {};

        // Compute reference location (manual city overrides user geolocation)
        let referenceLocation = userLocation;
        if (manualCity && cityCoordinates[manualCity]) {
          referenceLocation = cityCoordinates[manualCity];
        }

        // Determine distance text (prefer per-item coords if present, else strengths coords)
        const targetLat =
          (item.coords && item.coords.lat) ||
          (strengthsInfo.coords && strengthsInfo.coords.lat) ||
          null;
        const targetLng =
          (item.coords && item.coords.lng) ||
          (strengthsInfo.coords && strengthsInfo.coords.lng) ||
          null;

        let distanceText = null;
        if (
          referenceLocation.lat != null &&
          referenceLocation.lng != null &&
          targetLat != null &&
          targetLng != null
        ) {
          const distance = getDistanceFromLatLonInKm(
            referenceLocation.lat,
            referenceLocation.lng,
            targetLat,
            targetLng
          );
          distanceText = `Approx. ${distance.toFixed(2)} km from you`;
        }

        // For the map embed
        const mapsQuery =
          item.maps_query || `${schoolName} ${item.location || schoolLocation}`;

        const scorePct = Math.max(0, Math.min(100, (item.score || 0) * 100));

        return (
          <div
            key={item.program_id || index}
            className={`rounded-2xl bg-white border border-gray-200 shadow-md transition-all duration-300 cursor-pointer hover:shadow-lg p-6 ${
              isExpanded ? "bg-gray-50" : ""
            }`}
            onClick={() => setExpandedIndex(isExpanded ? null : index)}
          >
            <div className="flex items-start gap-4 mb-3">
              {item.school_logo && (
                <div className="w-16 h-16 flex items-center justify-center bg-white rounded-lg overflow-hidden border">
                  <img
                    src={item.school_logo || "/placeholder.svg"}
                    alt={`${schoolName} logo`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.src =
                        "/placeholder.svg?height=64&width=64&text=Logo";
                    }}
                  />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-lg text-gray-900 mb-1">
                  {formatValue(item.name)}
                </h2>

                {/* Render school summary line */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600">
                  <span className="inline-flex items-center gap-1">
                    <GraduationCap className="w-4 h-4 text-indigo-500" />
                    <span className="font-medium">{schoolName}</span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Building2 className="w-4 h-4 text-blue-500" />
                    <span>{item.school_type || schoolType}</span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <span>{item.location || schoolLocation}</span>
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <button
                  className={`text-xs font-medium px-3 py-1 rounded-full border transition mb-2 ${
                    isSelected
                      ? "bg-red-100 text-red-700 border-red-300 hover:bg-red-200"
                      : "bg-green-100 text-green-700 border-green-300 hover:bg-green-200"
                  }`}
                  aria-pressed={isSelected}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCheckboxChange(item);
                  }}
                >
                  {isSelected ? "Remove" : "Add to Compare"}
                </button>
                <div className="text-xs text-gray-500">
                  Score: {scorePct.toFixed(1)}%
                </div>
              </div>
            </div>

            <p className="text-gray-800 text-sm leading-relaxed mb-3">
              {formatValue(item.description)}
            </p>

            {/* EXPANDED SECTION: replaced with requested fields */}
            {isExpanded && (
              <div className="mt-5 space-y-2 text-sm text-gray-700 animate-fade-in">
                <p className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <strong>Type:</strong> {item.school_type || "N/A"}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <strong>Location:</strong> {item.location || "N/A"}
                </p>
                <p className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <strong>Tuition/Sem:</strong> {item.tuition_per_semester ?? "N/A"}
                </p>
                <p className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <strong>Tuition/Year:</strong> {item.tuition_annual ?? "N/A"}
                </p>
                <p className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-purple-600" />
                  <strong>Board Passing Rate:</strong> {item.board_passing_rate || "N/A"}
                </p>
                <p className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <strong>Category:</strong> {item.category || "N/A"}
                </p>
                <p className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-yellow-500" />
                  <strong>Tuition Notes:</strong> {item.tuition_notes || "N/A"}
                </p>
                <p className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-yellow-600" />
                  <strong>Admission Requirements:</strong> {item.admission_requirements || "N/A"}
                </p>
                <p className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  <strong>Grade Requirements:</strong> {item.grade_requirements || "N/A"}
                </p>
                <p className="flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-teal-600" />
                  <strong>School Requirements:</strong> {item.school_requirements || "N/A"}
                </p>

                {item.school_website && (
                  <p className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-blue-500" />
                    <strong>Website:</strong>{" "}
                    <a
                      href={item.school_website}
                      className="text-blue-600 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Visit Site
                    </a>
                  </p>
                )}

                {mapsQuery && (
                  <div className="mt-4 space-y-4">
                    <iframe
                      src={`https://www.google.com/maps?q=${encodeURIComponent(
                        mapsQuery
                      )}&output=embed`}
                      width="100%"
                      height="300"
                      className="rounded-xl border"
                      loading="lazy"
                      allowFullScreen
                      title={`Map of ${schoolName}`}
                    ></iframe>

                    {distanceText ? (
                      <div className="flex items-center gap-3 bg-gray-100 text-gray-800 p-3 rounded-lg border border-gray-200 shadow-sm">
                        <Ruler className="w-5 h-5 text-blue-500" />
                        <span className="text-sm font-medium">{distanceText}</span>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 italic">
                        📍 Distance not available. Enable location to see how far this school is.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {!feedbackSubmitted && (
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-4 text-center">
            How helpful were these recommendations?
          </h3>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => handleFeedback("positive")}
              disabled={feedbackLoading}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              <ThumbsUp className="w-5 h-5" />
              Helpful
            </button>
            <button
              onClick={() => handleFeedback("negative")}
              disabled={feedbackLoading}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              <ThumbsDown className="w-5 h-5" />
              Not Helpful
            </button>
            <button
              onClick={() => handleFeedback("not_relevant")}
              disabled={feedbackLoading}
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
              Not Relevant
            </button>
          </div>
          {feedbackLoading && (
            <p className="text-center text-gray-600 mt-3 text-sm">
              Submitting feedback...
            </p>
          )}
        </div>
      )}

      {feedbackSubmitted && (
        <div className="mt-8 p-4 bg-green-100 border border-green-300 rounded-xl text-center">
          <p className="text-green-800 font-medium">
            Thank you for your feedback! It helps us improve our recommendations. 🎉
          </p>
        </div>
      )}

      {selectedSchools.length >= 2 && (
        <div className="text-center mt-6">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-xl shadow transition-colors"
            onClick={() => {
              console.log(
                "DEBUG: selectedSchools sent to Compare:",
                selectedSchools
              );
              navigate("/compare", { state: { selectedSchools } });
            }}
          >
            Compare Now ({selectedSchools.length})
          </button>
        </div>
      )}
    </div>
  );
}

ResultsSection.propTypes = {
  results: PropTypes.array.isRequired,
  message: PropTypes.string,
};

export default ResultsSection;