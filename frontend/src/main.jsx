import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import UniFinder from "./pages/UniFinder";
import Results from "./pages/Results";
import ComparePage from "./pages/ComparePage"; 
import ProgramExplorer from "./pages/ProgramExplorer";
import AdminDashboard from "./pages/AdminDashboard";
import './index.css';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/unifinder" element={<UniFinder />} />
        <Route path="/results" element={<Results />} /> {/* ✅ Add Results route */}
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/programs" element={<ProgramExplorer />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
