import {
  Link,
  useLocation,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import { useWishlist } from "../lib/WishlistContext";
import React, { useState } from "react";

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentCategory = searchParams.get("category");
  const { wishlist } = useWishlist();

  const [searchTerm, setSearchTerm] = useState("");

  const isActive = (path: string) =>
    location.pathname === path && !currentCategory;
  const isActiveCategory = (category: string) =>
    location.pathname === "/products" && currentCategory === category;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center group">
            <img
              src="/src/assets/logos/Logo1.png"
              alt="Curate."
              className="h-8 transition-transform group-hover:scale-105"
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-500">
            <Link
              to="/products?category=Living%20Room"
              className={`hover:text-primary transition-colors ${isActiveCategory("Living Room") ? "text-primary font-bold" : ""}`}
            >
              Living Room
            </Link>
            <Link
              to="/products?category=Bedroom"
              className={`hover:text-primary transition-colors ${isActiveCategory("Bedroom") ? "text-primary font-bold" : ""}`}
            >
              Bedroom
            </Link>
            <Link
              to="/products?category=Lighting"
              className={`hover:text-primary transition-colors ${isActiveCategory("Lighting") ? "text-primary font-bold" : ""}`}
            >
              Lighting
            </Link>
            <Link
              to="/about"
              className={`hover:text-primary transition-colors ${isActive("/about") ? "text-primary font-bold" : ""}`}
            >
              About
            </Link>
          </div>
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="relative hidden sm:block">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary w-40 hover:w-60 transition-all"
            />
            <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
              search
            </span>
          </form>

          <Link
            to="/wishlist"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 relative"
          >
            <span className="material-icons-outlined">favorite_border</span>
            {wishlist.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
