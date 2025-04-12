import React from "react";
import { Link } from "react-router-dom";
import {
  FiFacebook,
  FiTwitter,
  FiInstagram,
  FiLinkedin,
  FiMail,
  FiMapPin,
  FiPhone,
  FiArrowRight,
  FiHeart,
  FiCheck,
  FiGlobe,
} from "react-icons/fi";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-6 py-16">
        {/* Top section with Newsletter */}
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 mb-16 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white rounded-full"></div>
            <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-white rounded-full"></div>
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="md:w-1/2">
              <h3 className="text-2xl font-bold mb-2">Stay Updated</h3>
              <p className="text-white/80 mb-0">
                Get the latest volunteer opportunities and community updates.
              </p>
            </div>
            <div className="md:w-1/2 w-full">
              <form className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-grow pl-4 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/30 text-white placeholder-white/60"
                  required
                />
                <button
                  type="submit"
                  className="whitespace-nowrap bg-white text-indigo-700 rounded-xl px-5 py-3 font-medium hover:bg-indigo-50 transition-colors"
                >
                  Subscribe
                  <FiArrowRight className="ml-2 inline" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          {/* Column 1 - About */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-indigo-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">
                NeighborNet
              </span>
            </Link>
            <p className="text-gray-300 leading-relaxed">
              Connecting passionate volunteers with meaningful opportunities to
              make a difference in their communities.
            </p>
            <div className="flex space-x-4 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <FiFacebook size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <FiTwitter size={20} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <FiInstagram size={20} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <FiLinkedin size={20} />
              </a>
            </div>
          </div>

          {/* Column 2 - Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-5 pb-2 border-b border-gray-700">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/about"
                  className="text-gray-300 hover:text-white flex items-center group"
                >
                  <FiArrowRight className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity" size={14} />
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/events"
                  className="text-gray-300 hover:text-white flex items-center group"
                >
                  <FiArrowRight className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity" size={14} />
                  Find Events
                </Link>
              </li>
              <li>
                <Link
                  to="/calendar"
                  className="text-gray-300 hover:text-white flex items-center group"
                >
                  <FiArrowRight className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity" size={14} />
                  Calendar
                </Link>
              </li>
              <li>
                <Link
                  to="/resources"
                  className="text-gray-300 hover:text-white flex items-center group"
                >
                  <FiArrowRight className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity" size={14} />
                  Resources
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-gray-300 hover:text-white flex items-center group"
                >
                  <FiArrowRight className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity" size={14} />
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 - Features */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-5 pb-2 border-b border-gray-700">
              Features
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2">
                <FiCheck className="text-green-400 mt-1 flex-shrink-0" />
                <span className="text-gray-300">Volunteer tracking</span>
              </li>
              <li className="flex items-start space-x-2">
                <FiCheck className="text-green-400 mt-1 flex-shrink-0" />
                <span className="text-gray-300">Event management</span>
              </li>
              <li className="flex items-start space-x-2">
                <FiCheck className="text-green-400 mt-1 flex-shrink-0" />
                <span className="text-gray-300">Impact reporting</span>
              </li>
              <li className="flex items-start space-x-2">
                <FiCheck className="text-green-400 mt-1 flex-shrink-0" />
                <span className="text-gray-300">Skill matching</span>
              </li>
              <li className="flex items-start space-x-2">
                <FiCheck className="text-green-400 mt-1 flex-shrink-0" />
                <span className="text-gray-300">Community networking</span>
              </li>
            </ul>
          </div>

          {/* Column 4 - Contact Us */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-5 pb-2 border-b border-gray-700">
              Contact Us
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <FiMapPin className="text-indigo-400 mt-1 flex-shrink-0" />
                <span className="text-gray-300">
                  123 Volunteer Street, Community City, State 12345
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <FiPhone className="text-indigo-400 flex-shrink-0" />
                <span className="text-gray-300">(123) 456-7890</span>
              </li>
              <li className="flex items-center space-x-3">
                <FiMail className="text-indigo-400 flex-shrink-0" />
                <a
                  href="mailto:info@neighbornet.org"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  info@neighbornet.org
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <FiGlobe className="text-indigo-400 flex-shrink-0" />
                <a
                  href="https://neighbornet.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  www.neighbornet.org
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            &copy; {year} NeighborNet. All rights reserved.
          </p>
          <div className="flex items-center flex-wrap justify-center gap-6 mt-4 md:mt-0">
            <Link
              to="/privacy-policy"
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms-of-service"
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              to="/accessibility"
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Accessibility
            </Link>
            <div className="flex items-center text-gray-400 text-sm">
              <span>Made with</span>
              <FiHeart className="mx-1 text-red-400" />
              <span>for volunteers</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
