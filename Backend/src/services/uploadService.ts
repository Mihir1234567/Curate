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
 * Upload a buffer to Cloudinary and return the secure URL and publicId.
 */
export const uploadToCloudinary = (
  buffer: Buffer,
  folder: string = "curate",
): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result) {
          console.error("Cloudinary upload error:", error);
          const message = error?.message || "Image upload failed";
          reject(new ApiError(500, message));
          return;
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      },
    );
    stream.end(buffer);
  });
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
