import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof ApiError) {
    if (err.statusCode >= 500) {
      console.error(`ApiError ${err.statusCode}:`, err.message);
    }
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    res.status(400).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Mongoose cast error (bad ObjectId)
  if (err.name === "CastError") {
    res.status(400).json({
      success: false,
      message: "Invalid ID format",
    });
    return;
  }

  // Multer errors (e.g. file too large)
  if (err.name === "MulterError") {
    let message = err.message;
    if ((err as any).code === "LIMIT_FILE_SIZE") {
      message = "File size too large (max 5MB)";
    }
    res.status(400).json({
      success: false,
      message,
    });
    return;
  }

  // Duplicate key error
  if ((err as any).code === 11000) {
    res.status(409).json({
      success: false,
      message: "Duplicate entry — a record with this value already exists",
    });
    return;
  }

  if (res.statusCode === 500) {
    console.error("Unhandled error:", err);
  }
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
