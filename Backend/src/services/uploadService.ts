import multer from "multer";
import { cloudinary } from "../config/cloudinary";
import { ApiError } from "../utils/ApiError";

// Multer memory storage — files stay in RAM buffer (no temp disk writes)
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new ApiError(400, "Only image files are allowed"));
    }
  },
});

/**
 * Upload a Base64 string to Cloudinary and return the secure URL and publicId.
 */
export const uploadToCloudinary = async (
  base64Image: string,
  folder: string = "curate",
): Promise<{ url: string; publicId: string }> => {
  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder,
      resource_type: "image",
    });
    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error: any) {
    console.error("Cloudinary upload error:", error);
    const message = error?.message || "Image upload failed";
    throw new ApiError(500, message);
  }
};

/**
 * Delete an image from Cloudinary by publicId.
 */
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    // We log but don't necessarily throw to avoid breaking the whole process
    // if a cleanup fails, but the user requested handling specific failures
    console.error(`Failed to delete image: ${publicId}`, error);
    // In some cases we might want to throw, but for deletion we usually proceed
  }
};
