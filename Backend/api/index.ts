import type { VercelRequest, VercelResponse } from "@vercel/node";
import app from "../src/app";
import { connectDB } from "../src/config/db";
import { configureCloudinary } from "../src/config/cloudinary";
import { Admin } from "../src/models/Admin";

let isInitialized = false;

async function init(): Promise<void> {
  if (isInitialized) return;

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is required");
  }

  if (
    process.env.JWT_SECRET ===
    "curate_admin_secret_key_2024_change_in_production"
  ) {
    console.warn(
      "⚠️  Using default JWT_SECRET. Please change this for production!",
    );
  }

  await connectDB();
  configureCloudinary();

  // ⚠️ Admin seed — only runs when explicitly enabled via env var.
  // NEVER set SEED_ADMIN=true in production after initial setup.
  if (process.env.SEED_ADMIN === "true") {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      await Admin.create({
        email: "admin@curate.com",
        passwordHash: "admin123",
      });
      console.log("👤 Default admin created: admin@curate.com / admin123");
    }
  }

  isInitialized = true;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  await init();
  app(req as any, res as any);
}
