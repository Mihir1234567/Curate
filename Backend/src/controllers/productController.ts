import { Request, Response } from "express";
import { Product } from "../models/Product";
import { Category } from "../models/Category";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { deleteFromCloudinary } from "../services/uploadService";

// ── GET /api/products ────────────────────────────────
// Supports: ?page, ?limit, ?search, ?category, ?sort
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = "1",
    limit = "20",
    search,
    category,
    sort = "newest",
  } = req.query;

  const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
  const limitNum = Math.min(
    50,
    Math.max(1, parseInt(limit as string, 10) || 20),
  );
  const skip = (pageNum - 1) * limitNum;

  // Build filter
  const filter: Record<string, unknown> = {};

  if (search) {
    const searchRegex = new RegExp(search as string, "i");
    filter.$or = [{ name: searchRegex }, { description: searchRegex }];
  }

  if (category && category !== "All") {
    filter.category = { $regex: new RegExp(`^${category}$`, "i") };
  }

  // Build sort
  let sortObj: Record<string, 1 | -1> = { createdAt: -1 };
  switch (sort) {
    case "price-low":
      sortObj = { price: 1 };
      break;
    case "price-high":
      sortObj = { price: -1 };
      break;
    case "newest":
    default:
      sortObj = { createdAt: -1 };
      break;
  }

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sortObj).skip(skip).limit(limitNum).lean(),
    Product.countDocuments(filter),
  ]);

  // Transform _id → id for lean documents
  const transformed = products.map((p) => ({
    ...p,
    id: p._id.toString(),
    _id: undefined,
    __v: undefined,
  }));

  res.json({
    success: true,
    data: transformed,
    meta: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

// ── GET /api/products/:slug ──────────────────────────
export const getProductBySlug = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await Product.findOne({ slug: req.params.slug });

    if (!product) {
      const byId = await Product.findById(req.params.slug).catch(() => null);
      if (!byId) {
        throw new ApiError(404, "Product not found");
      }
      res.json({ success: true, data: byId });
      return;
    }

    res.json({ success: true, data: product });
  },
);

// ── POST /api/products ───────────────────────────────
export const createProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const { images } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      throw new ApiError(400, "At least one product image is required");
    }

    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  },
);

// ── PUT /api/products/:id ────────────────────────────
export const updateProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const { removedImages, images: newImages, ...updateData } = req.body;

    // 1. Fetch existing product first
    const product = await Product.findById(req.params.id);
    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    // 2. Handle image removals if specified
    if (removedImages && Array.isArray(removedImages)) {
      for (const publicId of removedImages) {
        // Delete from Cloudinary
        await deleteFromCloudinary(publicId);
        // Remove from local array
        product.images = product.images.filter(
          (img) => img.publicId !== publicId,
        );
      }
    }

    // 3. Handle new images if specified
    if (newImages && Array.isArray(newImages)) {
      // Overwrite with the latest state from frontend to prevent duplication
      product.images = newImages;
    }

    // Ensure at least one image remains
    if (product.images.length === 0) {
      throw new ApiError(400, "Product must have at least one image");
    }

    // 4. Update other fields
    Object.assign(product, updateData);

    // Save updated product
    await product.save();

    res.json({ success: true, data: product });
  },
);

// ── DELETE /api/products/:id ─────────────────────────
export const deleteProduct = asyncHandler(
  async (req: Request, res: Response) => {
    // 1. Fetch product first
    const product = await Product.findById(req.params.id);

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    // 2. Cleanup Cloudinary images
    if (product.images && product.images.length > 0) {
      const deletePromises = product.images.map((img) =>
        deleteFromCloudinary(img.publicId),
      );
      // Wait for deletions (handled gracefully by deleteFromCloudinary)
      await Promise.all(deletePromises);
    }

    // 3. Delete Mongo document
    await Product.findByIdAndDelete(req.params.id);

    res.json({ success: true, data: null });
  },
);

// ── DELETE /api/products/bulk ────────────────────────
export const bulkDeleteProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      throw new ApiError(400, "Please provide an array of product IDs");
    }

    // Fetch all products to clean up images
    const products = await Product.find({ _id: { $in: ids } });

    for (const product of products) {
      if (product.images && product.images.length > 0) {
        const deletePromises = product.images.map((img) =>
          deleteFromCloudinary(img.publicId),
        );
        await Promise.all(deletePromises);
      }
    }

    await Product.deleteMany({ _id: { $in: ids } });

    res.json({ success: true, data: null });
  },
);

// ── GET /api/products/stats ──────────────────────────
export const getStats = asyncHandler(async (_req: Request, res: Response) => {
  const [totalProducts, totalCategories] = await Promise.all([
    Product.countDocuments(),
    Category.countDocuments(),
  ]);

  const stats = [
    {
      label: "Total Products",
      value: totalProducts.toLocaleString(),
      change: "+5.2%",
      isPositive: true,
      icon: "inventory_2",
    },
    {
      label: "Total Clicks",
      value: "42,892",
      change: "+12.4%",
      isPositive: true,
      icon: "ads_click",
    },
    {
      label: "Conversion Rate",
      value: "3.64%",
      change: "-2.1%",
      isPositive: false,
      icon: "auto_graph",
    },
    {
      label: "Total Revenue",
      value: "$12,450",
      change: "+8.9%",
      isPositive: true,
      icon: "payments",
    },
  ];

  res.json({ success: true, data: stats });
});
