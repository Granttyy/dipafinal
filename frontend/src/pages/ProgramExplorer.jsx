import { useState } from "react";

const ProgramExplorer = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSchoolType, setSelectedSchoolType] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [maxBudget, setMaxBudget] = useState("");

  const handleSearch = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/recommendation/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_input: searchTerm,
          school_type: selectedSchoolType || null,
          locations: selectedLocation ? [selectedLocation] : null,
          max_budget: maxBudget ? parseFloat(maxBudget) : null,
        }),
      });

      if (!response.ok) throw new Error("Search failed");

      const data = await response.json();
      console.log("🎯 API response:", data);

      localStorage.setItem("results", JSON.stringify(data.results));
      window.location.href = "/results";
    } catch (error) {
      console.error("Error during search:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Explore Programs</h1>

      <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Search program"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm"
        />
        <select
          value={selectedSchoolType}
          onChange={(e) => setSelectedSchoolType(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm"
        >
          <option value="">All School Types</option>
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm"
        >
          <option value="">All Locations</option>
          <option value="Pampanga">Pampanga</option>
          <option value="Manila">Manila</option>
        </select>
        <input
          type="number"
          placeholder="Max budget"
          value={maxBudget}
          onChange={(e) => setMaxBudget(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm"
        />
      </div>

      <button
        onClick={handleSearch}
        className="mb-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        Find Program
      </button>
    </div>
  );
};

export default ProgramExplorer;
