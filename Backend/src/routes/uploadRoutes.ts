import { Router, Request, Response } from "express";
import { upload, uploadToCloudinary } from "../services/uploadService";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { requireAdminAuth } from "../middlewares/auth";

const router = Router();

// ── Protected (Admin) ────────────────────────────────
router.post(
  "/",
  requireAdminAuth,
  upload.single("image"),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new ApiError(400, "No image file provided");
    }

    const folder = (req.query.folder as string) || "curate";
    const url = await uploadToCloudinary(req.file.buffer, folder);

    res.status(201).json({
      success: true,
      data: { url },
    });
  }),
);

export default router;
