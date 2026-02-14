import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Utility component that resets the window scroll position to top
 * whenever the route changes.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
