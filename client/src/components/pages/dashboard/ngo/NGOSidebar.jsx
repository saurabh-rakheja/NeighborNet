import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiHome,
  FiCalendar,
  FiUsers,
  FiBarChart,
  FiMessageSquare,
  FiPlusCircle,
  FiClipboard,
  FiMenu,
  FiX,
  FiLogOut,
  FiSettings,
  FiBell,
  FiHelpCircle,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import useAuthStore from "../../../../store/authStore";
import { ngoApi } from "../../../../services/ngoApi";

const NGOSidebar = ({ isMobile, onToggle }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [pendingApplicationsCount, setPendingApplicationsCount] = useState(0);
  const location = useLocation();
  const { user, logout } = useAuthStore();

  // Fetch pending applications count
  useEffect(() => {
    const fetchPendingApplicationsCount = async () => {
      try {
        const response = await ngoApi.getPendingApplicationsCount();

        if (response.success) {
          setPendingApplicationsCount(response.count || 0);
        }
      } catch (error) {
        console.error("Error fetching pending applications count:", error);
      }
    };

    fetchPendingApplicationsCount();

    // Set up periodic refresh every 5 minutes
    const intervalId = setInterval(
      fetchPendingApplicationsCount,
      5 * 60 * 1000
    );

    return () => clearInterval(intervalId);
  }, []);

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
    // Exact match for dashboard home
    if (path === "/ngo-dashboard" && location.pathname === "/ngo-dashboard") {
      return true;
    }

    // For other paths, check if current path starts with the nav item path
    // But make sure we're not matching partial path segments
    if (path !== "/ngo-dashboard") {
      // Ensure we match complete path segments by checking for path boundary
      return (
        location.pathname === path ||
        (location.pathname.startsWith(path) &&
          (location.pathname.charAt(path.length) === "/" ||
            location.pathname.length === path.length))
      );
    }

    return false;
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  // Navigation items for NGO dashboard
  const navItems = [
    {
      name: "Overview",
      icon: <FiHome className="h-5 w-5" />,
      path: "/ngo-dashboard",
    },
    {
      name: "Events",
      icon: <FiCalendar className="h-5 w-5" />,
      path: "/ngo-dashboard/events",
    },
    {
      name: "Volunteers",
      icon: <FiUsers className="h-5 w-5" />,
      path: "/ngo-dashboard/volunteers",
    },
    {
      name: "Analytics",
      icon: <FiBarChart className="h-5 w-5" />,
      path: "/ngo-dashboard/analytics",
    },
    {
      name: "Create Event",
      icon: <FiPlusCircle className="h-5 w-5" />,
      path: "/ngo-dashboard/create-event",
    },
    {
      name: "Applications",
      icon: <FiClipboard className="h-5 w-5" />,
      path: "/ngo-dashboard/applications",
      badge: pendingApplicationsCount > 0 ? pendingApplicationsCount : null,
      badgeColor: "bg-amber-500 text-white",
    },
    {
      name: "Messages",
      icon: <FiMessageSquare className="h-5 w-5" />,
      path: "/ngo-dashboard/messages",
    },
  ];

  // Support navigation items
  const supportNav = [
    {
      name: "Help Center",
      icon: <FiHelpCircle className="h-5 w-5" />,
      path: "/ngo-dashboard/help",
    },
    {
      name: "Settings",
      icon: <FiSettings className="h-5 w-5" />,
      path: "/ngo-dashboard/settings",
    },
  ];

  // Handle logout
  const handleLogout = () => {
    logout();
    window.location.href = "/auth/login";
  };

  // Render a nav section with title
  const renderNavSection = (title, items) => {
    if (items.length === 0) return null;

    return (
      <div className="mb-6 px-2">
        {!collapsed && title && (
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">
            {title}
          </h3>
        )}
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive(item.path)
                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                } ${collapsed ? "justify-center" : ""}`}
              >
                <span
                  className={`text-lg relative ${
                    isActive(item.path) ? "text-white" : ""
                  }`}
                >
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
                  <span className="ml-3 text-sm">{item.name}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <aside
      className={`bg-white border-r border-gray-100 h-full transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      } flex flex-col shadow-md z-10`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-5 border-b border-gray-100">
        <Link to="/ngo-dashboard" className="flex items-center">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-blue-600 to-cyan-500">
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
          {!collapsed && (
            <div className="ml-3">
              <span className="text-lg font-bold text-gray-800">
                NGO Portal
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={toggleSidebar}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors duration-200"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <FiChevronRight size={18} />
          ) : (
            <FiChevronLeft size={18} />
          )}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto pt-5 pb-4">
        {renderNavSection(collapsed ? "" : "Main Navigation", navItems)}
        {renderNavSection(collapsed ? "" : "Support", supportNav)}
      </div>

      {/* User Profile & Logout */}
      <div className="border-t border-gray-100 p-4">
        {!collapsed ? (
          <div className="flex items-center mb-4">
            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
              {user?.name?.charAt(0) || "N"}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-800">
                {user?.name || "NGO User"}
              </p>
              <p className="text-xs text-gray-500">
                {user?.ngoInfo?.organization || "Organization"}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center mb-4">
            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
              {user?.name?.charAt(0) || "N"}
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`w-full rounded-xl py-2 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-red-500 transition-colors ${
            !collapsed ? "px-3" : "px-0"
          }`}
        >
          <FiLogOut size={collapsed ? 20 : 18} />
          {!collapsed && <span className="ml-2 text-sm">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default NGOSidebar;
