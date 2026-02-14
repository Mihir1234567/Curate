import React from "react";
import { Link } from "react-router-dom";
import { Product } from "../types";
import { useWishlist } from "../lib/WishlistContext";
import { StarRating } from "./ui/StarRating";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWishlist(product.id);
  };

  return (
    <Link to={`/product/${product.id}`} className="group block h-full">
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-gray-100 mb-4 shadow-sm group-hover:shadow-md transition-all">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <button
          onClick={handleWishlist}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-3 right-3 p-2 rounded-full shadow-sm transition-all ${isWishlisted ? "bg-red-50 text-red-500 opacity-100" : "bg-white/90 text-gray-700 opacity-0 group-hover:opacity-100"}`}
        >
          <span className="material-icons-outlined text-sm">
            {isWishlisted ? "favorite" : "favorite_border"}
          </span>
        </button>

        {!product.inStock && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-gray-900/80 text-white text-[10px] font-bold uppercase rounded">
            Out of Stock
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/50 to-transparent">
          <button
            className="w-full py-2 bg-white text-neutral-dark font-bold text-xs rounded shadow-lg"
            aria-label="Quick view product"
          >
            Quick View
          </button>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-sm text-neutral-dark mb-1 group-hover:text-primary transition-colors truncate">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">${product.price.toFixed(2)}</p>
          <StarRating rating={product.rating} reviews={product.reviews} />
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
