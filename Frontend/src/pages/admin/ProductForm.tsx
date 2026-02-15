import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../lib/api";
import { logError } from "../../lib/logger";
import { Button } from "../../components/ui/Button";
import { FormInput } from "../../components/ui/FormInput";
import { Category, ProductImage } from "../../types";
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

  // State for images
  const [images, setImages] = useState<ProductImage[]>([]);
  const [removedPublicIds, setRemovedPublicIds] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: [] as string[],
    price: "",
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
          const product = await api.getProductBySlug(id);
          if (product) {
            console.log("Product data fetched:", product);
            setFormData({
              name: product.name,
              description: product.description,
              category: Array.isArray(product.category)
                ? product.category
                : product.category
                  ? [product.category]
                  : [],
              price: product.price.toString(),
              features: Array.isArray(product.features)
                ? product.features.join(", ")
                : product.features || "",
              rating: (product.rating || 0).toString(),
              reviews: (product.reviews || 0).toString(),
              stylingTip: product.stylingTip || "",
              affiliateLink: product.affiliateLink || "",
            });
            console.log(
              "FormData initialized with category:",
              product.category,
            );
            setImages(product.images || []);
          }
        }
      } catch (err) {
        logError("Failed to load product data", err);
      }
    };
    loadData();
  }, [isEditMode, id]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadedMetadata = await api.uploadImages(files);
      setImages((prev) => [...prev, ...uploadedMetadata]);
      showToast(`Successfully uploaded ${files.length} image(s)`, "success");
    } catch (err: any) {
      logError("Image upload failed", err);
      showToast(
        err.message || "Failed to upload image(s). Please try again.",
        "error",
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    const imageToRemove = images[index];

    // If it's an existing image (has publicId and we are in edit mode), track it for backend deletion
    if (imageToRemove.publicId && isEditMode) {
      setRemovedPublicIds((prev) => [...prev, imageToRemove.publicId]);
    }

    setImages((prev) => prev.filter((_, i) => i !== index));
  };
  const setMainImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isMain: i === index,
      })),
    );
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

      if (parsed.images && Array.isArray(parsed.images)) {
        setImages(parsed.images);
      } else if (parsed.image && typeof parsed.image === "string") {
        // Fallback for legacy JSON format
        setImages([{ url: parsed.image, publicId: "legacy-manual-import" }]);
      }

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

    if (images.length === 0) {
      showToast("At least one image is required", "error");
      return;
    }

    setLoading(true);
    try {
      const productPayload = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: Number(formData.price),
        images: images,
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
        removedImages: removedPublicIds,
      };

      if (isEditMode && id) {
        await api.updateProduct(id, productPayload);
        showToast("Product updated successfully", "success");
      } else {
        await api.createProduct({
          ...productPayload,
          inStock: true,
        });
        showToast("Product created successfully", "success");
      }
      navigate("/admin/products");
    } catch (err: any) {
      logError("Failed to save product", err);
      showToast(
        err.message || "Failed to save product. Please check all fields.",
        "error",
      );
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
            placeholder='{ "name": "Product Name", "price": 99.99, "images": [{ "url": "...", "publicId": "..." }] }'
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
                    images: [
                      { url: "https://example.com/image.jpg", publicId: "ex1" },
                    ],
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
                        checked={formData.category.some(
                          (c) => c.toLowerCase() === cat.name.toLowerCase(),
                        )}
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
                                (c) =>
                                  c.toLowerCase() !== cat.name.toLowerCase(),
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

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
            multiple
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {images.map((img, index) => (
              <div
                key={index}
                className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
              >
                <img
                  src={img.url}
                  alt={`Product aspect ${index + 1}`}
                  className={`w-full h-full object-cover transition-opacity ${img.isMain ? "opacity-100" : "opacity-60 group-hover:opacity-100"}`}
                />
                {img.isMain && (
                  <div className="absolute top-1 left-1 bg-primary text-neutral-dark px-1.5 py-0.5 rounded text-[10px] font-bold shadow-sm z-10">
                    Main
                  </div>
                )}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {!img.isMain && (
                    <button
                      type="button"
                      onClick={() => setMainImage(index)}
                      className="p-1.5 bg-white text-neutral-dark rounded-full shadow hover:bg-primary transition-colors"
                      title="Set as main image"
                    >
                      <span className="material-icons-outlined text-sm">
                        star
                      </span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="p-1.5 bg-white text-red-500 rounded-full shadow hover:bg-red-50 transition-colors"
                    title="Remove image"
                  >
                    <span className="material-icons-outlined text-sm">
                      delete
                    </span>
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className={`aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center transition-colors ${
                uploading
                  ? "bg-gray-100 border-gray-300"
                  : "border-gray-200 hover:border-primary hover:bg-primary/5 bg-gray-50"
              }`}
            >
              {uploading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              ) : (
                <>
                  <span className="material-icons-outlined text-2xl text-gray-400 mb-1">
                    add_photo_alternate
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                    Add Photo
                  </span>
                </>
              )}
            </button>
          </div>

          <p className="text-[10px] text-gray-400 flex items-center gap-1.5 leading-none">
            <span className="material-icons-outlined text-sm">info</span>
            You can upload multiple images. Use the star icon to select the
            cover photo.
          </p>
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
          <Button type="submit" isLoading={loading} disabled={uploading}>
            {uploading
              ? "Uploading..."
              : isEditMode
                ? "Update Product"
                : "Save Product"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
