import { Router } from "express";
import { getWallet, updateWallet } from "../controllers/wallet.controller.js";
import { requireSelfOrAdmin } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/wallet", requireSelfOrAdmin("email"), asyncHandler(getWallet));
router.post("/wallet", requireSelfOrAdmin("email"), asyncHandler(updateWallet));
router.get("/players/wallet", requireSelfOrAdmin("email"), asyncHandler(getWallet));
router.post("/players/wallet", requireSelfOrAdmin("email"), asyncHandler(updateWallet));

export default router;
