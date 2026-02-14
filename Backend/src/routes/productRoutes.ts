import { Router } from "express";
import {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts,
  getStats,
} from "../controllers/productController";
import { validate } from "../middlewares/validate";
import { requireAdminAuth } from "../middlewares/auth";

const router = Router();

// ── Public ───────────────────────────────────────────
router.get("/stats", getStats);
router.get("/", getProducts);
router.get("/:slug", getProductBySlug);

// ── Protected (Admin) ────────────────────────────────
router.post(
  "/",
  requireAdminAuth,
  validate([
    { field: "name", required: true, type: "string", maxLength: 200 },
    { field: "price", required: true, type: "number", min: 0 },
    { field: "category", required: true, type: "array" },
    { field: "image", required: true, type: "string" },
    { field: "description", required: true, type: "string", maxLength: 2000 },
  ]),
  createProduct,
);

router.put("/:id", requireAdminAuth, updateProduct);
router.delete("/bulk", requireAdminAuth, bulkDeleteProducts);
router.delete("/:id", requireAdminAuth, deleteProduct);

export default router;
