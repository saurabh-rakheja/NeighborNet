import { Outlet } from "react-router-dom";
import Navbar from "./../../shared/Navbar/Navbar";
import Footer from "./../../shared/Footer/Footer";

function LandingLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Fixed Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <Navbar />
      </header>
      {/* Empty space to account for fixed navbar */}
      <div className="h-16 md:h-20"></div>{" "}
      {/* Adjust height based on your navbar height */}
      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>
      {/* Footer */}
      <Footer />
    </div>
  );
}

export default LandingLayout;
