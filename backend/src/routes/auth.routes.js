import { Router } from "express";
import {
  login,
  logout,
  register,
  resendOtp,
  sendResetOtp,
  updatePassword,
  verifyEmail,
  verifyOtp,
  verifyResetOtp,
} from "../controllers/auth.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.post("/verify-otp", asyncHandler(verifyOtp));
router.post("/resend-otp", asyncHandler(resendOtp));
router.post("/verify-email", asyncHandler(verifyEmail));
router.post("/logout", logout);
router.post("/reset-password/send-otp", asyncHandler(sendResetOtp));
router.post("/reset-password/verify-otp", asyncHandler(verifyResetOtp));
router.post("/reset-password/update-password", asyncHandler(updatePassword));

export default router;
