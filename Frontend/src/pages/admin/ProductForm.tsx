import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../lib/api";
import { logError } from "../../lib/logger";
import { Button } from "../../components/ui/Button";
import { FormInput } from "../../components/ui/FormInput";
import { Category } from "../../types";
import { useToast } from "../../context/ToastContext";

const ProductForm: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: [] as string[],
    price: "",
    image: "",
    features: "" as string | string[],
    rating: "0",
    reviews: "0",
    stylingTip: "",
    affiliateLink: "",
  });
  const [rawJson, setRawJson] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const cats = await api.getCategories();
        setCategories(cats);

        if (isEditMode && id) {
          // In a real app we would fetch the product here too if not passed in state
          // For now, assuming we might need to fetch it or finding it in the list
          // But since our mock helper getProducts returns all, let's use getProductBySlug if it works by ID too or update API
          // For simplicity in this mock, we skip pre-filling if we don't have a specific get-by-id that works purely on ID for this form
          // BUT wait, we added getProductBySlug, let's use that as ID lookup for now
          const product = await api.getProductBySlug(id);
          if (product) {
            setFormData({
              name: product.name,
              description: product.description,
              category: Array.isArray(product.category)
                ? product.category
                : [product.category],
              price: product.price.toString(),
              image: product.image,
              features: Array.isArray(product.features)
                ? product.features.join(", ")
                : product.features,
              rating: (product.rating || 0).toString(),
              reviews: (product.reviews || 0).toString(),
              stylingTip: product.stylingTip || "",
              affiliateLink: product.affiliateLink || "",
            });
          }
        }
      } catch (err) {
        logError("Failed to load product data", err);
      }
    };
    loadData();
  }, [isEditMode, id]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await api.uploadImage(file);
      setFormData((prev) => ({ ...prev, image: url }));
    } catch (err) {
      logError("Image upload failed", err);
      showToast("Failed to upload image. Please try again.", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleJsonImport = () => {
    try {
      const parsed = JSON.parse(rawJson);
      setFormData((prev) => ({
        ...prev,
        name: parsed.name || prev.name,
        description: parsed.description || prev.description,
        category: Array.isArray(parsed.category)
          ? parsed.category
          : parsed.category
            ? [parsed.category]
            : prev.category,
        price:
          parsed.price !== undefined ? parsed.price.toString() : prev.price,
        image: parsed.image || prev.image,
        features: Array.isArray(parsed.features)
          ? parsed.features.join(", ")
          : parsed.features || prev.features,
        rating:
          parsed.rating !== undefined ? parsed.rating.toString() : prev.rating,
        reviews:
          parsed.reviews !== undefined
            ? parsed.reviews.toString()
            : prev.reviews,
        stylingTip: parsed.stylingTip || prev.stylingTip,
        affiliateLink: parsed.affiliateLink || prev.affiliateLink,
      }));
      setRawJson("");
      showToast("Form auto-filled from JSON successfully!", "success");
    } catch (err) {
      showToast("Invalid JSON format. Please check your input.", "error");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditMode && id) {
        await api.updateProduct(id, {
          name: formData.name,
          description: formData.description,
          category: formData.category,
          price: Number(formData.price),
          image: formData.image,
          features:
            typeof formData.features === "string"
              ? formData.features
                  .split(",")
                  .map((f) => f.trim())
                  .filter(Boolean)
              : formData.features,
          rating: Number(formData.rating),
          reviews: Number(formData.reviews),
          stylingTip: formData.stylingTip,
          affiliateLink: formData.affiliateLink,
        });
      } else {
        await api.createProduct({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          price: Number(formData.price),
          image: formData.image || "https://via.placeholder.com/800",
          features:
            typeof formData.features === "string"
              ? formData.features
                  .split(",")
                  .map((f) => f.trim())
                  .filter(Boolean)
              : formData.features,
          rating: Number(formData.rating),
          reviews: Number(formData.reviews),
          stylingTip: formData.stylingTip,
          affiliateLink: formData.affiliateLink,
          inStock: true,
        });
      }
      navigate("/admin/products");
    } catch (err) {
      logError("Failed to save product", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-dark">
          {isEditMode ? "Edit Product" : "Add New Product"}
        </h1>
        <p className="text-sm text-gray-500">
          Fill in the information below to{" "}
          {isEditMode ? "update the" : "add a new"} item.
        </p>
      </div>

      {/* JSON Import Section */}
      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm mb-6">
        <h2 className="text-lg font-bold text-neutral-dark mb-4 flex items-center gap-2">
          <span className="material-icons-outlined text-primary">
            auto_fix_high
          </span>
          Quick Import (JSON)
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Paste a JSON object below to auto-fill the form fields.
        </p>
        <div className="flex flex-col gap-4">
          <textarea
            value={rawJson}
            onChange={(e) => setRawJson(e.target.value)}
            rows={5}
            className="w-full font-mono text-xs px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50"
            placeholder='{ "name": "Product Name", "price": 99.99, ... }'
          ></textarea>
          <div className="flex justify-between items-center">
            <div className="group relative">
              <button
                type="button"
                className="text-xs text-primary font-bold hover:underline"
                onClick={() => {
                  const example = {
                    name: "Sample Product",
                    price: 49.99,
                    description: "Description here",
                    category: ["Decor"],
                    image: "https://example.com/image.jpg",
                    features: ["Feature 1", "Feature 2"],
                    rating: 4.5,
                    reviews: 100,
                    stylingTip: "Tip here",
                    affiliateLink: "https://amazon.com/...",
                  };
                  navigator.clipboard.writeText(
                    JSON.stringify(example, null, 2),
                  );
                  showToast("Example JSON copied to clipboard!", "info");
                }}
              >
                Copy Example JSON
              </button>
            </div>
            <Button
              type="button"
              onClick={handleJsonImport}
              variant="outline"
              size="sm"
              disabled={!rawJson.trim()}
            >
              Import Values
            </Button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Info */}
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-neutral-dark mb-6 flex items-center gap-2">
            <span className="material-icons-outlined text-primary">info</span>
            General Information
          </h2>

          <div className="space-y-6">
            <FormInput
              label="Product Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Ergonomic Chair"
              required
            />

            <div className="w-full">
              <label className="block text-sm font-bold text-neutral-dark mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Product description..."
              ></textarea>
            </div>

            <div className="w-full">
              <label className="block text-sm font-bold text-neutral-dark mb-1">
                Styling Tip
              </label>
              <textarea
                name="stylingTip"
                value={formData.stylingTip}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Share a tip on how to style this product..."
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="w-full">
                <label className="block text-sm font-bold text-neutral-dark mb-1">
                  Categories
                </label>
                <div className="border border-gray-200 rounded-lg p-4 bg-white max-h-40 overflow-y-auto">
                  {categories.map((cat) => (
                    <label
                      key={cat.id}
                      className="flex items-center gap-2 mb-2 last:mb-0 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.category.includes(cat.name)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData((prev) => ({
                              ...prev,
                              category: [...prev.category, cat.name],
                            }));
                          } else {
                            setFormData((prev) => ({
                              ...prev,
                              category: prev.category.filter(
                                (c) => c !== cat.name,
                              ),
                            }));
                          }
                        }}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-gray-700">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <FormInput
                label="Price ($)"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
              />

              <FormInput
                label="Rating (0-5 stars)"
                name="rating"
                type="number"
                value={formData.rating}
                onChange={handleChange}
                placeholder="0"
                min="0"
                max="5"
                step="0.1"
              />

              <FormInput
                label="Review Count"
                name="reviews"
                type="number"
                value={formData.reviews}
                onChange={handleChange}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="w-full">
              <label className="block text-sm font-bold text-neutral-dark mb-1">
                Key Features (comma separated)
              </label>
              <textarea
                name="features"
                value={formData.features}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. Ergonomic design, Premium fabric, 5-year warranty"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Media */}
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-neutral-dark mb-6 flex items-center gap-2">
            <span className="material-icons-outlined text-primary">image</span>
            Product Media
          </h2>

          <FormInput
            label="Image URL"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="https://..."
          />

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className={`mt-4 border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${
              uploading
                ? "bg-gray-100 border-gray-300"
                : "border-gray-300 hover:border-primary bg-gray-50"
            }`}
          >
            {uploading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                <p className="text-sm font-medium text-gray-600">
                  Uploading...
                </p>
              </div>
            ) : formData.image ? (
              <div className="w-full relative group">
                <img
                  src={formData.image}
                  alt="Preview"
                  className="max-h-48 rounded-lg mx-auto object-contain"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                  <p className="text-white text-sm font-medium">
                    Click to Change
                  </p>
                </div>
              </div>
            ) : (
              <>
                <span className="material-icons-outlined text-4xl text-gray-400 mb-2">
                  cloud_upload
                </span>
                <p className="text-sm font-medium text-gray-600">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  SVG, PNG, JPG (max. 800x400px)
                </p>
              </>
            )}
          </div>
        </div>

        {/* Affiliate Info */}
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-neutral-dark mb-6 flex items-center gap-2">
            <span className="material-icons-outlined text-primary">link</span>
            Affiliate Details
          </h2>

          <FormInput
            label="Affiliate Link"
            name="affiliateLink"
            type="url"
            value={formData.affiliateLink}
            onChange={handleChange}
            placeholder="https://amazon.com/dp/..."
          />
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/admin/products")}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            Save Product
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
