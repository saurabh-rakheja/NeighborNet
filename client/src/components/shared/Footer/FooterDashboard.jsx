import React from "react";
import { Link } from "react-router-dom";
import { FiGithub, FiHeart } from "react-icons/fi";

const FooterDashboard = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 py-3 px-6">
      <div className="container mx-auto">
        <div className="flex flex-wrap items-center justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
            <span>© {currentYear} NeighborNet</span>
          </div>
          
          <div className="flex items-center space-x-6">
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
            <div className="flex items-center text-gray-400">
              <span>Made with</span>
              <FiHeart className="mx-1 text-red-400" size={14} />
              <span>for volunteers</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterDashboard;
