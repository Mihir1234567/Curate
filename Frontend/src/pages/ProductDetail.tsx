import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../lib/api";
import { logError } from "../lib/logger";
import { Product } from "../types";
import ImageGallery from "../components/product/ImageGallery";
import { useWishlist } from "../lib/WishlistContext";
import { StarRating } from "../components/ui/StarRating";

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { isInWishlist, toggleWishlist } = useWishlist();

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const p = await api.getProductBySlug(id);
        if (p) {
          setProduct(p);
        } else {
          setError(true);
        }
      } catch (err) {
        logError("Failed to load product", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
          <span className="material-icons-outlined text-2xl">
            error_outline
          </span>
        </div>
        <h1 className="text-2xl font-bold text-neutral-dark mb-2">
          Product Not Found
        </h1>
        <p className="text-gray-500 mb-6">
          The product you are looking for doesn't exist or has been removed.
        </p>
        <Link
          to="/products"
          className="px-6 py-2 bg-primary text-neutral-dark font-bold rounded-lg hover:bg-neutral-dark hover:text-white transition-colors"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product.id);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500 mb-8">
        <Link to="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <span className="material-icons-outlined text-[10px]">
          chevron_right
        </span>
        <Link to="/products" className="hover:text-primary transition-colors">
          Products
        </Link>
        <span className="material-icons-outlined text-[10px]">
          chevron_right
        </span>
        <span className="text-primary font-bold">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Gallery */}
        <div className="lg:col-span-7">
          <ImageGallery images={[product.image]} alt={product.name} />
        </div>

        {/* Info */}
        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-tighter mb-4">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
            Verified Pick
          </div>

          <h1 className="text-4xl font-bold text-neutral-dark mb-2 font-serif leading-tight">
            {product.name}
          </h1>
          <p className="text-2xl text-gray-500 font-light mb-4">
            ${product.price.toFixed(2)}
          </p>

          <StarRating
            rating={product.rating}
            reviews={product.reviews}
            className="mb-8"
            starSize="text-lg"
          />

          <div className="space-y-6 mb-8">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-3 text-gray-400">
                Description
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-3 text-gray-400">
                Key Features
              </h3>
              <ul className="space-y-3">
                {product.features.map((feature, idx) => (
                  <li key={idx} className="flex gap-3 items-center">
                    <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      <span className="material-icons-outlined text-[10px] font-bold">
                        check
                      </span>
                    </span>
                    <span className="text-sm font-medium text-neutral-dark">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {product.stylingTip && (
            <div className="p-4 bg-background-light rounded-xl border border-primary/10 mb-8">
              <h4 className="font-bold text-sm mb-2 flex items-center gap-2 text-neutral-dark">
                <span className="material-icons-outlined text-primary text-base">
                  lightbulb
                </span>
                Styling Tip
              </h4>
              <p className="text-xs text-gray-500 italic">
                "{product.stylingTip}"
              </p>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex gap-4">
              <a
                href={product.affiliateLink || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-4 bg-primary text-neutral-dark font-bold rounded-xl hover:bg-neutral-dark hover:text-white transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
              >
                <span className="material-icons-outlined">shopping_bag</span>
                Buy on Amazon
              </a>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`w-16 py-4 rounded-xl border-2 flex items-center justify-center transition-all ${isWishlisted ? "border-red-500 bg-red-50 text-red-500" : "border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-400"}`}
              >
                <span className="material-icons-outlined">
                  {isWishlisted ? "favorite" : "favorite_border"}
                </span>
              </button>
            </div>
            <p className="text-[10px] text-center text-gray-400">
              *We may earn a commission from qualifying purchases.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
