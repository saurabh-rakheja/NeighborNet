import { Outlet } from "react-router-dom";
import Navbar from "../../shared/Navbar/Navbar";
import Footer from "../../shared/Footer/FooterDashboard";
import FooterDashboard from "../../shared/Footer/FooterDashboard";

function AuthLayout() {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden relative">
      {/* Fixed Navigation */}
      <Navbar />

      {/* Main Content - Scrollable */}
      <main className="flex-grow overflow-y-auto ">
        <Outlet />
      </main>

      <FooterDashboard />
    </div>
  );
}

export default AuthLayout;
