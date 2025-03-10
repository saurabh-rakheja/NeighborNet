import React from "react";
import { Link } from "react-router-dom";

const FooterDashboard = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 py-2.5 px-4">
      <div className="container mx-auto">
        <div className="flex flex-wrap items-center justify-center text-xs text-gray-500">
          <div>© {currentYear} VolunteerHub</div>
          <div className="flex items-center space-x-4">
            <Link
              to="/help"
              className="hover:text-indigo-600 transition-colors"
            >
              Help
            </Link>
            <Link
              to="/terms"
              className="hover:text-indigo-600 transition-colors"
            >
              Terms
            </Link>
            <Link
              to="/privacy"
              className="hover:text-indigo-600 transition-colors"
            >
              Privacy
            </Link>
            <div className="flex items-center">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
              <span>System online</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterDashboard;
