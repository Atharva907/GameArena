import { Router } from "express";
import {
  createTournament,
  deleteTournament,
  generateMatches,
  getStandings,
  getTournament,
  listMatches,
  listTournaments,
  updateMatch,
  updateTournament,
} from "../controllers/tournaments.controller.js";
import { requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(listTournaments));
router.post("/", requireRole("admin"), asyncHandler(createTournament));
router.put("/", requireRole("admin"), asyncHandler(updateTournament));
router.delete("/", requireRole("admin"), asyncHandler(deleteTournament));
router.get("/:id", asyncHandler(getTournament));
router.get("/:id/matches", asyncHandler(listMatches));
router.post("/:id/matches", requireRole("admin"), asyncHandler(generateMatches));
router.patch("/:id/matches/:matchId", requireRole("admin"), asyncHandler(updateMatch));
router.get("/:id/standings", asyncHandler(getStandings));

export default router;
