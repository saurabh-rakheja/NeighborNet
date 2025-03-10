import { Outlet } from "react-router-dom";
import Navbar from "../../shared/Navbar/Navbar";
import FooterDashboard from "../../shared/Footer/FooterDashboard";
import React, { useState, useEffect } from "react";
import Sidebar from "../dashboard/sidebar";

function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  // Check if mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Handle sidebar toggle
  const handleSidebarToggle = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Fixed Navigation */}
      {/* Main Content with Sidebar */}
      <div className="flex flex-1">
        {/* Fixed Sidebar - positioned below navbar */}
        <div className="fixed left-0 top-0 z-30 h-screen">
          <Sidebar isMobile={isMobile} onToggle={handleSidebarToggle} />
        </div>

        {/* Scrollable Content Area - margin adjusts with sidebar state */}
        <main
          className={`flex-1 transition-all duration-300 pt-4 pb-16 ${
            sidebarCollapsed ? "ml-20" : "ml-64"
          } md:p-6 p-4`}
        >
          <Outlet />
          <footer className="fixed bottom-0 right-0 w-full">
            <FooterDashboard />
          </footer>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
