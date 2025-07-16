import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import {
  GraduationCap,
  MapPin,
  DollarSign,
  FileText,
  BookOpen,
  ListChecks,
  Link as LinkIcon,
  Building2,
  Ruler
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import schoolStrengths from "../data/school_strengths.json";

const knownCities = [
  "San Fernando", "Angeles", "Mabalacat", "Apalit", "Bacolor", "Candaba", "Magalang", "Malolos", "Mexico", "Porac"
];

const cityCoordinates = {
  "San Fernando": { lat: 15.0305, lng: 120.6845 },
  "Angeles": { lat: 15.1472, lng: 120.5849 },
  "Mabalacat": { lat: 15.2086, lng: 120.5736 },
  "Apalit": { lat: 14.9536, lng: 120.7681 },
  "Bacolor": { lat: 14.9936, lng: 120.6507 },
  "Candaba": { lat: 15.0954, lng: 120.8276 },
  "Magalang": { lat: 15.2156, lng: 120.6593 },
  "Malolos": { lat: 14.8433, lng: 120.8114 },
  "Mexico": { lat: 15.0644, lng: 120.7196 },
  "Porac": { lat: 15.0707, lng: 120.5423 }
};

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
    localStorage.getItem("manualCity") || ""
  );
  const navigate = useNavigate();

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
                address.city ||
                address.town ||
                address.village ||
                address.county;
              setUserCity(city);
            })
            .catch((error) =>
              console.error("Reverse geocoding error:", error)
            );
        },
        (error) => {
          console.error("Geolocation error:", error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    }
  }, []);

  const displayedCity = manualCity || userCity;

  const handleCityChange = (value) => {
    setManualCity(value);
    localStorage.setItem("manualCity", value);
  };

  const handleCheckboxChange = (item) => {
    const isAlreadySelected = selectedSchools.some(
      (school) =>
        school.school === item.school && school.program === item.program
    );

    if (isAlreadySelected) {
      setSelectedSchools((prev) =>
        prev.filter(
          (school) =>
            !(school.school === item.school && school.program === item.program)
        )
      );
    } else {
      setSelectedSchools((prev) => [...prev, item]);
    }
  };

  if (!results || results.length === 0) {
    return (
      <p className="text-center text-gray-500">
        {message || "No results found."}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {displayedCity && (
        <div className="text-center text-sm text-gray-700">
          📍 You're viewing from: <span className="font-semibold">{displayedCity}</span>
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
          (school) =>
            school.school === item.school && school.program === item.program
        );

        const schoolInfo = schoolStrengths[item.school] || {};
        const mapsQuery = schoolInfo.maps_query;

        let referenceLocation = userLocation;
        if (manualCity && cityCoordinates[manualCity]) {
          referenceLocation = cityCoordinates[manualCity];
        }

        let distanceText = null;
        if (
          referenceLocation.lat &&
          referenceLocation.lng &&
          schoolInfo.coords?.lat &&
          schoolInfo.coords?.lng
        ) {
          const distance = getDistanceFromLatLonInKm(
            referenceLocation.lat,
            referenceLocation.lng,
            schoolInfo.coords.lat,
            schoolInfo.coords.lng
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
                <div className="w-16 h-16 flex items-center justify-center bg-white rounded-lg overflow-hidden">
                  <img
                    src={item.school_logo}
                    alt={`${item.school} logo`}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <div className="flex-1">
                <h2 className="font-semibold text-lg text-blue-800">
                  {item.program}
                </h2>
                <p className="text-sm text-gray-600">{item.school}</p>
              </div>

              <button
                className={`text-xs font-medium px-3 py-1 rounded-full border transition ${
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
            </div>

            <p className="text-gray-800 text-sm leading-relaxed">
              {item.description}
            </p>
            <p className="text-xs text-right mt-2 text-gray-500">
              Score: {item.score}
            </p>

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
                  <strong>Tuition/Sem:</strong> {item.tuition_per_semester || "N/A"}
                </p>
                <p className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <strong>Tuition/Year:</strong> {item.tuition_annual || "N/A"}
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

      {selectedSchools.length >= 2 && (
        <div className="text-center mt-6">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-xl shadow"
            onClick={() => navigate("/compare", { state: { selectedSchools } })}
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
  message: PropTypes.string
};

export default ResultsSection;
