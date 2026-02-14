import { Request, Response } from "express";
import { Feedback } from "../models/Feedback";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

// ── GET /api/feedback ────────────────────────────────
// Supports: ?status, ?search, ?sort
export const getFeedback = asyncHandler(async (req: Request, res: Response) => {
  const { status, search, sort = "newest" } = req.query;

  const filter: Record<string, unknown> = {};

  if (status && status !== "all") {
    filter.status = status;
  }

  if (search) {
    const searchRegex = new RegExp(search as string, "i");
    filter.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { message: searchRegex },
    ];
  }

  let sortObj: Record<string, 1 | -1> = { createdAt: -1 };
  switch (sort) {
    case "oldest":
      sortObj = { createdAt: 1 };
      break;
    case "rating-high":
      sortObj = { rating: -1 };
      break;
    case "rating-low":
      sortObj = { rating: 1 };
      break;
    case "newest":
    default:
      sortObj = { createdAt: -1 };
      break;
  }

  const feedbacks = await Feedback.find(filter).sort(sortObj);

  res.json({ success: true, data: feedbacks });
});

// ── POST /api/feedback ───────────────────────────────
export const createFeedback = asyncHandler(
  async (req: Request, res: Response) => {
    const feedback = await Feedback.create(req.body);
    res.status(201).json({ success: true, data: feedback });
  },
);

// ── PATCH /api/feedback/:id/status ───────────────────
export const updateFeedbackStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { status } = req.body;

    if (!["new", "reviewed"].includes(status)) {
      throw new ApiError(400, "Status must be 'new' or 'reviewed'");
    }

    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true },
    );

    if (!feedback) {
      throw new ApiError(404, "Feedback not found");
    }

    res.json({ success: true, data: feedback });
  },
);

// ── DELETE /api/feedback/:id ─────────────────────────
export const deleteFeedback = asyncHandler(
  async (req: Request, res: Response) => {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);

    if (!feedback) {
      throw new ApiError(404, "Feedback not found");
    }

    res.json({ success: true, data: null });
  },
);
