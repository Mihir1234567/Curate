import { Router } from "express";
import { getAnalytics } from "../controllers/analyticsController";
import { requireAdminAuth } from "../middlewares/auth";

const router = Router();

// ── Protected (Admin) ────────────────────────────────
router.get("/", requireAdminAuth, getAnalytics);

export default router;
