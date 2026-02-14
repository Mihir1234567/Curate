/**
 * Seed script — populates MongoDB with data from frontend mock files.
 * Run: npm run seed
 */
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { Product } from "./models/Product";
import { Category } from "./models/Category";
import { Feedback } from "./models/Feedback";

const MONGODB_URI = process.env.MONGODB_URI!;

const products = [
  {
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

const categories = [
  {
    name: "Living Room",
    image:
      "https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&q=80&w=400",
  },
  {
    name: "Bedroom",
    image:
      "https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&q=80&w=400",
  },
  {
    name: "Lighting",
    image:
      "https://images.unsplash.com/photo-1513506003013-d5347e0f95d1?auto=format&fit=crop&q=80&w=400",
  },
  {
    name: "Decor",
    image:
      "https://images.unsplash.com/photo-1513161455079-7dc1de15ef3e?auto=format&fit=crop&q=80&w=400",
  },
  {
    name: "Storage",
    image:
      "https://images.unsplash.com/photo-1594222067266-93b485055006?auto=format&fit=crop&q=80&w=400",
  },
  {
    name: "Furniture",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=400",
  },
  {
    name: "Textiles",
    image:
      "https://images.unsplash.com/photo-1575414003502-9a007635eb8d?auto=format&fit=crop&q=80&w=400",
  },
];

const sampleFeedback = [
  {
    name: "Alice Johnson",
    email: "alice@example.com",
    message: "Love the minimalist designs! The floor lamp is amazing.",
    rating: 5,
    category: "General",
    status: "reviewed" as const,
  },
  {
    name: "Bob Smith",
    email: "bob@example.com",
    message: "Would love to see more bedroom furniture options.",
    rating: 4,
    category: "Feature Request",
    status: "new" as const,
  },
  {
    name: "Carol White",
    email: "carol@example.com",
    message: "Great quality products at reasonable prices.",
    rating: 5,
    category: "General",
    status: "reviewed" as const,
  },
];

const seed = async () => {
  try {
    console.log("🌱 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await Promise.all([
      Product.deleteMany({}),
      Category.deleteMany({}),
      Feedback.deleteMany({}),
    ]);

    // Seed categories first
    console.log("📁 Seeding categories...");
    const createdCategories = await Category.insertMany(categories);
    console.log(`   ✅ ${createdCategories.length} categories created`);

    // Seed products
    console.log("📦 Seeding products...");
    const createdProducts = await Product.create(products); // Use .create() for pre-save hooks (slug)
    console.log(`   ✅ ${createdProducts.length} products created`);

    // Seed feedback
    console.log("💬 Seeding feedback...");
    const createdFeedback = await Feedback.insertMany(sampleFeedback);
    console.log(`   ✅ ${createdFeedback.length} feedback entries created`);

    console.log("\n🎉 Seed complete!\n");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
};

seed();
