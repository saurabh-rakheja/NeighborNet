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
  FiBell,
  FiBarChart,
  FiMapPin,
  FiUsers,
  FiHeart,
  FiPlusCircle,
  FiBook,
  FiAward,
  FiMessageSquare,
  FiClipboard,
  FiLayers,
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
    // Exact match for dashboard home
    if (path === "/dashboard" && location.pathname === "/dashboard") {
      return true;
    }

    // For other paths, check if current path starts with the nav item path
    // But make sure we're not matching partial path segments
    if (path !== "/dashboard") {
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

  const toggleSubmenu = (index) => {
    setActiveSubmenu(activeSubmenu === index ? null : index);
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  // User capabilities based navigation
  const isAdmin = user?.role === "admin" || user?.isAdmin;
  const hasNGOCapabilities = user?.role === "ngo";
  const hasVolunteerCapabilities = user?.role === "volunteer";

  // Common navigation items for all users
  const generalNav = [
    {
      name: "Dashboard",
      icon: <FiHome />,
      path: "/dashboard",
    },
    {
      name: "Events",
      icon: <FiCalendar />,
      path: "/dashboard/events",
    },
    {
      name: "My Shifts",
      icon: <FiClock />,
      path: "/dashboard/my-shifts",
      badge: notifications > 0 ? notifications : null,
    },
  ];

  // NGO specific navigation items
  const ngoNav = hasNGOCapabilities
    ? [
        {
          name: "Create Project",
          icon: <FiPlusCircle />,
          path: "/dashboard/create-event",
        },
        {
          name: "Manage Volunteers",
          icon: <FiUsers />,
          path: "/dashboard/manage-volunteers",
        },
        {
          name: "Applications",
          icon: <FiClipboard />,
          path: "/dashboard/applications",
        },
        {
          name: "Analytics",
          icon: <FiBarChart />,
          path: "/dashboard/analytics",
        },
        {
          name: "Messages",
          icon: <FiMessageSquare />,
          path: "/dashboard/messages",
        },
      ]
    : [];

  // Volunteer specific navigation items
  const volunteerNav = hasVolunteerCapabilities
    ? [
        {
          name: "My Profile",
          icon: <FiUser />,
          path: "/dashboard/volunteer-profile",
        },
        {
          name: "My Impact",
          icon: <FiHeart />,
          path: "/dashboard/impact",
        },
        {
          name: "Skills",
          icon: <FiBook />,
          path: "/dashboard/skills",
        },
        {
          name: "Certificates",
          icon: <FiAward />,
          path: "/dashboard/certificates",
        },
        {
          name: "Training",
          icon: <FiLayers />,
          path: "/dashboard/training",
        },
      ]
    : [];

  const adminNav = isAdmin
    ? [
        {
          name: "Admin Panel",
          icon: <FiUsers />,
          path: "/dashboard/admin",
        },
        {
          name: "Manage Volunteers",
          icon: <FiUsers />,
          path: "/dashboard/admin/volunteers",
        },
        {
          name: "Reports",
          icon: <FiBarChart />,
          path: "/dashboard/admin/reports",
        },
      ]
    : [];

  const supportNav = [
    {
      name: "Help Center",
      icon: <FiHelpCircle />,
      path: "/dashboard/help",
    },
    {
      name: "Settings",
      icon: <FiSettings />,
      path: "/dashboard/settings",
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
      <div className="mb-6">
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
                    ? hasNGOCapabilities
                      ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium"
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium"
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
        <Link to="/dashboard" className="flex items-center">
          <div
            className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-lg ${
              hasNGOCapabilities
                ? "bg-gradient-to-br from-blue-600 to-cyan-500"
                : "bg-gradient-to-br from-indigo-600 to-purple-600"
            }`}
          >
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
                NeighborNet
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

      {/* User profile summary */}
      {!collapsed && (
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-indigo-100"
                />
              ) : (
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-medium border-2 ${
                    hasNGOCapabilities
                      ? "bg-gradient-to-br from-blue-100 to-cyan-100 text-blue-600 border-blue-100"
                      : "bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 border-indigo-100"
                  }`}
                >
                  {user?.name?.substring(0, 2) || "U"}
                </div>
              )}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-gray-800 truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {hasNGOCapabilities && hasVolunteerCapabilities
                  ? "Organization & Volunteer"
                  : hasNGOCapabilities
                  ? "Organization"
                  : "Volunteer"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation menu */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        {renderNavSection("General", generalNav)}

        {/* Show Organization section if user has NGO capabilities */}
        {hasNGOCapabilities && renderNavSection("Organization", ngoNav)}

        {/* Show Volunteering section if user has volunteer capabilities */}
        {hasVolunteerCapabilities &&
          renderNavSection("My Volunteering", volunteerNav)}

        {isAdmin && renderNavSection("Administration", adminNav)}

        {renderNavSection("Support", supportNav)}
      </div>

      {/* Logout button */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <FiLogOut className="text-lg" />
          {!collapsed && <span className="ml-3 text-sm">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
