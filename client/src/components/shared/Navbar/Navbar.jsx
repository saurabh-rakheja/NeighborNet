import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiMenu,
  FiX,
  FiUser,
  FiSettings,
  FiLogOut,
  FiChevronDown,
  FiBell,
  FiHome,
  FiCalendar,
  FiGrid,
} from "react-icons/fi";
import useAuthStore from "../../../store/authStore";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const navbarRef = useRef(null);
  const dropdownRef = useRef(null);

  // Get auth state from store
  const { isAuthenticated, user, logout } = useAuthStore();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileDropdownOpen]);

  // Export navbar height for other components to use
  useEffect(() => {
    if (navbarRef.current) {
      document.documentElement.style.setProperty(
        "--navbar-height",
        `${navbarRef.current.offsetHeight}px`
      );
    }
  }, [isScrolled, mobileMenuOpen]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Events", path: "/events" },
    { name: "Calendar", path: "/calendar" },
    { name: "Resources", path: "/resources" },
  ];

  const isActive = (path) => location.pathname === path;

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const toggleProfileDropdown = (e) => {
    e.stopPropagation();
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header
      ref={navbarRef}
      className={`w-full transition-all duration-300 ${
        isScrolled || mobileMenuOpen
          ? "bg-white shadow-md py-3"
          : "bg-white/95 backdrop-blur-lg py-4"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
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
          <span className="text-xl font-bold text-gray-800">NeighborNet</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(link.path)
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Auth Buttons / User Profile (Desktop) */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <div className="relative flex flex-end" ref={dropdownRef}>
              {/* Notification button */}
              <button className="p-2 mr-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
                <FiBell size={18} />
              </button>

              {/* Profile dropdown button */}
              <button
                onClick={toggleProfileDropdown}
                className="flex items-center space-x-2 bg-white/80 hover:bg-gray-100 py-2 px-3 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center border border-indigo-200">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-medium">
                      {user?.name?.substring(0, 2) || "VH"}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user?.name || "User"}
                </span>
                <FiChevronDown className="text-gray-500" size={16} />
              </button>

              {/* Profile dropdown menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-12 w-48 bg-white rounded-xl shadow-lg py-2 border border-gray-100 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email || "user@example.com"}
                    </p>
                  </div>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center"
                  >
                    <FiUser size={16} className="mr-2" />
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center"
                  >
                    <FiSettings size={16} className="mr-2" />
                    Settings
                  </Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                    onClick={handleLogout}
                  >
                    <FiLogOut size={16} className="mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/auth/login"
                className="text-gray-700 hover:text-indigo-600 px-4 py-2 text-sm font-medium"
              >
                Log in
              </Link>
              <Link
                to="/auth/signup"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden bg-gray-100 p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition-colors"
        >
          {mobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg animate-fadeIn">
          <nav className="px-4 pt-2 pb-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-4 py-3 rounded-lg text-sm font-medium mb-1 ${
                  isActive(link.path)
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {link.name}
              </Link>
            ))}

            {isAuthenticated ? (
              <div className="mt-4 border-t border-gray-200 pt-4">
                <div className="px-4 py-2 flex items-center">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center border border-indigo-200 mr-3">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium">
                        {user?.name?.substring(0, 2) || "VH"}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.email || "user@example.com"}
                    </p>
                  </div>
                </div>

                <Link
                  to="/profile"
                  className="block px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 rounded-lg mt-2 flex items-center"
                >
                  <FiUser size={16} className="mr-2" />
                  Profile
                </Link>
                <Link
                  to="/settings"
                  className="block px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 rounded-lg mt-1 flex items-center"
                >
                  <FiSettings size={16} className="mr-2" />
                  Settings
                </Link>
                <button
                  className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg mt-1 flex items-center"
                  onClick={handleLogout}
                >
                  <FiLogOut size={16} className="mr-2" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="mt-4 border-t border-gray-200 pt-4 flex flex-col gap-2 px-4">
                <Link
                  to="/auth/login"
                  className="w-full text-center py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium"
                >
                  Log in
                </Link>
                <Link
                  to="/auth/signup"
                  className="w-full text-center py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
                >
                  Sign up
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
