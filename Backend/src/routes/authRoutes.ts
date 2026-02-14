import { Router } from "express";
import { login, getMe } from "../controllers/authController";
import { requireAdminAuth } from "../middlewares/auth";

const router = Router();

router.post("/login", login);
router.get("/me", requireAdminAuth, getMe);

export default router;
