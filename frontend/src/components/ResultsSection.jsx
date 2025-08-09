import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import {
  MapPin,
  DollarSign,
  FileText,
  BookOpen,
  LinkIcon,
  Building2,
  Ruler,
  ThumbsUp,
  ThumbsDown,
  X,
} from "lucide-react";
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
  const [manualCity, setManualCity] = useState(localStorage.getItem("manualCity") || "");
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
              const address = data.address;
              const city =
                address.city || address.town || address.village || address.county;
              setUserCity(city);
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
        console.log("DEBUG: school strengths fetched from backend:", data); // Debug log
        setSchoolStrengths(data);
      })
      .catch((error) => {
        console.error("Error fetching school strengths:", error);
        setSchoolStrengths([]);
      });
  }, []);

  // --- Handlers & Render Logic ---
  const displayedCity = manualCity || userCity;

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
      const userEmbeddings = JSON.parse(localStorage.getItem("userEmbeddings") || "{}");

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
      {displayedCity && (
        <div className="text-center text-sm text-gray-700">
          📍 You're viewing from:{" "}
          <span className="font-semibold">{displayedCity}</span>
          <div className="mt-2">
            <label className="text-gray-600 text-xs mr-2">Not accurate?</label>
            <select
              className="border rounded px-2 py-1 text-sm text-gray-700"
              value={manualCity}
              onChange={(e) => handleCityChange(e.target.value)}
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
      )}

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

        // Extract school information from the nested school object
        const schoolName = item.school || "Unknown School";
        const schoolLocation = item.location || "N/A";
        const schoolTuition =
          item.tuition || "Free tuition under government-supported program";
        const schoolType = item.school_type || "N/A";

        // Get additional school info from schoolStrengths
        const strengthsInfo = schoolStrengths[schoolName] || {};

        let referenceLocation = userLocation;
        if (manualCity && cityCoordinates[manualCity]) {
          referenceLocation = cityCoordinates[manualCity];
        }

        let distanceText = null;
        if (
          referenceLocation.lat &&
          referenceLocation.lng &&
          strengthsInfo.coords?.lat &&
          strengthsInfo.coords?.lng
        ) {
          const distance = getDistanceFromLatLonInKm(
            referenceLocation.lat,
            referenceLocation.lng,
            strengthsInfo.coords.lat,
            strengthsInfo.coords.lng
          );
          distanceText = `Approx. ${distance.toFixed(2)} km from you`;
        }

        return (
          <div
            key={index}
            className={`rounded-2xl bg-white border border-blue-100 shadow-md transition-all duration-300 cursor-pointer hover:shadow-xl hover:scale-[1.015] p-6 ${
              isExpanded ? "bg-blue-50" : ""
            }`}
            onClick={() => setExpandedIndex(isExpanded ? null : index)}
          >
            <div className="flex items-center gap-4 mb-3">
              {item.school_logo && (
                <div className="w-16 h-16 flex items-center justify-center bg-white rounded-lg overflow-hidden shadow-sm">
                  <img
                    src={item.school_logo || "/placeholder.svg"}
                    alt={`${schoolName} logo`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.src = "/placeholder.svg?height=64&width=64&text=Logo";
                    }}
                  />
                </div>
              )}
              <div className="flex-1">
                <h2 className="font-semibold text-lg text-blue-800 mb-1">
                  {formatValue(item.name)}
                </h2>
                <p className="text-sm text-gray-700 font-medium">
                  {formatValue(item.school)}
                </p>
              </div>
              <div className="text-right">
                <button
                  className={`text-xs font-medium px-3 py-1 rounded-full border transition mb-2 ${
                    isSelected
                      ? "bg-red-100 text-red-600 border-red-300 hover:bg-red-200"
                      : "bg-green-100 text-green-600 border-green-300 hover:bg-green-200"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCheckboxChange(item);
                  }}
                >
                  {isSelected ? "Remove" : "Add to Compare"}
                </button>
                <div className="text-xs text-gray-500">
                  Score: {(item.score * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            <p className="text-gray-800 text-sm leading-relaxed mb-3">
              {formatValue(item.description)}
            </p>

            {isExpanded && (
              <div className="mt-5 space-y-3 text-sm text-gray-700 animate-fade-in border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <strong>School Type:</strong> {schoolType}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-red-500" />
                      <strong>Location:</strong> {schoolLocation}
                    </p>
                    <p className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <strong>Tuition:</strong>{" "}
                      {formatValue(item.school?.tuition)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {strengthsInfo.category && (
                      <p className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <strong>Category:</strong> {formatValue(strengthsInfo.category)}
                      </p>
                    )}
                    {strengthsInfo.admission_requirements && (
                      <p className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-yellow-600" />
                        <strong>Admission Requirements:</strong>{" "}
                        {formatValue(strengthsInfo.admission_requirements)}
                      </p>
                    )}
                    {strengthsInfo.grade_requirements && (
                      <p className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-indigo-500" />
                        <strong>Grade Requirements:</strong>{" "}
                        {formatValue(strengthsInfo.grade_requirements)}
                      </p>
                    )}
                  </div>
                </div>

                {strengthsInfo.school_website && (
                  <p className="flex items-center gap-2 pt-2">
                    <LinkIcon className="w-4 h-4 text-blue-500" />
                    <strong>Website:</strong>{" "}
                    <a
                      href={strengthsInfo.school_website}
                      className="text-blue-600 underline hover:text-blue-800"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Visit School Website
                    </a>
                  </p>
                )}

                {strengthsInfo.maps_query && (
                  <div className="mt-4 space-y-4">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        School Location
                      </p>
                      <iframe
                        src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(
                          schoolLocation
                        )}`}
                        width="100%"
                        height="250"
                        className="rounded-lg border"
                        loading="lazy"
                        allowFullScreen
                        title={`Map of ${schoolName}`}
                      ></iframe>
                    </div>
                    {distanceText ? (
                      <div className="flex items-center gap-3 bg-blue-50 text-blue-800 p-3 rounded-lg border border-blue-200">
                        <Ruler className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium">{distanceText}</span>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded-lg">
                        📍 Distance calculation not available. Enable location
                        services to see how far this school is from you.
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
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              <ThumbsUp className="w-5 h-5" />
              👍 Helpful
            </button>
            <button
              onClick={() => handleFeedback("negative")}
              disabled={feedbackLoading}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              <ThumbsDown className="w-5 h-5" />
              👎 Not Helpful
            </button>
            <button
              onClick={() => handleFeedback("not_relevant")}
              disabled={feedbackLoading}
              className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
              ❌ Not Relevant
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
              console.log("DEBUG: selectedSchools sent to Compare:", selectedSchools);
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