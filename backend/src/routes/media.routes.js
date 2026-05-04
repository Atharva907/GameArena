import { Router } from "express";
import multer from "multer";
import {
  createMedia,
  deleteMediaAsset,
  listMediaAssets,
  uploadMediaAsset,
} from "../controllers/media.controller.js";
import { requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

router.get("/library", requireRole("admin"), asyncHandler(listMediaAssets));
router.post(
  "/upload",
  requireRole("admin"),
  upload.single("file"),
  asyncHandler(uploadMediaAsset),
);
router.delete("/delete", requireRole("admin"), asyncHandler(deleteMediaAsset));
router.post("/delete", requireRole("admin"), asyncHandler(deleteMediaAsset));
router.post("/create", requireRole("admin"), asyncHandler(createMedia));

export default router;
