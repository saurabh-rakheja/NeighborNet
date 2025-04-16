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
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar - fixed position */}
      <div className="fixed left-0 top-0 h-full z-30">
        <Sidebar isMobile={isMobile} onToggle={handleSidebarToggle} />
      </div>

      {/* Main Content Area */}
      <div
        className={`flex flex-col flex-1 transition-all duration-300 ${
          sidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        {/* Main Scrollable Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-8">
            {/* Page Content */}
            <Outlet />
          </div>
        </main>

        {/* Footer - sticky at bottom */}
        <FooterDashboard />
      </div>
    </div>
  );
}

export default DashboardLayout;
