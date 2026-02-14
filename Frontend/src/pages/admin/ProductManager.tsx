import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { logError } from "../../lib/logger";
import { Product } from "../../types";
import { useConfirm } from "../../context/ConfirmContext";
import { useToast } from "../../context/ToastContext";

const ProductManager: React.FC = () => {
  const { confirm } = useConfirm();
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtering & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selection
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await api.getProducts({});
        setProducts(data);
      } catch (err) {
        logError("Failed to load products", err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: "Delete Product",
      message:
        "Are you sure you want to delete this product? This action cannot be undone.",
      confirmLabel: "Delete",
      type: "danger",
    });

    if (confirmed) {
      try {
        await api.deleteProduct(id);
        setProducts(products.filter((p) => p.id !== id));
        showToast("Product deleted successfully", "success");
      } catch (err) {
        logError("Failed to delete product", err);
        showToast("Failed to delete product", "error");
      }
    }
  };

  const handleBulkDelete = async () => {
    const confirmed = await confirm({
      title: "Bulk Delete",
      message: `Are you sure you want to delete ${selectedProductIds.size} products?`,
      confirmLabel: "Delete All",
      type: "danger",
    });

    if (confirmed) {
      try {
        await api.bulkDeleteProducts(Array.from(selectedProductIds));
        const remaining = products.filter((p) => !selectedProductIds.has(p.id));
        setProducts(remaining);
        setSelectedProductIds(new Set());
        showToast(`${selectedProductIds.size} products deleted`, "success");
      } catch (err) {
        logError("Failed to bulk delete products", err);
        showToast("Failed to delete products", "error");
      }
    }
  };

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const ids = new Set(paginatedProducts.map((p) => p.id));
      setSelectedProductIds(ids);
    } else {
      setSelectedProductIds(new Set());
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedProductIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedProductIds(newSelected);
  };

  // Derived State
  const filteredProducts = products.filter((product) => {
    const productCategories = Array.isArray(product.category)
      ? product.category
      : [product.category];
    const categoryString = productCategories.join(" "); // checking both joined string
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categoryString.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" ||
      productCategories.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Get unique categories for filter dropdown
  const categories = [
    "All",
    ...Array.from(
      new Set(
        products.flatMap((p) =>
          Array.isArray(p.category) ? p.category : [p.category],
        ),
      ),
    ),
  ];

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-dark">
            Product Inventory
          </h1>
          <p className="text-sm text-gray-500">
            Manage and track your affiliate product catalog.
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="px-4 py-2 bg-primary text-neutral-dark font-bold text-sm rounded-lg hover:bg-neutral-dark hover:text-white transition-colors flex items-center gap-2"
        >
          <span className="material-icons-outlined text-sm">add</span> Add
          Product
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-200 flex gap-4">
          <div className="relative flex-1">
            <span className="material-icons-outlined absolute left-3 top-2.5 text-gray-400 text-lg">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 bg-white focus:outline-none focus:border-primary"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {selectedProductIds.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-50 text-red-500 border border-red-200 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors flex items-center gap-2"
            >
              <span className="material-icons-outlined text-sm">delete</span>
              Delete ({selectedProductIds.size})
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-bold tracking-wider">
                <th className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={
                      paginatedProducts.length > 0 &&
                      paginatedProducts.every((p) =>
                        selectedProductIds.has(p.id),
                      )
                    }
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <div className="flex justify-center items-center gap-2">
                      <span className="animate-spin material-icons-outlined text-lg">
                        sync
                      </span>
                      Loading products...
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => (
                  <tr
                    key={product.id}
                    className={`hover:bg-gray-50 transition-colors ${selectedProductIds.has(product.id) ? "bg-primary/5" : ""}`}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProductIds.has(product.id)}
                        onChange={() => toggleSelect(product.id)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-gray-100 overflow-hidden">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-neutral-dark truncate max-w-[200px]">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            SKU: {product.id.substring(0, 6).toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex flex-wrap gap-1">
                        {(Array.isArray(product.category)
                          ? product.category
                          : [product.category]
                        ).map((cat, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-neutral-dark">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={async () => {
                          try {
                            const newStatus = !product.inStock;
                            await api.updateProduct(product.id, {
                              inStock: newStatus,
                            });
                            setProducts(
                              products.map((p) =>
                                p.id === product.id
                                  ? { ...p, inStock: newStatus }
                                  : p,
                              ),
                            );
                            showToast(
                              `Product marked as ${newStatus ? "in stock" : "out of stock"}`,
                              "success",
                            );
                          } catch (e) {
                            logError("Failed to toggle stock", e);
                            showToast("Failed to update status", "error");
                          }
                        }}
                        className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full border ${product.inStock ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${product.inStock ? "bg-green-600" : "bg-red-500"}`}
                        ></span>
                        {product.inStock ? "Active" : "Out of Stock"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/products/edit/${product.id}`}
                          className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded transition-colors"
                        >
                          <span className="material-icons-outlined text-lg">
                            edit
                          </span>
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        >
                          <span className="material-icons-outlined text-lg">
                            delete
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Showing{" "}
            {paginatedProducts.length > 0
              ? (currentPage - 1) * itemsPerPage + 1
              : 0}{" "}
            to {Math.min(currentPage * itemsPerPage, filteredProducts.length)}{" "}
            of {filteredProducts.length} results
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-200 rounded text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 border border-gray-200 rounded text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductManager;
