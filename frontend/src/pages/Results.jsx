import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ResultsSection from "../components/ResultsSection";

function Results() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedResults = JSON.parse(localStorage.getItem("results"));
    const storedMessage = localStorage.getItem("message");

    console.log("📦 Loaded results:", storedResults);
    console.log("📝 Loaded message:", storedMessage);

    if (!storedResults || storedResults.length === 0) {
      navigate("/unifinder");
    } else {
      setResults(storedResults);
      setMessage(storedMessage || "");
      setLoading(false);
    }
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600 text-lg">Loading recommendations...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-50 via-white to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-blue-700 mb-6">🎓 Recommended Programs</h1>
        <ResultsSection results={results} message={message} />
      </div>
    </div>
  );
}

export default Results;
