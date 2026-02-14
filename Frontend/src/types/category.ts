export interface Category {
  id: string;
  name: string;
  productCount: number;
  image?: string; // Legacy
  imageUrl?: string;
  imageSource?: "upload" | "product" | null;
  featuredProductId?: string;
  productIds?: string[];
  allProductIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}
