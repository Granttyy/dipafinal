import { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  GraduationCap,
  Briefcase,
  Code,
  Ruler,
  Stethoscope,
  BookOpen,
  Wrench,
  FlaskConical,
  Palette,
  ShieldCheck,
  Brain,
  School, 
  MapPin,
  Landmark,
  BadgeDollarSign,
  Globe,
  FileText,
  ClipboardList,
  StickyNote,
} from "lucide-react";

export default function ShowcaseCarousel() {
  const [programs, setPrograms] = useState([]);
  const [selected, setSelected] = useState(null);
  const scrollRef = useRef(null);

  const iconMap = {
    GraduationCap,
    Briefcase,
    Code,
    Ruler,
    Stethoscope,
    BookOpen,
    Wrench,
    FlaskConical,
    Palette,
    ShieldCheck,
    Brain,
  };

  const iconColorMap = {
    GraduationCap: "text-blue-500",
    Briefcase: "text-orange-500",
    Code: "text-purple-500",
    Ruler: "text-amber-500",
    Stethoscope: "text-red-500",
    BookOpen: "text-green-600",
    Wrench: "text-gray-600",
    FlaskConical: "text-teal-500",
    Palette: "text-pink-500",
    ShieldCheck: "text-yellow-600",
    Brain: "text-indigo-600",
  };

  useEffect(() => {
    axios
      .get("http://localhost:8000/programs/showcase")
      .then((res) => setPrograms(res.data))
      .catch((err) => console.error("Failed to fetch showcase:", err));
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    const onWheel = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };
    container?.addEventListener("wheel", onWheel, { passive: false });
    return () => container?.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div className="py-20 bg-gray-50 relative">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
          Explore Featured Programs
        </h2>

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
        >
          {programs.map((program, idx) => {
            const isSelected = selected?.name === program.name;
            const Icon = iconMap[program.icon] || GraduationCap;
            const iconColor = iconColorMap[program.icon] || "text-blue-500";

            return (
              <div
                key={idx}
                onClick={() => setSelected(program)}
                className={`flex-shrink-0 w-[350px] bg-white shadow-lg rounded-2xl p-6 cursor-pointer hover:scale-105 transition-all duration-300 border ${
                  isSelected
                    ? "border-blue-500 ring-2 ring-blue-300"
                    : "border-gray-200 hover:border-blue-400"
                }`}
              >
                {/* Logo + School Name + Icon */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={program.school_logo}
                      alt="Logo"
                      className="h-10 w-10 object-contain"
                    />
                    <p className="text-sm font-medium text-gray-600">
                      {program.school}
                    </p>
                  </div>
                  <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>

                {/* Program Name */}
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {program.name}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-500 line-clamp-3">
                  {program.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Popup Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/30"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white w-[90%] max-w-3xl rounded-2xl shadow-xl p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Title */}
            <h3 className="text-2xl font-bold mb-4 text-gray-900">
              {selected.name}
            </h3>

            {/* Logo + School Name */}
            <div className="flex items-center gap-3 mb-6">
              <img
                src={selected.school_logo}
                alt="Logo"
                className="h-10 w-10 object-contain"
              />
              <span className="text-lg text-gray-800 font-semibold">
                {selected.school}
              </span>
            </div>

            {/* Info Details */}
            <div className="space-y-3 text-gray-600 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-500" />
                <span>
                  <strong>Location:</strong> {selected.location}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Landmark className="w-4 h-4 text-green-600" />
                <span>
                  <strong>Type:</strong> {selected.school_type}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <BadgeDollarSign className="w-4 h-4 text-yellow-600" />
                <span>
                  <strong>Tuition/Sem:</strong>{" "}
                  {selected.tuition_per_semester
                    ? `₱${selected.tuition_per_semester}`
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <BadgeDollarSign className="w-4 h-4 text-yellow-600" />
                <span>
                  <strong>Tuition/Year:</strong>{" "}
                  {selected.tuition_annual
                    ? `₱${selected.tuition_annual}`
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <StickyNote className="w-4 h-4 text-purple-500" />
                <span>
                  <strong>Note:</strong>{" "}
                  {selected.tuition_notes || "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-orange-500" />
                <span>
                  <strong>Admission:</strong>{" "}
                  {selected.admission_requirements}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-orange-500" />
                <span>
                  <strong>Grade Req:</strong> {selected.grade_requirements}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-600" />
                <span>
                  <strong>School Req:</strong> {selected.school_requirements}
                </span>
              </div>
              {selected.school_website && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <a
                    href={selected.school_website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Visit Website
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
