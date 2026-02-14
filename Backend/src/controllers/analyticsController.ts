import { Request, Response } from "express";
import { Product } from "../models/Product";
import { Category } from "../models/Category";
import { Feedback } from "../models/Feedback";
import { asyncHandler } from "../utils/asyncHandler";

// ── GET /api/analytics ───────────────────────────────
export const getAnalytics = asyncHandler(
  async (_req: Request, res: Response) => {
    const [totalProducts, totalCategories, totalFeedback, avgRatingResult] =
      await Promise.all([
        Product.countDocuments(),
        Category.countDocuments(),
        Feedback.countDocuments(),
        Feedback.aggregate([
          { $group: { _id: null, avgRating: { $avg: "$rating" } } },
        ]),
      ]);

    const averageRating = avgRatingResult[0]?.avgRating ?? 0;

    // Top products (by reviews as proxy for clicks)
    const topProductsRaw = await Product.find()
      .sort({ reviews: -1 })
      .limit(5)
      .lean();

    const topProducts = topProductsRaw.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      category: p.category,
      price: p.price,
      image: p.image,
      clicks: p.reviews * 10, // Proxy: reviews × 10 as mock clicks
    }));

    // Category distribution
    const categories = await Category.find().lean();
    const categoryDistribution = await Promise.all(
      categories.map(async (cat) => {
        const count = await Product.countDocuments({
          category: { $in: [cat.name] },
        });
        return { name: cat.name, value: count };
      }),
    );

    // Traffic (mock — would come from an analytics service in production)
    const traffic = [
      { date: "Mon", clicks: 120 },
      { date: "Tue", clicks: 145 },
      { date: "Wed", clicks: 132 },
      { date: "Thu", clicks: 198 },
      { date: "Fri", clicks: 245 },
      { date: "Sat", clicks: 187 },
      { date: "Sun", clicks: 156 },
    ];

    // Recent products
    const recentProductsRaw = await Product.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name createdAt")
      .lean();

    const recentProducts = recentProductsRaw.map((p) => ({
      _id: p._id.toString(),
      title: p.name,
      createdAt: p.createdAt.toISOString(),
    }));

    res.json({
      success: true,
      data: {
        traffic,
        topProducts,
        categoryDistribution,
        totalProducts,
        totalCategories,
        totalFeedback,
        averageRating: Math.round(averageRating * 10) / 10,
        recentProducts,
      },
    });
  },
);
