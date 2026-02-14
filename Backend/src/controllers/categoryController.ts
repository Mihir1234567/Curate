import { Request, Response } from "express";
import { Product } from "../models/Product";
import { Category } from "../models/Category";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

// ── GET /api/categories ──────────────────────────────
export const getCategories = asyncHandler(
  async (_req: Request, res: Response) => {
    // We use aggregation to count products in each category
    const categories = await Category.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "name",
          foreignField: "category",
          as: "autoProducts",
        },
      },
      {
        $project: {
          id: "$_id",
          _id: 1,
          name: 1,
          slug: 1,
          image: 1,
          imageUrl: 1,
          imageSource: 1,
          featuredProductId: 1,
          productIds: 1,
          allProductIds: {
            $setUnion: [
              { $ifNull: ["$productIds", []] },
              { $ifNull: ["$autoProducts._id", []] },
            ],
          },
          productCount: {
            $add: [
              { $size: "$autoProducts" },
              { $size: { $ifNull: ["$productIds", []] } },
            ],
          },
        },
      },
      { $sort: { name: 1 } },
    ]);

    // Ensure _id is stringified for frontend id field
    const transformed = categories.map((cat: any) => ({
      ...cat,
      id: cat._id.toString(),
    }));

    res.json({
      success: true,
      data: transformed,
    });
  },
);

export const createCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, imageUploadUrl, featuredProductId, productIds } = req.body;

    const existing = await Category.findOne({ name });
    if (existing) {
      throw new ApiError(400, "Category with this name already exists");
    }

    let imageUrl = imageUploadUrl;
    let imageSource: "upload" | "product" | null = imageUploadUrl
      ? "upload"
      : null;

    if (featuredProductId) {
      const product = await Product.findById(featuredProductId);
      if (!product) {
        throw new ApiError(404, "Featured product not found");
      }
      imageUrl = product.image;
      imageSource = "product";
    }

    const category = await Category.create({
      name,
      imageUrl,
      imageSource,
      featuredProductId,
      productIds,
      image: imageUrl, // Maintain legacy image field
    });

    res.status(201).json({
      success: true,
      data: category,
    });
  },
);

export const updateCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, imageUploadUrl, featuredProductId, productIds } = req.body;

    let updateData: any = { name, productIds };

    if (imageUploadUrl) {
      updateData.imageUrl = imageUploadUrl;
      updateData.imageSource = "upload";
      updateData.image = imageUploadUrl;
    }

    if (featuredProductId) {
      const product = await Product.findById(featuredProductId);
      if (!product) {
        throw new ApiError(404, "Featured product not found");
      }
      updateData.imageUrl = product.image;
      updateData.imageSource = "product";
      updateData.featuredProductId = featuredProductId;
      updateData.image = product.image;
    } else if (featuredProductId === null) {
      // If explicitly null, remove featured product and source if not uploading
      updateData.featuredProductId = null;
      if (!imageUploadUrl) {
        updateData.imageSource = null;
      }
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!category) {
      throw new ApiError(404, "Category not found");
    }

    res.json({
      success: true,
      data: category,
    });
  },
);

// ── DELETE /api/categories/:id ───────────────────────
export const deleteCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      throw new ApiError(404, "Category not found");
    }

    res.json({
      success: true,
      data: null,
    });
  },
);
