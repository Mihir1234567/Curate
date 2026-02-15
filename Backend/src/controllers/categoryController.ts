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
          let: { catName: "$name" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: [
                    { $toLower: "$$catName" },
                    {
                      $map: {
                        input: "$category",
                        as: "c",
                        in: { $toLower: "$$c" },
                      },
                    },
                  ],
                },
              },
            },
          ],
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
            $size: {
              $setUnion: [
                { $ifNull: ["$productIds", []] },
                { $ifNull: ["$autoProducts._id", []] },
              ],
            },
          },
        },
      },
      { $sort: { name: 1 } },
    ]);
    console.log(
      `[getCategories] Found ${categories.length} categories. Active counts:`,
      categories.map((c) => ({ name: c.name, count: c.productCount })),
    );

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
      imageUrl =
        product.images.find((img) => img.isMain)?.url || product.images[0]?.url;
      imageSource = "product";
    }

    const category = await Category.create({
      name,
      imageUrl,
      imageSource,
      featuredProductId,
      productIds,
    });

    // SYNC: Add category name to all linked products
    if (productIds && productIds.length > 0) {
      await Product.updateMany(
        { _id: { $in: productIds } },
        { $addToSet: { category: name } },
      );
    }

    res.status(201).json({
      success: true,
      data: category,
    });
  },
);

export const updateCategory = asyncHandler(
  async (req: Request, res: Response) => {
    // 1. Fetch old state for sync
    const oldCategory = await Category.findById(req.params.id);
    if (!oldCategory) {
      throw new ApiError(404, "Category not found");
    }

    const oldName = oldCategory.name;
    const oldProductIds = (oldCategory.productIds || []).map((id) =>
      id.toString(),
    );

    let updateData: any = { name, productIds };
    // ... rest of updateData logic (featured product, etc.)
    if (imageUploadUrl) {
      updateData.imageUrl = imageUploadUrl;
      updateData.imageSource = "upload";
    }

    if (featuredProductId) {
      const product = await Product.findById(featuredProductId);
      if (!product) {
        throw new ApiError(404, "Featured product not found");
      }
      updateData.imageUrl =
        product.images.find((img) => img.isMain)?.url || product.images[0]?.url;
      updateData.imageSource = "product";
      updateData.featuredProductId = featuredProductId;
    } else if (featuredProductId === null) {
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

    // SYNC LOGIC
    // A. If name changed, update all products that had the old name
    if (name && name !== oldName) {
      await Product.updateMany(
        { category: oldName },
        { $set: { "category.$[elem]": name } },
        { arrayFilters: [{ elem: oldName }] },
      );
    }

    // B. If productIds changed
    const newProductIds = (productIds || []).map((id: string) => id.toString());

    // 1. Products added to this category
    const added = newProductIds.filter(
      (id: string) => !oldProductIds.includes(id),
    );
    if (added.length > 0) {
      await Product.updateMany(
        { _id: { $in: added } },
        { $addToSet: { category: category.name } },
      );
    }

    // 2. Products removed from this category
    const removed = oldProductIds.filter((id) => !newProductIds.includes(id));
    if (removed.length > 0) {
      await Product.updateMany(
        { _id: { $in: removed } },
        { $pull: { category: category.name } },
      );
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

    // SYNC: Remove category name from all products
    await Product.updateMany(
      { category: category.name },
      { $pull: { category: category.name } },
    );

    res.json({
      success: true,
      data: null,
    });
  },
);
