import { useEffect, useState, useMemo } from "react";
import {
  MapPin,
  Landmark,
  BadgeDollarSign,
  Globe,
  FileText,
  ClipboardList,
  StickyNote,
  Search,
  GraduationCap,
  BookOpen,
  ListChecks,
  Building2,
  Link as LinkIcon
} from "lucide-react";

export default function ProgramExplorer() {
  const [programs, setPrograms] = useState([]);
  const [selected, setSelected] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedSchoolType, setSelectedSchoolType] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const allLocations = [
    "Angeles", "Apalit", "Bacolor", "Candaba", "Mabalacat",
    "Magalang", "Malolos", "Mexico", "Porac", "San Fernando",
  ];

  const categoryOptions = [
    "Business", "Computing Studies", "Accounting",
    "Engineering", "Education", "Hospitality and Service", "Social Science",
    "Maritime", "Language", "Medicine", "Communication", "Architecture",
    "Science", "Mathematics", "Sports", "Logistics", "Industrial Technology",
    "Arts and Design", "Arts and Culture", "Arts and History",
    "Agriculture and Fisheries"
  ];

  useEffect(() => {
    fetch("http://localhost:8000/programs/from-file")
      .then((res) => res.json())
      .then((data) => setPrograms(data))
      .catch((err) => console.error("Error fetching vector programs:", err));
  }, []);

  const filteredPrograms = useMemo(() => {
    return programs.filter((program) => {
      const programTown = program.location.split(",")[0].trim();

      const matchesSearch =
        program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.school.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLocation =
        !selectedLocation || programTown === selectedLocation;

      const matchesSchoolType =
        !selectedSchoolType || program.school_type === selectedSchoolType;

      const matchesCategory =
        !selectedCategory || program.category === selectedCategory;

      return (
        matchesSearch &&
        matchesLocation &&
        matchesSchoolType &&
        matchesCategory
      );
    });
  }, [programs, searchTerm, selectedLocation, selectedSchoolType, selectedCategory]);

  const filteredLocationOptions =
    selectedSchoolType === "Private"
      ? ["Angeles", "San Fernando"]
      : allLocations;

  const groupedPrograms = filteredPrograms.reduce((acc, program) => {
    if (!acc[program.school]) acc[program.school] = [];
    acc[program.school].push(program);
    return acc;
  }, {});

  return (
    <div className="p-4 bg-white min-h-screen text-gray-800">
      <h1 className="text-2xl font-semibold text-center mb-6">
        Explore All Programs
      </h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-6 items-center justify-center flex-wrap">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search school or program"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300 text-sm"
          />
        </div>

        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring"
        >
          <option value="">Select location</option>
          {filteredLocationOptions.map((loc, idx) => (
            <option key={idx} value={loc}>
              {loc}
            </option>
          ))}
        </select>

        <select
          value={selectedSchoolType}
          onChange={(e) => {
            setSelectedSchoolType(e.target.value);
            setSelectedLocation("");
          }}
          className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring"
        >
          <option value="">Select school type</option>
          {["Public", "Private"].map((type, idx) => (
            <option key={idx} value={type}>
              {type}
            </option>
          ))}
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring"
        >
          <option value="">Select category</option>
          {categoryOptions.map((cat, idx) => (
            <option key={idx} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Grouped Programs by School */}
      {Object.entries(groupedPrograms).map(([schoolName, programList], idx) => (
        <div key={idx} className="mb-10">
          <div className="flex justify-center mb-2">
            <img
              src={programList[0].school_logo}
              alt={`${schoolName} logo`}
              className="w-20 h-20 object-contain"
            />
          </div>
          <div className="text-center text-lg font-semibold mb-4">{schoolName}</div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {programList.map((program, pIdx) => (
              <div
                key={pIdx}
                onClick={() => setSelected(program)}
                className="border p-4 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer bg-gray-50"
              >
                <div className="flex items-center gap-2 mb-3">
                  <img
                    src={program.school_logo}
                    alt="Logo"
                    className="w-8 h-8 object-contain"
                  />
                  <div className="text-sm font-medium">{program.school}</div>
                </div>
                <h2 className="text-base font-semibold mb-1">{program.name}</h2>
                <p className="text-xs text-gray-600 line-clamp-3">
                  {program.description}
                </p>
              </div>
            ))}
          </div>

          <hr className="mt-10 border-t border-gray-200" />
        </div>
      ))}

      {/* Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex justify-center items-center px-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-lg p-5 w-full max-w-2xl shadow-lg overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-3">{selected.name}</h3>

            <div className="flex items-center gap-2 mb-3">
              <img
                src={selected.school_logo}
                alt="Logo"
                className="h-8 w-8 object-contain"
              />
              <p className="text-sm font-medium">{selected.school}</p>
            </div>

            {/* Updated info layout */}
            <div className="mt-5 space-y-2 text-sm text-gray-700 animate-fade-in">
              <p className="flex items-center gap-2">
                <Landmark className="w-4 h-4 text-blue-600" />
                <strong>Type:</strong> {selected.school_type || "N/A"}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-500" />
                <strong>Location:</strong> {selected.location || "N/A"}
              </p>
              <p className="flex items-center gap-2">
                <BadgeDollarSign className="w-4 h-4 text-green-600" />
                <strong>Tuition/Sem:</strong> {selected.tuition_per_semester || "Enjoy free tuition under this government-supported academic program."}
              </p>
              <p className="flex items-center gap-2">
                <BadgeDollarSign className="w-4 h-4 text-green-600" />
                <strong>Tuition/Year:</strong> {selected.tuition_annual || "Enjoy free tuition under this government-supported academic program."}
              </p>
              <p className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-purple-600" />
                <strong>Board Passing Rate:</strong> {selected.board_passing_rate || "N/A"}
              </p>
              <p className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <strong>Category:</strong> {selected.category || "N/A"}
              </p>
              <p className="flex items-center gap-2">
                <BadgeDollarSign className="w-4 h-4 text-yellow-500" />
                <strong>Special Note:</strong> {selected.tuition_notes || "N/A"}
              </p>
              <p className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-yellow-600" />
                <strong>Admission Requirements:</strong> {selected.admission_requirements || "N/A"}
              </p>
              <p className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                <strong>Grade Requirements:</strong> {selected.grade_requirements || "N/A"}
              </p>
              <p className="flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-teal-600" />
                <strong>School Requirements:</strong> {selected.school_requirements || "N/A"}
              </p>
              {selected.school_website && (
                <p className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <strong>Website:</strong>{" "}
                  <a
                    href={selected.school_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    {selected.school_website}
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
