import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProductGrid from "../components/product/ProductGrid";
import { api } from "../lib/api";
import { logError } from "../lib/logger";
import { Product, Category } from "../types";

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [p, c] = await Promise.all([
          api.getProducts(),
          api.getCategories(),
        ]);
        setFeaturedProducts(p.slice(0, 4)); // Show only first 4
        setCategories(c);
      } catch (err) {
        logError("Failed to load home data", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
        <span className="material-icons-outlined text-5xl text-red-400 mb-4">
          error_outline
        </span>
        <h2 className="text-xl font-bold text-neutral-dark mb-2">
          Something went wrong
        </h2>
        <p className="text-gray-500 mb-6">
          We couldn't load the page. Please try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-primary text-neutral-dark font-bold rounded-lg hover:bg-neutral-dark hover:text-white transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="relative h-[600px] bg-neutral-dark overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=2000"
          alt="Modern Minimalist Interior"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-dark via-transparent to-transparent opacity-80" />

        <div className="relative max-w-7xl mx-auto px-6 h-full flex flex-col justify-center items-start">
          <span className="text-primary font-bold tracking-widest uppercase text-sm mb-4">
            Timeless Essentials Collection
          </span>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight max-w-2xl font-serif">
            Small Apartment <br />
            <span className="text-primary italic">Essentials</span>
          </h1>
          <p className="text-gray-300 text-lg mb-8 max-w-lg">
            Curated furniture and decor specifically designed to maximize your
            square footage without sacrificing your aesthetic.
          </p>
          <Link
            to="/products"
            className="px-8 py-4 bg-primary text-neutral-dark font-bold rounded-lg hover:bg-white transition-colors shadow-lg shadow-primary/20"
          >
            Explore Collection
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-neutral-dark mb-2 font-serif">
              Shop by Category
            </h2>
            <p className="text-gray-500">
              Find exactly what your small space needs.
            </p>
          </div>
          <Link
            to="/products"
            className="text-primary font-bold hover:underline hidden sm:block"
          >
            View All
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.name}`}
              className="group cursor-pointer"
            >
              <div className="aspect-square rounded-xl overflow-hidden mb-3 relative">
                <img
                  src={
                    cat.imageUrl ||
                    cat.image ||
                    "https://via.placeholder.com/400"
                  }
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              </div>
              <h3 className="font-bold text-center text-neutral-dark group-hover:text-primary transition-colors">
                {cat.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Grid */}
      <section className="bg-white py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-neutral-dark mb-4 font-serif">
              Curated Space Savers
            </h2>
            <p className="text-gray-500">
              Hand-picked items that blend functionality with aesthetic
              perfection. Ready to transform your cozy corner.
            </p>
          </div>

          <ProductGrid products={featuredProducts} columns={4} />

          <div className="text-center mt-12">
            <Link
              to="/products"
              className="inline-block px-8 py-3 border-2 border-neutral-dark text-neutral-dark font-bold rounded-lg hover:bg-neutral-dark hover:text-white transition-colors"
            >
              Load More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
