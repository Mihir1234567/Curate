import { Document } from "mongoose";

// ── Product ──────────────────────────────────────────
export interface IProduct extends Document {
  name: string;
  slug: string;
  price: number;
  category: string[];
  images: {
    url: string;
    publicId: string;
    isMain?: boolean;
  }[];
  description: string;
  features: string[];
  inStock: boolean;
  rating: number;
  reviews: number;
  stylingTip?: string;
  affiliateLink?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ── Category ─────────────────────────────────────────
export interface ICategory extends Document {
  name: string;
  slug: string;
  image?: string; // Kept for backward compatibility if needed, but we'll use imageUrl
  imageUrl?: string;
  imageSource?: "upload" | "product" | null;
  featuredProductId?: string;
  productIds?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ── Feedback ─────────────────────────────────────────
export interface IFeedback extends Document {
  name: string;
  email: string;
  message: string;
  rating: number;
  category?: string;
  status: "new" | "reviewed";
  createdAt: Date;
}

// ── API Response ─────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  offset?: number;
  limit?: number;
  total?: number;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
