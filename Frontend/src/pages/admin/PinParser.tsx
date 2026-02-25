import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { logError } from "../../lib/logger";
import { Button } from "../../components/ui/Button";
import { FormInput } from "../../components/ui/FormInput";
import { Category, ProductImage } from "../../types";
import { useToast } from "../../context/ToastContext";

interface PinData {
  title?: string;
  description?: string;
  imagePrompt?: string;
  textOverlay?: string;
  [key: string]: any;
}

interface ProductData {
  name?: string;
  price?: number;
  description?: string;
  features?: string[];
  rating?: number;
  reviews?: number;
  stylingTip?: string;
  affiliateLink?: string;
  [key: string]: any;
}

interface ParsedContent {
  pins?: PinData[];
  product?: ProductData;
}

const PinParser: React.FC = () => {
  const [jsonInput, setJsonInput] = useState("");
  const [parsedData, setParsedData] = useState<ParsedContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const { showToast } = useToast();
  const navigate = useNavigate();

  // Product Form State
  const [showProductForm, setShowProductForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);

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

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await api.getCategories();
        setCategories(cats);
      } catch (err) {
        logError("Failed to load categories", err);
      }
    };
    loadCategories();
  }, []);

  const handleParse = () => {
    try {
      setError(null);
      if (!jsonInput.trim()) {
        setParsedData(null);
        return;
      }
      const data = JSON.parse(jsonInput);

      if (data.pins && Array.isArray(data.pins)) {
        data.pins.forEach((pin: any) => {
          if (pin.textOverlay) {
            pin.imagePrompt = pin.imagePrompt
              ? `${pin.imagePrompt} Text Overlay: "${pin.textOverlay}"`
              : `Text Overlay: "${pin.textOverlay}"`;
            delete pin.textOverlay;
          }
        });
      }

      if (data.product) {
        setFormData({
          name: data.product.name || "",
          description: data.product.description || "",
          category: Array.isArray(data.product.category)
            ? data.product.category
            : data.product.category
              ? [data.product.category]
              : [],
          price:
            data.product.price !== undefined
              ? data.product.price.toString()
              : "",
          features: Array.isArray(data.product.features)
            ? data.product.features.join(", ")
            : data.product.features || "",
          rating:
            data.product.rating !== undefined
              ? data.product.rating.toString()
              : "0",
          reviews:
            data.product.reviews !== undefined
              ? data.product.reviews.toString()
              : "0",
          stylingTip: data.product.stylingTip || "",
          affiliateLink: data.product.affiliateLink || "",
        });
        if (data.product.images && Array.isArray(data.product.images)) {
          setImages(data.product.images);
        } else if (
          data.product.image &&
          typeof data.product.image === "string"
        ) {
          setImages([
            { url: data.product.image, publicId: "legacy-manual-import" },
          ]);
        } else {
          setImages([]);
        }
      }

      setParsedData(data);
      setShowProductForm(false);
    } catch (e) {
      setError("Invalid JSON format. Please check your input and try again.");
      setParsedData(null);
      setShowProductForm(false);
    }
  };

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  const renderField = (label: string, value: any, fieldId: string) => {
    if (value === undefined || value === null) return null;

    let displayValue = value;
    let copyValue = value;

    if (Array.isArray(value)) {
      displayValue = (
        <ul className="list-disc pl-5 mt-1">
          {value.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      );
      copyValue = value.join("\n");
    } else if (typeof value === "object") {
      displayValue = (
        <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-x-auto">
          {JSON.stringify(value, null, 2)}
        </pre>
      );
      copyValue = JSON.stringify(value, null, 2);
    } else {
      displayValue = (
        <p className="text-gray-800 whitespace-pre-wrap mt-1">{value}</p>
      );
    }

    return (
      <div className="mb-4 bg-white border border-gray-200 rounded-lg p-4 group relative hover:border-primary/30 transition-colors">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {label}
            </span>
            {displayValue}
          </div>
          <button
            onClick={() => handleCopy(String(copyValue), fieldId)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              copiedField === fieldId
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <span className="material-icons-outlined text-sm">
              {copiedField === fieldId ? "check" : "content_copy"}
            </span>
            {copiedField === fieldId ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
    );
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
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

  const handleSubmitProduct = async (e: React.FormEvent) => {
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
        removedImages: [],
      };

      await api.createProduct({
        ...productPayload,
        inStock: true,
      });
      showToast("Product created successfully", "success");

      // Keep pins visible but hide product form to show it's done or redirect
      setShowProductForm(false);
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
    <div className="max-w-5xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Pin JSON Parser</h1>
        <p className="text-gray-500 mt-1">
          Paste your generated JSON below to split it into easily copiable
          fields.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Paste JSON Content
        </label>
        <textarea
          className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none font-mono text-sm"
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder='{\n  "pins": [...],\n  "product": {...}\n}'
        />
        {error && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <span className="material-icons-outlined text-sm">error</span>{" "}
            {error}
          </p>
        )}
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleParse}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium shadow-sm hover:shadow"
          >
            <span className="material-icons-outlined text-sm">data_object</span>
            Parse JSON
          </button>
        </div>
      </div>

      {parsedData && (
        <div className="space-y-8 animate-fadeIn">
          {parsedData.product && !showProductForm && (
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 flex flex-col items-center justify-center text-center">
              <span className="material-icons-outlined text-4xl text-primary mb-3">
                inventory_2
              </span>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Product Details Found
              </h2>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                We've extracted the product information. You can now review,
                edit, and publish this product directly to your catalog.
              </p>
              <button
                onClick={() => setShowProductForm(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium shadow-sm"
              >
                <span className="material-icons-outlined text-sm">
                  add_circle
                </span>
                Create Product
              </button>
            </div>
          )}

          {parsedData.product && showProductForm && (
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 animate-fadeIn">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-2">
                  <span className="material-icons-outlined text-primary">
                    edit_note
                  </span>
                  Review & Create Product
                </div>
                <button
                  type="button"
                  onClick={() => setShowProductForm(false)}
                  className="text-sm font-medium text-gray-500 hover:text-gray-800"
                >
                  Cancel
                </button>
              </h2>

              <form onSubmit={handleSubmitProduct} className="space-y-6">
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
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
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
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
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
                                (c) =>
                                  c.toLowerCase() === cat.name.toLowerCase(),
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
                                        c.toLowerCase() !==
                                        cat.name.toLowerCase(),
                                    ),
                                  }));
                                }
                              }}
                              className="rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-gray-700">
                              {cat.name}
                            </span>
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
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                      placeholder="e.g. Ergonomic design, Premium fabric, 5-year warranty"
                    ></textarea>
                  </div>

                  <FormInput
                    label="Affiliate Link"
                    name="affiliateLink"
                    type="url"
                    value={formData.affiliateLink}
                    onChange={handleChange}
                    placeholder="https://amazon.com/dp/..."
                  />

                  {/* Media Section */}
                  <div>
                    <label className="block text-sm font-bold text-neutral-dark mb-3">
                      Product Media
                    </label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*"
                      multiple
                    />

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
                      {images.map((img, index) => (
                        <div
                          key={index}
                          className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-white"
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
                            ? "bg-gray-100 border-gray-300 bg-white"
                            : "border-gray-200 hover:border-primary hover:bg-primary/5 bg-white"
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
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t mt-6">
                  <Button
                    type="submit"
                    isLoading={loading}
                    disabled={uploading}
                  >
                    {uploading ? "Uploading..." : "Save Product"}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {parsedData.pins && parsedData.pins.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-4">
                <span className="material-icons-outlined text-primary">
                  push_pin
                </span>
                Pinterest Pins
              </h2>

              <div className="grid grid-cols-1 gap-6">
                {parsedData.pins.map((pin, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/80"></div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 ml-2">
                      Pin {index + 1}
                    </h3>
                    <div className="space-y-4">
                      {renderField("Title", pin.title, `pin-${index}-title`)}
                      {renderField(
                        "Description",
                        pin.description,
                        `pin-${index}-desc`,
                      )}
                      {renderField(
                        "Image Prompt",
                        pin.imagePrompt,
                        `pin-${index}-prompt`,
                      )}

                      {/* Render any extra fields that might be in the objects */}
                      {Object.keys(pin)
                        .filter(
                          (k) =>
                            !["title", "description", "imagePrompt"].includes(
                              k,
                            ),
                        )
                        .map((key) =>
                          renderField(key, pin[key], `pin-${index}-${key}`),
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PinParser;
