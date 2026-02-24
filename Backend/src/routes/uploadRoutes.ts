import { Router, Request, Response } from "express";
import { uploadToCloudinary } from "../services/uploadService";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { requireAdminAuth } from "../middlewares/auth";

const router = Router();

// ── Protected (Admin) ────────────────────────────────
router.post(
  "/",
  requireAdminAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const images: string[] = req.body.images;

    console.log(`📸 Uploading ${images?.length || 0} base64 images`);

    if (!images || !Array.isArray(images) || images.length === 0) {
      throw new ApiError(400, "No image data provided");
    }

    const folder = (req.query.folder as string) || "curate";

    const uploadPromises = images.map((base64String) =>
      uploadToCloudinary(base64String, folder),
    );

    const results = await Promise.all(uploadPromises);

    res.status(201).json({
      success: true,
      data: results, // Returns array of { url, publicId }
    });
  }),
);

export default router;
