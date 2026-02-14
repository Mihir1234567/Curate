import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectDB } from "./config/db";
import { configureCloudinary } from "./config/cloudinary";
import { Admin } from "./models/Admin";

const PORT = process.env.PORT || 5000;

const start = async (): Promise<void> => {
  // Validate required env vars
  if (!process.env.JWT_SECRET) {
    console.error("❌ JWT_SECRET environment variable is required");
    process.exit(1);
  }

  if (
    process.env.JWT_SECRET ===
    "curate_admin_secret_key_2024_change_in_production"
  ) {
    console.warn(
      "⚠️  Using default JWT_SECRET. Please change this for production!",
    );
  }

  try {
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

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

start();
