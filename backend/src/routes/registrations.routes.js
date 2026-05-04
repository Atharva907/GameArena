import { Router } from "express";
import {
  checkRegistration,
  listMyTournaments,
  listRegistrations,
  registerForTournament,
} from "../controllers/tournaments.controller.js";
import { authenticate, requireSelfOrAdmin } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post("/registration", requireSelfOrAdmin("playerEmail"), asyncHandler(registerForTournament));
router.get("/registration/check", requireSelfOrAdmin("email"), asyncHandler(checkRegistration));
router.get("/player/registrations", authenticate, asyncHandler(listMyTournaments));
router.get("/registrations", requireSelfOrAdmin("email"), asyncHandler(listRegistrations));

export default router;
