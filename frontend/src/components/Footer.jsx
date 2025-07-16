import { GraduationCap, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top: 3-Column Layout */}
        <div className="flex flex-col md:flex-row justify-between items-start text-sm text-gray-400 gap-8">
          
          {/* Left - Branding */}
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-3">
              <GraduationCap className="w-6 h-6 text-blue-400" />
              <span className="text-xl font-bold text-white">UniFinder</span>
            </div>
            <p className="leading-relaxed">
              Helping students find their perfect educational path with personalized recommendations.
            </p>
          </div>

          {/* Center - Quick Links */}
          <div className="flex-1 text-center">
            <h4 className="text-base font-semibold mb-3 text-white">Quick Links</h4>
            <ul className="space-y-1">
              <li><a href="/" className="hover:text-white">Home</a></li>
              <li><a href="/finder" className="hover:text-white">Find Programs</a></li>
              <li><a href="/#how-it-works" className="hover:text-white">How it Works</a></li>
              <li><a href="/faq" className="hover:text-white">FAQ</a></li>
            </ul>
          </div>

          {/* Right - Contact Info */}
          <div className="flex-1 text-right">
            <h4 className="text-base font-semibold mb-3 text-white">Contact Info</h4>
            <ul className="space-y-2">
              <li className="flex justify-end items-center">
                <Mail className="w-4 h-4 mr-2 text-blue-400" />
                info@unifinder.com
              </li>
              <li className="flex justify-end items-center">
                <Phone className="w-4 h-4 mr-2 text-blue-400" />
                1-800-UNI-FIND
              </li>
              <li className="flex justify-end items-center">
                <MapPin className="w-4 h-4 mr-2 text-blue-400" />
                San Fernando, Pampanga
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom: Short Border & Copyright */}
        <div className="mt-6 flex flex-col items-center">
          <div className="w-32 border-t border-gray-800 mb-3"></div>
          <p className="text-xs text-gray-500 text-center">
            &copy; 2025 UniFinder. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
