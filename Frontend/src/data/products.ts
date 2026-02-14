import { Product } from "../types";

export const products: Product[] = [
  {
    id: "1",
    name: "Lunar Arc Minimalist Floor Lamp",
    price: 129.0,
    category: ["Lighting", "Living Room"],
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800",
    description:
      "Ultra-slim profile that fits behind couches or in tight corners without visual clutter. Frosted diffuser creates a soft ambient light.",
    features: ["Small Space Mastery", "Eye-Caring Glow", "3-Minute Assembly"],
    inStock: true,
    rating: 4.8,
    reviews: 128,
  },
  {
    id: "2",
    name: "Modular Velvet Sofa",
    price: 899.0,
    category: ["Living Room"],
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800",
    description:
      "Perfect for tight corners, this modular piece grows with your space.",
    features: ["Modular Design", "Stain Resistant", "High Density Foam"],
    inStock: true,
    rating: 4.9,
    reviews: 42,
  },
  {
    id: "3",
    name: "Oak Veneer Side Table",
    price: 89.0,
    category: ["Living Room", "Furniture"],
    image:
      "https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&q=80&w=800",
    description: "A sleek side table with a natural oak finish.",
    features: ["Real Oak Veneer", "Easy Assembly", "Water Resistant"],
    inStock: true,
    rating: 4.5,
    reviews: 15,
  },
  {
    id: "4",
    name: "Nordic Jute Runner",
    price: 145.0,
    category: ["Textiles", "Decor"],
    image:
      "https://images.unsplash.com/photo-1575414003502-9a007635eb8d?auto=format&fit=crop&q=80&w=800",
    description: "Hand-woven jute runner perfect for hallways.",
    features: ["Hand Woven", "Sustainable Material", "Durable"],
    inStock: true,
    rating: 4.7,
    reviews: 33,
  },
  {
    id: "5",
    name: "Minimalist Matte Planter",
    price: 28.0,
    category: ["Decor"],
    image:
      "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=800",
    description: "Ceramic planter with a matte finish and drainage hole.",
    features: ["Ceramic", "Drainage Hole", "Multiple Sizes"],
    inStock: true,
    rating: 4.6,
    reviews: 89,
  },
  {
    id: "6",
    name: "Nest Nesting Tables",
    price: 185.0,
    category: ["Living Room", "Furniture"],
    image:
      "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=800",
    description: "Three-in-one table set for maximum versatility.",
    features: ["Space Saving", "Solid Wood", "Versatile"],
    inStock: false,
    rating: 4.8,
    reviews: 210,
  },
];
