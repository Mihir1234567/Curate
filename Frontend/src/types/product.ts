export interface ProductImage {
  url: string;
  publicId: string;
  isMain?: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string | string[];
  images: ProductImage[];
  description: string;
  features: string[];
  inStock: boolean;
  rating: number;
  reviews: number;
  stylingTip?: string;
  affiliateLink?: string;
}
