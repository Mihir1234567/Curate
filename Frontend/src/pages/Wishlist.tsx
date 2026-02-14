import React, { useState, useEffect } from "react";
import { useWishlist } from "../lib/WishlistContext";
import { api } from "../lib/api";
import { Product } from "../types";
import ProductGrid from "../components/product/ProductGrid";
import { Link } from "react-router-dom";

const Wishlist: React.FC = () => {
  const { wishlist } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWishlist = async () => {
      // In a real app we'd search specifically for IDs, but for mock we filter client side
      const allProducts = await api.getProducts();
      const wishlistedProducts = allProducts.filter((p) =>
        wishlist.includes(p.id),
      );
      setProducts(wishlistedProducts);
      setLoading(false);
    };
    loadWishlist();
  }, [wishlist]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 min-h-[60vh]">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-neutral-dark font-serif mb-4">
          Your Wishlist
        </h1>
        <p className="text-gray-500">
          {wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved for
          later
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : products.length > 0 ? (
        <ProductGrid products={products} columns={4} />
      ) : (
        <div className="text-center py-20">
          <span className="material-icons-outlined text-6xl text-gray-200 mb-6">
            favorite_border
          </span>
          <h3 className="text-xl font-bold text-gray-700 mb-2">
            Your wishlist is empty
          </h3>
          <p className="text-gray-500 mb-8">
            Start saving your favorite items.
          </p>
          <Link
            to="/products"
            className="px-6 py-3 bg-primary text-neutral-dark font-bold rounded-lg hover:bg-neutral-dark hover:text-white transition-colors"
          >
            Browse Products
          </Link>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
