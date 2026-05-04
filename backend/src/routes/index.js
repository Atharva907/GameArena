import { Router } from "express";
import adminRoutes from "./admin.routes.js";
import authRoutes from "./auth.routes.js";
import commerceRoutes from "./commerce.routes.js";
import healthRoutes from "./health.routes.js";
import mediaRoutes from "./media.routes.js";
import playerRoutes from "./player.routes.js";
import registrationRoutes from "./registrations.routes.js";
import tournamentRoutes from "./tournaments.routes.js";
import userRoutes from "./user.routes.js";
import usersRoutes from "./users.routes.js";
import walletRoutes from "./wallet.routes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use(adminRoutes);
router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/users", usersRoutes);
router.use(playerRoutes);
router.use("/tournaments", tournamentRoutes);
router.use(registrationRoutes);
router.use(walletRoutes);
router.use(commerceRoutes);
router.use("/media", mediaRoutes);

router.get("/", (req, res) => {
  res.json({
    name: "GameArena Backend API",
    status: "ok",
    version: "0.1.0",
  });
});

export default router;
