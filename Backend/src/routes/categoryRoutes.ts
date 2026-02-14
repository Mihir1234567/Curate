import { Router } from "express";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController";
import { validate } from "../middlewares/validate";
import { requireAdminAuth } from "../middlewares/auth";

const router = Router();

// ── Public ───────────────────────────────────────────
router.get("/", getCategories);

// ── Protected (Admin) ────────────────────────────────
router.post(
  "/",
  requireAdminAuth,
  validate([{ field: "name", required: true, type: "string", maxLength: 100 }]),
  createCategory,
);

router.put(
  "/:id",
  requireAdminAuth,
  validate([{ field: "name", required: true, type: "string", maxLength: 100 }]),
  updateCategory,
);

router.delete("/:id", requireAdminAuth, deleteCategory);

export default router;
