import mongoose, { Schema } from "mongoose";
import slugify from "slugify";
import { IProduct } from "../types";

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [200, "Name cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    category: {
      type: [String],
      required: [true, "At least one category is required"],
      index: true,
    },
    images: {
      type: [
        {
          url: { type: String, required: true },
          publicId: { type: String, required: true },
          isMain: { type: Boolean, default: false },
        },
      ],
      required: [true, "Product images are required"],
      validate: [
        function (val: any[]) {
          return val.length > 0;
        },
        "At least one image is required",
      ],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    features: {
      type: [String],
      default: [],
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    stylingTip: {
      type: String,
      trim: true,
      maxlength: [500, "Styling tip cannot exceed 500 characters"],
    },
    affiliateLink: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// Auto-generate slug from name before saving
productSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }

  // Ensure exactly one image is marked as main
  if (this.images && this.images.length > 0) {
    const mainCount = this.images.filter((img) => img.isMain).length;
    if (mainCount === 0) {
      // Default first one to main if none selected
      this.images[0].isMain = true;
    } else if (mainCount > 1) {
      // If multiple (shouldn't happen with UI), keep only first main
      let foundFirst = false;
      this.images.forEach((img) => {
        if (img.isMain) {
          if (foundFirst) img.isMain = false;
          else foundFirst = true;
        }
      });
    }
  }
  next();
});

// Index for text search
productSchema.index({ name: "text", description: "text" });
productSchema.index({ createdAt: -1 });

// Transform _id to id in JSON output for frontend compatibility
productSchema.set("toJSON", {
  virtuals: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc: any, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Product = mongoose.model<IProduct>("Product", productSchema);
