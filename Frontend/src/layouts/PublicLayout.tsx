import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

interface PublicLayoutProps {
  children: React.ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  React.useEffect(() => {
    // Clear admin session when browsing the public site
    // This ensures "always ask" when returning to admin
    import("../lib/auth").then((auth) => auth.removeToken());
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background-light">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
