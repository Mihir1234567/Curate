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
 * Upload a buffer to Cloudinary and return the secure URL.
 */
export const uploadToCloudinary = (
  buffer: Buffer,
  folder: string = "curate",
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      },
      (error, result) => {
        if (error || !result) {
          reject(new ApiError(500, "Image upload failed"));
          return;
        }
        resolve(result.secure_url);
      },
    );
    stream.end(buffer);
  });
};
