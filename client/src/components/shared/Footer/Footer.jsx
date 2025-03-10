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
} from "react-icons/fi";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Column 1 - About */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-200">
                <svg
                  className="w-6 h-6 text-white"
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
              <span className="text-xl font-bold text-gray-800">
                NeighborNet{" "}
              </span>
            </Link>
            <p className="text-gray-600 text-sm leading-relaxed">
              We connect passionate volunteers with meaningful opportunities to
              make a difference in their communities.
            </p>
            <div className="flex space-x-4 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-indigo-600 transition-colors"
              >
                <FiFacebook size={20} />
                <span className="sr-only">Facebook</span>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-indigo-600 transition-colors"
              >
                <FiTwitter size={20} />
                <span className="sr-only">Twitter</span>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-indigo-600 transition-colors"
              >
                <FiInstagram size={20} />
                <span className="sr-only">Instagram</span>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-indigo-600 transition-colors"
              >
                <FiLinkedin size={20} />
                <span className="sr-only">LinkedIn</span>
              </a>
            </div>
          </div>

          {/* Column 2 - Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="text-gray-600 hover:text-indigo-600 text-sm hover:underline transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/events"
                  className="text-gray-600 hover:text-indigo-600 text-sm hover:underline transition-colors"
                >
                  Find Events
                </Link>
              </li>
              <li>
                <Link
                  to="/calendar"
                  className="text-gray-600 hover:text-indigo-600 text-sm hover:underline transition-colors"
                >
                  Calendar
                </Link>
              </li>
              <li>
                <Link
                  to="/resources"
                  className="text-gray-600 hover:text-indigo-600 text-sm hover:underline transition-colors"
                >
                  Resources
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-gray-600 hover:text-indigo-600 text-sm hover:underline transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-600 hover:text-indigo-600 text-sm hover:underline transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 - Contact Us */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <FiMapPin className="text-indigo-600 mt-0.5" />
                <span className="text-gray-600 text-sm">
                  123 Volunteer Street, Community City, State 12345
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <FiPhone className="text-indigo-600" />
                <span className="text-gray-600 text-sm">(123) 456-7890</span>
              </li>
              <li className="flex items-center space-x-3">
                <FiMail className="text-indigo-600" />
                <a
                  href="mailto:info@NeighborNet.org"
                  className="text-gray-600 text-sm hover:text-indigo-600 hover:underline transition-colors"
                >
                  info@NeighborNet.org
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4 - Newsletter */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Stay Updated
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Subscribe to our newsletter for the latest volunteer opportunities
              and community updates.
            </p>
            <form className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full pl-4 pr-12 py-3 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  required
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 bottom-1.5 bg-indigo-600 text-white rounded-md px-2.5 flex items-center justify-center hover:bg-indigo-700 transition-colors"
                >
                  <FiArrowRight />
                  <span className="sr-only">Subscribe</span>
                </button>
              </div>
              <p className="text-xs text-gray-500">
                By subscribing, you agree to our{" "}
                <Link
                  to="/privacy-policy"
                  className="text-indigo-600 hover:underline"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            &copy; {year} NeighborNet. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <Link
              to="/privacy-policy"
              className="text-gray-500 hover:text-indigo-600 text-sm transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms-of-service"
              className="text-gray-500 hover:text-indigo-600 text-sm transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              to="/accessibility"
              className="text-gray-500 hover:text-indigo-600 text-sm transition-colors"
            >
              Accessibility
            </Link>
          </div>
          <div className="mt-4 md:mt-0 flex items-center text-gray-500 text-sm">
            <span>Made with</span>
            <FiHeart className="mx-1 text-red-500" />
            <span>for volunteers</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
