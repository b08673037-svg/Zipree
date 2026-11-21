import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTopOnRouteChange() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Disable smooth scrolling temporarily so the reset is instant
    const html = document.documentElement;
    const originalScrollBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    
    window.scrollTo(0, 0);
    
    // Restore smooth scrolling after the scroll has happened
    requestAnimationFrame(() => {
      html.style.scrollBehavior = originalScrollBehavior;
    });
  }, [pathname]);

  return null;
}