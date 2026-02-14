import React, { TextareaHTMLAttributes } from "react";

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
  label,
  error,
  className = "",
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-bold text-neutral-dark mb-1">
          {label}
        </label>
      )}
      <textarea
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
          error ? "border-red-500 bg-red-50/30" : "border-gray-200"
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-red-500 text-xs mt-1 animate-fade-in">{error}</p>
      )}
    </div>
  );
};
