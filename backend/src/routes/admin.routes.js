import { Router } from "express";
import { getAdminOverview } from "../controllers/admin.controller.js";
import { requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/admin/overview", requireRole("admin"), asyncHandler(getAdminOverview));

export default router;
