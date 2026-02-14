import React, { useState } from "react";
import { api } from "../lib/api";
import { FormInput } from "../components/ui/FormInput";
import { FormTextarea } from "../components/ui/FormTextarea";
import { Button } from "../components/ui/Button";
import { useToast } from "../context/ToastContext";

const Feedback: React.FC = () => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    rating: 5,
    category: "General",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateField = (name: string, value: any) => {
    let error = "";
    if (name === "name") {
      if (!value.trim()) error = "Name is required";
      else if (value.trim().length < 2)
        error = "Name must be at least 2 characters";
    }
    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value.trim()) error = "Email is required";
      else if (!emailRegex.test(value))
        error = "Please enter a valid email address";
    }
    if (name === "message") {
      if (!value.trim()) error = "Message is required";
      else if (value.trim().length < 10) error = "Write at least 10 characters";
    }
    return error;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleBlur = (
    e: React.FocusEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    if (error) {
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Final validation
    const newErrors: Record<string, string> = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, (formData as any)[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast("Please correct the errors in the form.", "error");
      return;
    }

    setLoading(true);

    try {
      await api.createFeedback({
        ...formData,
        rating: Number(formData.rating),
      });
      setSuccess(true);
      showToast("Thank you for your valuable feedback!", "success");
      setFormData({
        name: "",
        email: "",
        message: "",
        rating: 5,
        category: "General",
      });
      setErrors({});
    } catch (err) {
      showToast("Service unavailable. Please try again later.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-neutral-dark font-serif mb-4">
          We Value Your Feedback
        </h1>
        <p className="text-gray-500">
          Let us know what you think about our products and service.
        </p>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        {success ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-icons-outlined text-3xl">check</span>
            </div>
            <h3 className="text-2xl font-bold text-neutral-dark mb-2">
              Thank You!
            </h3>
            <p className="text-gray-500 mb-6">
              Your feedback has been submitted successfully.
            </p>
            <Button
              onClick={() => setSuccess(false)}
              variant="outline"
              size="sm"
            >
              Submit Another
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.name}
                placeholder="Full Name"
                required
              />
              <FormInput
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.email}
                placeholder="email@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-neutral-dark mb-1">
                Feedback Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm font-medium text-gray-700 cursor-pointer"
              >
                <option value="General">General Inquiry</option>
                <option value="Feature Request">New Feature Suggestion</option>
                <option value="Bug Report">Technical Issue / Bug</option>
                <option value="Product">Product Quality / Review</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-neutral-dark mb-1">
                Rate Your Experience
              </label>
              <div className="flex gap-4 p-3 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                {[1, 2, 3, 4, 5].map((star) => (
                  <label
                    key={star}
                    className="flex items-center gap-1.5 cursor-pointer group"
                  >
                    <input
                      type="radio"
                      name="rating"
                      value={star}
                      checked={Number(formData.rating) === star}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <span
                      className={`text-2xl material-icons-outlined transition-colors duration-200 ${
                        Number(formData.rating) >= star
                          ? "text-yellow-400"
                          : "text-gray-300 group-hover:text-yellow-200"
                      }`}
                    >
                      {Number(formData.rating) >= star ? "star" : "star_border"}
                    </span>
                  </label>
                ))}
                <span className="ml-auto text-xs font-bold text-gray-400 self-center uppercase tracking-widest px-2">
                  {formData.rating}/5
                </span>
              </div>
            </div>

            <FormTextarea
              label="Details"
              name="message"
              value={formData.message}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.message}
              rows={4}
              placeholder="Please provide details about your experience..."
              required
            />

            <Button
              type="submit"
              isLoading={loading}
              className="w-full py-4 text-base shadow-lg shadow-primary/10"
            >
              Send Feedback
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Feedback;
