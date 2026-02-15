import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import ProductGrid from "../components/product/ProductGrid";
import PriceRangeSlider from "../components/ui/PriceRangeSlider";
import { api } from "../lib/api";
import { logError } from "../lib/logger";
import { Product, Category } from "../types";

// Helper function to extract numeric value from price (if it were a string, complying with request)
function extractPrice(price: string | number): number {
  if (typeof price === "number") return price;
  return Number(price.replace(/[^\d.]/g, ""));
}

const ProductListing: React.FC = () => {
  const { category: paramCategory } = useParams<{ category: string }>();
  const [searchParams] = useSearchParams();
  const queryCategory = searchParams.get("category");
  const searchQuery = searchParams.get("search");

  const initialCategory = queryCategory || paramCategory || "All";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<string>(initialCategory);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(2000);

  // Update selected category if URL param or query param changes
  useEffect(() => {
    const newCategory = queryCategory || paramCategory;
    if (newCategory) {
      setSelectedCategory(newCategory);
    } else if (!searchQuery) {
      setSelectedCategory("All");
    }
  }, [queryCategory, paramCategory, searchQuery]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [p, c] = await Promise.all([
          api.getProducts({}),
          api.getCategories(),
        ]);
        setProducts(p);
        setCategories(c);
      } catch (err) {
        logError("Failed to load data", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    console.log("ProductListing State:", {
      selectedCategory,
      productsCount: products.length,
      categoriesCount: categories.length,
    });
  }, [selectedCategory, products, categories]);

  const [sortBy, setSortBy] = useState<string>("newest"); // newest, price-low, price-high

  const filteredProducts = products
    .filter((p) => {
      const categoryObj = categories.find(
        (c) => c.name.toLowerCase() === selectedCategory.toLowerCase(),
      );

      const catMatch =
        selectedCategory === "All" ||
        (p.category &&
          (Array.isArray(p.category)
            ? p.category.some(
                (c) => c.toLowerCase() === selectedCategory.toLowerCase(),
              )
            : p.category.toLowerCase() === selectedCategory.toLowerCase())) ||
        (categoryObj?.allProductIds &&
          categoryObj.allProductIds.includes(p.id));

      if (!catMatch && selectedCategory !== "All") {
        console.log(`Cat mismatch for product "${p.name}":`, {
          productCats: p.category,
          selected: selectedCategory,
          inLinkedIds: categoryObj?.allProductIds?.includes(p.id),
        });
      }

      const priceMatch = p.price >= minPrice && p.price <= maxPrice;
      const searchMatch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());

      return !!(catMatch && priceMatch && searchMatch);
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return extractPrice(a.price) - extractPrice(b.price);
        case "price-high":
          return extractPrice(b.price) - extractPrice(a.price);
        case "newest":
        default:
          // Mock data lacks createdAt; preserves original array order
          return 0;
      }
    });

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
          Failed to load products
        </h2>
        <p className="text-gray-500 mb-6">
          Please check your connection and try again.
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
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <nav className="text-xs text-gray-500 mb-4 flex gap-2 items-center uppercase tracking-widest">
          <span>Home</span>
          <span className="material-icons-outlined text-[10px]">
            chevron_right
          </span>
          <span className="text-primary font-bold">Shop</span>
        </nav>
        <h1 className="text-4xl font-bold text-neutral-dark font-serif">
          All Products
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
          <div>
            <h3 className="font-bold text-neutral-dark mb-4 uppercase text-xs tracking-widest">
              Categories
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <button
                  onClick={() => setSelectedCategory("All")}
                  className={`flex items-center justify-between w-full hover:text-primary ${selectedCategory === "All" ? "text-primary font-bold" : ""}`}
                >
                  All Items
                  <span className="bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full text-xs">
                    {products.length}
                  </span>
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`flex items-center justify-between w-full hover:text-primary ${selectedCategory === cat.name ? "text-primary font-bold" : ""}`}
                  >
                    {cat.name}
                    <span className="bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full text-xs">
                      {cat.productCount}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-gray-100 pt-8">
            <h3 className="font-bold text-neutral-dark mb-4 uppercase text-xs tracking-widest">
              Price Range
            </h3>

            {/* Manual Inputs */}
            <div className="flex gap-4 mb-6">
              <div className="flex-grow">
                <label className="text-[10px] text-gray-400 block mb-1 uppercase tracking-tighter">
                  Min
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                    $
                  </span>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) =>
                      setMinPrice(Math.min(maxPrice, Number(e.target.value)))
                    }
                    className="w-full pl-6 pr-2 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex-grow">
                <label className="text-[10px] text-gray-400 block mb-1 uppercase tracking-tighter">
                  Max
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                    $
                  </span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) =>
                      setMaxPrice(Math.max(minPrice, Number(e.target.value)))
                    }
                    className="w-full pl-6 pr-2 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="2000"
                  />
                </div>
              </div>
            </div>

            {/* Custom Visual Slider */}
            <div className="mb-10">
              <PriceRangeSlider
                min={0}
                max={2000}
                minVal={minPrice}
                maxVal={maxPrice}
                onChange={({ min, max }) => {
                  setMinPrice(min);
                  setMaxPrice(max);
                }}
              />
            </div>
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1">
          {/* Controls */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
            <p className="text-sm text-gray-500">
              Showing {filteredProducts.length} results
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm font-bold bg-transparent border-none outline-none cursor-pointer"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            <ProductGrid products={filteredProducts} columns={3} />
          ) : (
            <div className="py-20 text-center">
              <span className="material-icons-outlined text-6xl text-gray-200 mb-4">
                search_off
              </span>
              <h3 className="text-xl font-bold text-gray-400">
                No products found
              </h3>
              <p className="text-gray-400">Try adjusting your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductListing;
