import { GraduationCap, Home, Search, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <GraduationCap className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Uni-Finder</span>
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600">
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            <Link to="/unifinder" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600">
              <Search className="w-4 h-4" />
              <span>Find Programs</span>
            </Link>
            <Link to="/programs" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600">
              <BookOpen className="w-4 h-4" />
              <span>All Programs & Schools</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
