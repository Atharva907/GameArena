import { Router } from "express";
import {
  createPlayerProfile,
  getPlayerProfile,
  updatePlayerProfile,
} from "../controllers/player.controller.js";
import { requireSelfOrAdmin } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/player", requireSelfOrAdmin("email"), asyncHandler(getPlayerProfile));
router.post("/player", requireSelfOrAdmin("email"), asyncHandler(createPlayerProfile));
router.put("/player", requireSelfOrAdmin("email"), asyncHandler(updatePlayerProfile));

export default router;
