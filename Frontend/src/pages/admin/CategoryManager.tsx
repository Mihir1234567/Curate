import React, { useState, useEffect } from "react";
import { api } from "../../lib/api";
import { logError } from "../../lib/logger";
import { Category } from "../../types";
import { useConfirm } from "../../context/ConfirmContext";
import { useToast } from "../../context/ToastContext";

const CategoryManager: React.FC = () => {
  const { confirm } = useConfirm();
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [searchProductQuery, setSearchProductQuery] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    imageSource: "upload" as "upload" | "product",
    imageUploadUrl: "",
    featuredProductId: "" as string | null,
    productIds: [] as string[],
  });

  const [adding, setAdding] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const [catData, prodData] = await Promise.all([
          api.getCategories(),
          api.getProducts({ limit: 1000 }), // Get all products for assignment
        ]);
        setCategories(catData);
        setProducts(prodData);
      } catch (err) {
        logError("Failed to load data", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  const handleSaveCategory = async () => {
    if (!formData.name.trim()) return;
    setAdding(true);
    try {
      const payload = {
        name: formData.name,
        imageUploadUrl:
          formData.imageSource === "upload"
            ? formData.imageUploadUrl
            : undefined,
        featuredProductId:
          formData.imageSource === "product"
            ? (formData.featuredProductId ?? undefined)
            : undefined,
        productIds: formData.productIds,
      };

      if (editingCategory) {
        const updated = await api.updateCategory(editingCategory.id, payload);
        setCategories(
          categories.map((c) => (c.id === editingCategory.id ? updated : c)),
        );
        setEditingCategory(null);
      } else {
        const newCat = await api.createCategory(payload);
        setCategories([...categories, newCat]);
      }
      showToast(
        `Category ${editingCategory ? "updated" : "created"} successfully`,
        "success",
      );
      resetForm();
    } catch (err: any) {
      logError("Failed to save category", err);
      showToast(err.message || "Failed to save category", "error");
    } finally {
      setAdding(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      imageSource: "upload",
      imageUploadUrl: "",
      featuredProductId: null,
      productIds: [],
    });
    setSearchProductQuery("");
  };

  const startEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      imageSource: cat.imageSource || "upload",
      imageUploadUrl: cat.imageSource === "upload" ? cat.imageUrl || "" : "",
      featuredProductId: cat.featuredProductId || null,
      productIds: cat.allProductIds || cat.productIds || [],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: "Delete Category",
      message:
        "Are you sure you want to delete this category? This action cannot be undone.",
      confirmLabel: "Delete",
      type: "danger",
    });

    if (confirmed) {
      try {
        await api.deleteCategory(id);
        setCategories(categories.filter((c) => c.id !== id));
        showToast("Category deleted successfully", "success");
      } catch (err: any) {
        logError("Failed to delete", err);
        showToast(err.message || "Failed to delete category", "error");
      }
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
        <span className="material-icons-outlined text-5xl text-red-400 mb-4">
          error_outline
        </span>
        <h2 className="text-xl font-bold text-neutral-dark mb-2">
          Failed to load categories
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
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-dark">
          Category Management
        </h1>
        <p className="text-sm text-gray-500">
          Organize and structure your affiliate product inventory.
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
        <h2 className="text-lg font-bold text-neutral-dark mb-4 flex items-center gap-2">
          <span className="material-icons-outlined text-primary">
            {editingCategory ? "edit" : "add_circle_outline"}
          </span>
          {editingCategory ? "Edit Category" : "Create New Category"}
        </h2>

        <div className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-bold text-neutral-dark mb-1">
              Category Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter category name..."
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Image Mode Selection */}
            <div className="space-y-4">
              <label className="block text-sm font-bold text-neutral-dark">
                Category Image Mode
              </label>
              <div className="flex gap-2 p-1 bg-gray-50 rounded-lg border border-gray-200">
                <button
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, imageSource: "upload" }))
                  }
                  className={`flex-1 py-1.5 px-3 rounded text-sm font-bold transition-all ${
                    formData.imageSource === "upload"
                      ? "bg-white text-primary shadow-sm"
                      : "text-gray-500 hover:text-neutral-dark"
                  }`}
                >
                  Upload Image
                </button>
                <button
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, imageSource: "product" }))
                  }
                  className={`flex-1 py-1.5 px-3 rounded text-sm font-bold transition-all ${
                    formData.imageSource === "product"
                      ? "bg-white text-primary shadow-sm"
                      : "text-gray-500 hover:text-neutral-dark"
                  }`}
                >
                  Use Product Image
                </button>
              </div>

              {formData.imageSource === "upload" ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.imageUploadUrl}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          imageUploadUrl: e.target.value,
                        }))
                      }
                      placeholder="Image URL..."
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary outline-none"
                    />
                    <button
                      onClick={async () => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.onchange = async (e: any) => {
                          const file = e.target.files[0];
                          if (file) {
                            setUploading(true);
                            try {
                              const uploaded = await api.uploadImages([file]);
                              const url = uploaded[0].url;
                              setFormData((prev) => ({
                                ...prev,
                                imageUploadUrl: url,
                              }));
                              showToast(
                                "Image uploaded successfully",
                                "success",
                              );
                            } catch (err: any) {
                              logError("Upload failed", err);
                              showToast(
                                err.message || "Image upload failed",
                                "error",
                              );
                            } finally {
                              setUploading(false);
                            }
                          }
                        };
                        input.click();
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                    >
                      {uploading ? (
                        <span className="animate-spin material-icons-outlined text-sm">
                          sync
                        </span>
                      ) : (
                        <span className="material-icons-outlined text-sm">
                          cloud_upload
                        </span>
                      )}
                      {uploading ? "..." : "Upload"}
                    </button>
                  </div>
                  {formData.imageUploadUrl && (
                    <div className="mt-2 w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={formData.imageUploadUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    value={searchProductQuery}
                    onChange={(e) => {
                      setSearchProductQuery(e.target.value);
                      setShowProductDropdown(true);
                    }}
                    onFocus={() => setShowProductDropdown(true)}
                    placeholder="Search product for image..."
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary outline-none"
                  />
                  {showProductDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {products
                        .filter((p) =>
                          p.name
                            .toLowerCase()
                            .includes(searchProductQuery.toLowerCase()),
                        )
                        .slice(0, 10)
                        .map((p) => (
                          <button
                            key={p.id}
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                featuredProductId: p.id,
                              }));
                              setSearchProductQuery(p.name);
                              setShowProductDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center gap-3"
                          >
                            <img
                              src={
                                p.images?.find((img: any) => img.isMain)?.url ||
                                p.images?.[0]?.url ||
                                p.image ||
                                "https://via.placeholder.com/150"
                              }
                              className="w-6 h-6 rounded object-cover"
                              alt=""
                            />
                            {p.name}
                          </button>
                        ))}
                    </div>
                  )}
                  {formData.featuredProductId && (
                    <div className="mt-2 flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-100">
                      {(() => {
                        const product = products.find(
                          (p) => p.id === formData.featuredProductId,
                        );
                        const imageUrl =
                          product?.images?.find((img: any) => img.isMain)
                            ?.url ||
                          product?.images?.[0]?.url ||
                          product?.image ||
                          "https://via.placeholder.com/150";
                        return (
                          <>
                            <img
                              src={imageUrl}
                              className="w-12 h-12 rounded object-cover"
                              alt=""
                            />
                            <span className="text-xs font-medium text-gray-600">
                              {product?.name}
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Product IDs Assignment */}
            <div className="space-y-4">
              <label className="block text-sm font-bold text-neutral-dark">
                Assign Products
              </label>
              <div className="border border-gray-200 rounded-lg p-2 bg-white max-h-48 overflow-y-auto relative">
                <div className="sticky top-0 z-10 bg-white -mx-2 -mt-2 px-2 pb-2 mb-2 border-b border-gray-100">
                  <input
                    type="text"
                    placeholder="Quick search products..."
                    className="w-full text-xs px-2 py-1.5 focus:outline-none bg-white"
                    onChange={(e) => {
                      const term = e.target.value.toLowerCase();
                      const items = document.querySelectorAll(
                        ".product-assign-item",
                      );
                      items.forEach((item: any) => {
                        const name = item.dataset.name.toLowerCase();
                        item.style.display = name.includes(term)
                          ? "flex"
                          : "none";
                      });
                    }}
                  />
                </div>
                {products.map((p) => (
                  <label
                    key={p.id}
                    data-name={p.name}
                    className="product-assign-item flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.productIds.includes(p.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData((prev) => ({
                            ...prev,
                            productIds: [...prev.productIds, p.id],
                          }));
                        } else {
                          setFormData((prev) => ({
                            ...prev,
                            productIds: prev.productIds.filter(
                              (id) => id !== p.id,
                            ),
                          }));
                        }
                      }}
                      className="rounded border-gray-300 text-primary focus:ring-primary h-3.5 w-3.5"
                    />
                    <img
                      src={p.image}
                      className="w-5 h-5 rounded object-cover"
                      alt=""
                    />
                    <span className="text-[11px] text-gray-700 truncate">
                      {p.name}
                    </span>
                  </label>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 italic">
                Selected: {formData.productIds.length} products
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            {editingCategory && (
              <button
                onClick={cancelEdit}
                className="px-6 py-2 text-gray-500 font-bold hover:text-neutral-dark transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleSaveCategory}
              disabled={adding || uploading || !formData.name.trim()}
              className="px-8 py-2 bg-primary text-neutral-dark font-bold rounded-lg hover:bg-neutral-dark hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {adding
                ? "Saving..."
                : uploading
                  ? "Uploading..."
                  : editingCategory
                    ? "Update Category"
                    : "Create Category"}
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-bold text-neutral-dark">Existing Categories</h3>
          <span className="text-xs text-gray-500">
            Showing {categories.length} Categories
          </span>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200 text-xs uppercase text-gray-500 font-bold tracking-wider">
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Products</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <div className="flex justify-center items-center gap-2">
                    <span className="animate-spin material-icons-outlined text-lg">
                      sync
                    </span>
                    Loading categories...
                  </div>
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  No categories found. Create one above.
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-neutral-dark flex items-center gap-3">
                    <img
                      src={
                        cat.imageUrl ||
                        cat.image ||
                        "https://via.placeholder.com/100"
                      }
                      alt={cat.name}
                      className="w-10 h-10 rounded-lg object-cover bg-gray-100 border border-gray-100"
                    />
                    <div>
                      <div className="font-bold">{cat.name}</div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-tighter">
                        Mode: {cat.imageSource || "Default"}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 px-2 py-1 rounded-full text-xs font-bold text-gray-600">
                      {cat.productCount} Products
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => startEdit(cat)}
                      className="text-gray-400 hover:text-primary mr-3"
                    >
                      <span className="material-icons-outlined">edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <span className="material-icons-outlined">delete</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoryManager;
