import { useLocation } from "react-router-dom";
import Navbar from "./components/layout/Navbar.jsx";
import Footer from "./components/layout/Footer.jsx";
import Newsletter from "./components/home/Newsletter/Newsletter.jsx";
import ScrollToTopOnRouteChange from "./components/ui/ScrollToTopOnRouteChange.jsx";
import ScrollToTop from "./components/ui/ScrollToTop.jsx";
import AppRoutes from "./routes.jsx";

export default function App() {
  const location = useLocation();
  
  // Check if the current URL starts with "/admin"
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      {/* Only show the Navbar if we are NOT on an admin route */}
      {!isAdminRoute && <Navbar />}

      <ScrollToTopOnRouteChange />
      
      <AppRoutes />
      
      {/* Only show the Newsletter and Footer if we are NOT on an admin route */}
      {!isAdminRoute && <Newsletter />}
      {!isAdminRoute && <Footer />}


      <ScrollToTop />
    </>
  );
}