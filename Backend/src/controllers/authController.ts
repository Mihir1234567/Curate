import { Request, Response } from "express";
import { Admin } from "../models/Admin";
import { generateToken } from "../utils/jwt";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  // Find admin by email
  const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
  if (!admin) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Compare password
  const isMatch = await admin.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Generate JWT
  const token = generateToken(admin._id.toString());

  res.json({
    success: true,
    data: {
      token,
      admin: {
        id: admin._id.toString(),
        email: admin.email,
      },
    },
  });
});

// GET /api/auth/me — verify token and return admin info
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  // req.admin is set by requireAdminAuth middleware
  const admin = (req as Request & { admin: { id: string; email: string } })
    .admin;

  res.json({
    success: true,
    data: admin,
  });
});
