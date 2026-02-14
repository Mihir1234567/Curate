import { Router } from "express";
import {
  getFeedback,
  createFeedback,
  updateFeedbackStatus,
  deleteFeedback,
} from "../controllers/feedbackController";
import { validate } from "../middlewares/validate";
import { requireAdminAuth } from "../middlewares/auth";

const router = Router();

// ── Public ───────────────────────────────────────────
router.post(
  "/",
  validate([
    { field: "name", required: true, type: "string", maxLength: 100 },
    { field: "email", required: true, type: "string" },
    { field: "message", required: true, type: "string", maxLength: 2000 },
    { field: "rating", required: true, type: "number", min: 1, max: 5 },
  ]),
  createFeedback,
);

// ── Protected (Admin) ────────────────────────────────
router.get("/", requireAdminAuth, getFeedback);
router.patch("/:id/status", requireAdminAuth, updateFeedbackStatus);
router.delete("/:id", requireAdminAuth, deleteFeedback);

export default router;
