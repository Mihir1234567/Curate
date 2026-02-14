export interface Product {
  id: string;
  name: string;
  price: number;
  category: string | string[];
  image: string;
  description: string;
  features: string[];
  inStock: boolean;
  rating: number;
  reviews: number;
  stylingTip?: string;
  affiliateLink?: string;
}
