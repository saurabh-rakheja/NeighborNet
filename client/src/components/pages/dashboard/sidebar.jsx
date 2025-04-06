import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiHome,
  FiCalendar,
  FiClock,
  FiUser,
  FiHelpCircle,
  FiSettings,
  FiChevronLeft,
  FiChevronRight,
  FiLogOut,
  FiBell
} from "react-icons/fi";
import useAuthStore from "../../../store/authStore";

const Sidebar = ({ isMobile, onToggle }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [notifications, setNotifications] = useState(3);

  // Collapse sidebar by default on mobile
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    }
  }, [isMobile]);

  // Notify parent component when collapse state changes
  useEffect(() => {
    if (onToggle) {
      onToggle(collapsed);
    }
  }, [collapsed, onToggle]);

  const isActive = (path) => {
    if (path === "/dashboard") {
      return true; // Always make Dashboard appear active
    }
    return location.pathname === path;
  };

  const toggleSubmenu = (index) => {
    setActiveSubmenu(activeSubmenu === index ? null : index);
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  // Simplified navigation items
  const navigationItems = [
    {
      name: "Dashboard",
      icon: <FiHome />,
      path: "/dashboard"
    },
    {
      name: "Events",
      icon: <FiCalendar />,
      path: "/dashboard/events"
    },
    {
      name: "My Shifts",
      icon: <FiClock />,
      path: "/dashboard/my-shifts",
      badge: notifications > 0 ? notifications : null
    },
    {
      name: "Profile",
      icon: <FiUser />,
      path: "/dashboard/volunteer-profile"
    },
    {
      name: "Help",
      icon: <FiHelpCircle />,
      path: "/dashboard/help"
    }
  ];

  // Handle logout
  const handleLogout = () => {
    logout();
    window.location.href = "/auth/login";
  };

  return (
    <aside
      className={`bg-white backdrop-blur-sm bg-opacity-90 border-r border-gray-100 h-full transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      } flex flex-col shadow-sm z-10`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-5 border-b border-gray-100">
        <Link to="/dashboard" className="flex items-center">
          <div className="h-9 w-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200/40">
            <svg
              className="w-5 h-5 text-white"
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
          {!collapsed && (
            <div className="ml-2.5">
              <span className="text-lg font-semibold text-gray-800 tracking-tight">
                VolunteerHub
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={toggleSidebar}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors duration-200"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <FiChevronRight size={18} className="transition-transform duration-200" />
          ) : (
            <FiChevronLeft size={18} className="transition-transform duration-200" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-5 px-3">
        <ul className="space-y-1.5">
          {navigationItems.map((item, idx) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center px-3.5 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive(item.path)
                    ? "bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 font-medium shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                } ${collapsed ? "justify-center" : ""}`}
              >
                <span className={`text-lg relative ${isActive(item.path) ? "text-indigo-600" : ""}`}>
                  {item.icon}
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 text-[10px] text-white font-bold items-center justify-center">
                        {item.badge}
                      </span>
                    </span>
                  )}
                </span>
                {!collapsed && (
                  <span className="ml-3 text-sm tracking-wide">
                    {item.name}
                  </span>
                )}
                {!collapsed && isActive(item.path) && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer with settings and logout */}
      <div className="border-t border-gray-100 mt-auto pt-2 pb-3 px-3">
        <div className="space-y-1">
          {/* Notifications */}
          <Link
            to="/dashboard/notifications"
            className={`flex items-center px-3.5 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <div className="text-lg relative">
              <FiBell />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 text-[10px] text-white font-bold items-center justify-center">
                    {notifications}
                  </span>
                </span>
              )}
            </div>
            {!collapsed && <span className="ml-3 text-sm tracking-wide">Notifications</span>}
          </Link>
          
          {/* Settings */}
          <Link
            to="/dashboard/settings"
            className={`flex items-center px-3.5 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <div className="text-lg">
              <FiSettings />
            </div>
            {!collapsed && <span className="ml-3 text-sm tracking-wide">Settings</span>}
          </Link>
          
          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`flex items-center px-3.5 py-2.5 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 w-full ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <div className="text-lg">
              <FiLogOut />
            </div>
            {!collapsed && <span className="ml-3 text-sm tracking-wide">Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
