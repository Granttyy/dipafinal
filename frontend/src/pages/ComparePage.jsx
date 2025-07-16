import { useLocation } from "react-router-dom";
import { useState } from "react";
import {
  MapPin,
  BookOpen,
  Star,
  Building2,
  Bus,
  GraduationCap,
  Globe,
  Image as ImageIcon
} from "lucide-react";
import schoolStrengths from "../data/school_strengths.json";

function findSchoolData(schoolName) {
  const normalizedName = schoolName.toLowerCase();

  for (const key in schoolStrengths) {
    if (normalizedName.includes(key.toLowerCase())) {
      return schoolStrengths[key];
    }
  }

  return null;
}

export default function ComparePage() {
  const location = useLocation();
  const selectedSchools = location.state?.selectedSchools || [];

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <h1 className="text-3xl font-bold text-blue-800 mb-10 text-center">
        🎓 School Comparison
      </h1>

      {selectedSchools.length === 0 ? (
        <p className="text-center text-gray-500">
          No schools selected. Please return and choose at least two.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {selectedSchools.map((school, index) => {
            const data = findSchoolData(school.school);
            const [photoIndex, setPhotoIndex] = useState(0);

            if (!data) {
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-white rounded-2xl border p-6 shadow-md space-y-4"
                >
                  <h2 className="text-xl font-bold text-blue-800">
                    {school.school}
                  </h2>
                  <p className="text-sm text-gray-700">
                    <strong>Program:</strong> {school.program}
                  </p>
                  <p className="text-sm text-gray-500">No data available for this school.</p>
                </div>
              );
            }

            const {
              logo,
              address,
              what_theyre_known_for,
              institutional_strengths,
              unirank,
              dorm_apartment,
              transport_access,
              scholarships_offered,
              virtual_tour_photos
            } = data;

            return (
              <div
                key={index}
                className="bg-white dark:bg-white rounded-2xl border p-6 shadow-md space-y-4"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={`/logos/${logo}`}
                    alt={school.school}
                    className="w-10 h-10 object-contain"
                  />
                  <h2 className="text-xl font-bold text-blue-800">{school.school}</h2>
                </div>

                <div className="space-y-2 text-sm text-gray-800">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="text-purple-600 w-4 h-4" />
                    <span><strong>Program:</strong> {school.program}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="text-red-500 w-4 h-4" />
                    <span><strong>Address:</strong> {address}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Star className="text-yellow-500 w-4 h-4" />
                    <span><strong>Known For:</strong> {what_theyre_known_for}</span>
                  </div>

                  <div className="flex items-start gap-2">
                    <BookOpen className="text-green-600 w-4 h-4 mt-0.5" />
                    <span>
                      <strong>Institutional Strengths:</strong>{" "}
                      {institutional_strengths.join(", ")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Globe className="text-blue-600 w-4 h-4" />
                    <span>
                      <strong>Unirank:</strong> #{unirank.country_rank} PH / #{unirank.world_rank} Global
                    </span>
                  </div>

                  <div className="flex items-start gap-2">
                    <Building2 className="text-pink-600 w-4 h-4 mt-0.5" />
                    <span><strong>Dorm / Apartment:</strong> {dorm_apartment}</span>
                  </div>

                  <div className="flex items-start gap-2">
                    <Bus className="text-indigo-600 w-4 h-4 mt-0.5" />
                    <span><strong>Transport Access:</strong> {transport_access}</span>
                  </div>

                  <div className="mt-3">
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      🎓 Scholarships Offered:
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-700">
                      {scholarships_offered.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                      <ImageIcon className="text-orange-500 w-4 h-4" />
                      Virtual Tour / Photos:
                    </p>
                    <div className="relative">
                      <img
                        src={`/images/${virtual_tour_photos[photoIndex]}`}
                        alt={`Photo ${photoIndex + 1}`}
                        className="w-full h-48 object-cover rounded-xl border"
                      />
                      {virtual_tour_photos.length > 1 && (
                        <div className="flex justify-between mt-2 text-sm">
                          <button
                            onClick={() =>
                              setPhotoIndex(
                                (photoIndex - 1 + virtual_tour_photos.length) %
                                  virtual_tour_photos.length
                              )
                            }
                            className="text-blue-600 hover:underline"
                          >
                            ◀ Prev
                          </button>
                          <button
                            onClick={() =>
                              setPhotoIndex((photoIndex + 1) % virtual_tour_photos.length)
                            }
                            className="text-blue-600 hover:underline"
                          >
                            Next ▶
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
