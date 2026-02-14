export interface AnalyticsData {
  traffic: {
    date: string;
    clicks: number;
  }[];
  topProducts: {
    id: string;
    name: string;
    category: string | string[];
    price: number;
    image: string;
    clicks: number;
  }[];
  categoryDistribution: {
    name: string;
    value: number;
  }[];
  // Added requested fields to support potential future features,
  // though currently populated/used optionally to maintain existing functionality
  totalProducts?: number;
  totalCategories?: number;
  totalFeedback?: number;
  averageRating?: number;
  recentProducts?: {
    _id: string;
    title: string;
    createdAt: string;
  }[];
}
