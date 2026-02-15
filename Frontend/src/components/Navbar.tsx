import {
  Link,
  useLocation,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import { useWishlist } from "../lib/WishlistContext";
import React, { useState, useEffect } from "react";
import logo from "../assets/logos/Logo1.png";
import { api } from "../lib/api";
import { Category } from "../types";
import { logError } from "../lib/logger";

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentCategory = searchParams.get("category");
  const { wishlist } = useWishlist();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await api.getCategories();
        // Filter out categories with 0 products, sort by count, take top 3
        const topCategories = (data || [])
          .filter((cat) => cat.productCount > 0)
          .sort((a, b) => b.productCount - a.productCount)
          .slice(0, 3);
        setCategories(topCategories);
      } catch (err) {
        logError("Failed to fetch navbar categories", err);
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

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
              src={logo}
              alt="Curate."
              className="h-8 transition-transform group-hover:scale-105"
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-500">
            {!loading &&
              categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/products?category=${encodeURIComponent(cat.name)}`}
                  className={`hover:text-primary transition-colors ${isActiveCategory(cat.name) ? "text-primary font-bold" : ""}`}
                >
                  {cat.name}
                </Link>
              ))}
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
