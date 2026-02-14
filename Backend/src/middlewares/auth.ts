import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { Admin } from "../models/Admin";
import { ApiError } from "../utils/ApiError";

/**
 * Middleware that verifies JWT from Authorization header.
 * Attaches admin info to req.admin.
 */
export const requireAdminAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Authentication required");
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    // Verify admin still exists
    const admin = await Admin.findById(decoded.id).select("-passwordHash");
    if (!admin) {
      throw new ApiError(401, "Admin account no longer exists");
    }

    // Attach admin to request
    (req as Request & { admin: { id: string; email: string } }).admin = {
      id: admin._id.toString(),
      email: admin.email,
    };

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError(401, "Invalid or expired token"));
    }
  }
};
