import mongoose, { Schema } from "mongoose";
import slugify from "slugify";
import { ICategory } from "../types";

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    image: {
      type: String, // Keeping this as a alias or legacy field
    },
    imageUrl: {
      type: String,
    },
    imageSource: {
      type: String,
      enum: ["upload", "product", null],
      default: null,
    },
    featuredProductId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
    productIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Auto-generate slug from name before saving
categorySchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// Transform _id to id in JSON output for frontend compatibility
categorySchema.set("toJSON", {
  virtuals: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc: any, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Category = mongoose.model<ICategory>("Category", categorySchema);
