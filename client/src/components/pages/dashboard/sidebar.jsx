import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiHome,
  FiCalendar,
  FiUsers,
  FiClock,
  FiBarChart2,
  FiMap,
  FiSettings,
  FiHelpCircle,
  FiChevronLeft,
  FiChevronRight,
  FiLogOut,
  FiUser,
} from "react-icons/fi";
import useAuthStore from "../../../store/authStore";

const Sidebar = ({ isMobile, onToggle }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const location = useLocation();
  const { user, logout } = useAuthStore();

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
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  const toggleSubmenu = (index) => {
    setActiveSubmenu(activeSubmenu === index ? null : index);
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const navigationItems = [
    {
      name: "Dashboard",
      icon: <FiHome />,
      path: "/dashboard",
    },
    {
      name: "Events",
      icon: <FiCalendar />,
      path: "/dashboard/events",
      submenu: [
        { name: "Upcoming", path: "/dashboard/events/upcoming" },
        { name: "Past Events", path: "/dashboard/events/past" },
        { name: "Create Event", path: "/dashboard/events/create" },
      ],
    },
    {
      name: "Volunteers",
      icon: <FiUsers />,
      path: "/dashboard/volunteers",
      submenu: [
        { name: "All Volunteers", path: "/dashboard/volunteers/all" },
        { name: "Teams", path: "/dashboard/volunteers/teams" },
      ],
    },
    {
      name: "Time Tracking",
      icon: <FiClock />,
      path: "/dashboard/hours",
    },
    {
      name: "Reports",
      icon: <FiBarChart2 />,
      path: "/dashboard/reports",
    },
    {
      name: "Locations",
      icon: <FiMap />,
      path: "/dashboard/locations",
    },
    {
      name: "Settings",
      icon: <FiSettings />,
      path: "/dashboard/settings",
      submenu: [
        { name: "Account", path: "/dashboard/settings/account" },
        { name: "Organization", path: "/dashboard/settings/organization" },
        { name: "Notifications", path: "/dashboard/settings/notifications" },
      ],
    },
    {
      name: "Help",
      icon: <FiHelpCircle />,
      path: "/dashboard/help",
    },
  ];

  return (
    <aside
      className={`bg-white border-r border-gray-200 h-full transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      } flex flex-col shadow-sm`}
    >
      {/* Logo and collapse toggle */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <Link to="/dashboard" className="flex items-center">
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
          {!collapsed && (
            <span className="ml-2 text-lg font-semibold text-gray-800">
              NeighborNet
            </span>
          )}
        </Link>
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-md hover:bg-gray-100 text-gray-500"
        >
          {collapsed ? (
            <FiChevronRight size={18} />
          ) : (
            <FiChevronLeft size={18} />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {navigationItems.map((item, idx) => (
            <li key={item.path}>
              {item.submenu ? (
                <div className="mb-1">
                  <button
                    onClick={() => toggleSubmenu(idx)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-gray-700 hover:bg-gray-100"
                    } ${collapsed ? "justify-center" : ""}`}
                  >
                    <div className="flex items-center">
                      <span className="text-lg">{item.icon}</span>
                      {!collapsed && (
                        <span className="ml-3 text-sm">{item.name}</span>
                      )}
                    </div>
                    {!collapsed && (
                      <span
                        className={`transform transition-transform duration-200 ${
                          activeSubmenu === idx ? "rotate-90" : ""
                        }`}
                      >
                        <FiChevronRight size={16} />
                      </span>
                    )}
                  </button>

                  {/* Submenu */}
                  {!collapsed && activeSubmenu === idx && (
                    <ul className="mt-1 pl-9 space-y-1">
                      {item.submenu.map((subItem) => (
                        <li key={subItem.path}>
                          <Link
                            to={subItem.path}
                            className={`block p-2 rounded-md text-sm transition-colors ${
                              isActive(subItem.path)
                                ? "bg-indigo-50 text-indigo-700 font-medium"
                                : "text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            {subItem.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Link
                  to={item.path}
                  className={`flex items-center p-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-700 hover:bg-gray-100"
                  } ${collapsed ? "justify-center" : ""}`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {!collapsed && (
                    <span className="ml-3 text-sm">{item.name}</span>
                  )}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer area with profile and logout */}
      <div className="border-t border-gray-100">
        {/* Profile button */}
        <Link
          to="/dashboard/profile"
          className={`flex items-center p-4 hover:bg-gray-50 w-full transition-colors ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center">
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
          {!collapsed && (
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-gray-800 truncate">
                {user?.name || "Volunteer User"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.role || "Volunteer"}
              </p>
            </div>
          )}
        </Link>

        {/* Logout button */}
        <button
          onClick={logout}
          className={`flex items-center p-4 text-gray-700 hover:bg-gray-50 hover:text-red-600 w-full transition-colors border-t border-gray-100 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <span className="text-lg">
            <FiLogOut />
          </span>
          {!collapsed && <span className="ml-3 text-sm">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
