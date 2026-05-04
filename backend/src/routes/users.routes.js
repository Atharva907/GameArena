import { Router } from "express";
import {
  createUser,
  deleteUser,
  listUsers,
  updateUser,
} from "../controllers/users.controller.js";
import { requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", requireRole("admin"), asyncHandler(listUsers));
router.post("/", requireRole("admin"), asyncHandler(createUser));
router.put("/", requireRole("admin"), asyncHandler(updateUser));
router.delete("/", requireRole("admin"), asyncHandler(deleteUser));

export default router;
