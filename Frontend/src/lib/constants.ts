import { Product, Category, StatCard } from './types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Lunar Arc Minimalist Floor Lamp',
    price: 129.00,
    category: 'Lighting',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800',
    description: 'Ultra-slim profile that fits behind couches or in tight corners without visual clutter. Frosted diffuser creates a soft ambient light.',
    features: ['Small Space Mastery', 'Eye-Caring Glow', '3-Minute Assembly'],
    inStock: true,
    rating: 4.8,
    reviews: 128
  },
  {
    id: '2',
    name: 'Modular Velvet Sofa',
    price: 899.00,
    category: 'Living Room',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800',
    description: 'Perfect for tight corners, this modular piece grows with your space.',
    features: ['Modular Design', 'Stain Resistant', 'High Density Foam'],
    inStock: true,
    rating: 4.9,
    reviews: 42
  },
  {
    id: '3',
    name: 'Oak Veneer Side Table',
    price: 89.00,
    category: 'Living Room',
    image: 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&q=80&w=800',
    description: 'A sleek side table with a natural oak finish.',
    features: ['Real Oak Veneer', 'Easy Assembly', 'Water Resistant'],
    inStock: true,
    rating: 4.5,
    reviews: 15
  },
  {
    id: '4',
    name: 'Nordic Jute Runner',
    price: 145.00,
    category: 'Textiles',
    image: 'https://images.unsplash.com/photo-1575414003502-9a007635eb8d?auto=format&fit=crop&q=80&w=800',
    description: 'Hand-woven jute runner perfect for hallways.',
    features: ['Hand Woven', 'Sustainable Material', 'Durable'],
    inStock: true,
    rating: 4.7,
    reviews: 33
  },
  {
    id: '5',
    name: 'Minimalist Matte Planter',
    price: 28.00,
    category: 'Decor',
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=800',
    description: 'Ceramic planter with a matte finish and drainage hole.',
    features: ['Ceramic', 'Drainage Hole', 'Multiple Sizes'],
    inStock: true,
    rating: 4.6,
    reviews: 89
  },
  {
    id: '6',
    name: 'Nest Nesting Tables',
    price: 185.00,
    category: 'Living Room',
    image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=800',
    description: 'Three-in-one table set for maximum versatility.',
    features: ['Space Saving', 'Solid Wood', 'Versatile'],
    inStock: false,
    rating: 4.8,
    reviews: 210
  }
];

export const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: 'Living Room', productCount: 42, image: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&q=80&w=400' },
  { id: '2', name: 'Bedroom', productCount: 28, image: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&q=80&w=400' },
  { id: '3', name: 'Lighting', productCount: 15, image: 'https://images.unsplash.com/photo-1513506003013-d5347e0f95d1?auto=format&fit=crop&q=80&w=400' },
  { id: '4', name: 'Decor', productCount: 56, image: 'https://images.unsplash.com/photo-1513161455079-7dc1de15ef3e?auto=format&fit=crop&q=80&w=400' },
  { id: '5', name: 'Storage', productCount: 19, image: 'https://images.unsplash.com/photo-1594222067266-93b485055006?auto=format&fit=crop&q=80&w=400' },
];

export const ADMIN_STATS: StatCard[] = [
  { label: 'Total Products', value: '1,248', change: '+5.2%', isPositive: true, icon: 'inventory_2' },
  { label: 'Total Clicks', value: '42,892', change: '+12.4%', isPositive: true, icon: 'ads_click' },
  { label: 'Conversion Rate', value: '3.64%', change: '-2.1%', isPositive: false, icon: 'auto_graph' },
  { label: 'Total Revenue', value: '$12,450', change: '+8.9%', isPositive: true, icon: 'payments' },
];