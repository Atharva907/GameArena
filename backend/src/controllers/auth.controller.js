import bcrypt from "bcryptjs";
import { jwtVerify, SignJWT } from "jose";
import { env, isProduction } from "../config/env.js";
import {
  createOtpRecord,
  createUserRecord,
  deleteOtpRecord,
  deleteOtpsByEmail,
  findValidOtpRecord,
  findUserByEmail,
  findUserById,
  updateUserRecord,
} from "../lib/accountStore.js";
import { sendMail } from "../lib/mail.js";
import { enforceRateLimit } from "../lib/rateLimit.js";
import { emailVerificationLink, otpEmail } from "../templates/authEmails.js";
import { apiResponse, generateOTP, sanitizeUser } from "../utils/response.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function requireFields(payload, fields) {
  for (const field of fields) {
    if (!String(payload?.[field] || "").trim()) {
      const error = new Error("Invalid or missing input field.");
      error.statusCode = 400;
      throw error;
    }
  }
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function getSecret() {
  return new TextEncoder().encode(env.secretKey);
}

function getFrontendBaseUrl(req) {
  return env.frontendOrigins[0] || `${req.protocol}://${req.get("host")}`;
}

async function createEmailVerificationToken(userId) {
  return new SignJWT({ userId: userId.toString() })
    .setIssuedAt()
    .setExpirationTime("1h")
    .setProtectedHeader({ alg: "HS256" })
    .sign(getSecret());
}

async function createSessionToken(user) {
  return new SignJWT({
    email: user.email,
    id: user.id.toString(),
    role: user.role,
    sv: Number(user.sessionVersion || 0),
  })
    .setIssuedAt()
    .setExpirationTime("24h")
    .setProtectedHeader({ alg: "HS256" })
    .sign(getSecret());
}

function setAuthCookie(res, token) {
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
    maxAge: 24 * 60 * 60 * 1000,
  });
}

export async function register(req, res) {
  requireFields(req.body, ["name", "email", "password"]);

  const name = String(req.body.name).trim();
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password);

  if (!emailPattern.test(email) || password.length < 6) {
    return apiResponse(res, false, 400, "Invalid or missing input field.");
  }

  enforceRateLimit(req, "auth:register", email, 5, 60 * 60 * 1000);

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    return apiResponse(res, false, 409, "User already registered");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await createUserRecord({
    name,
    email,
    password: hashedPassword,
    isEmailVerified: false,
  });

  const token = await createEmailVerificationToken(user.id);
  const verificationUrl = `${getFrontendBaseUrl(req)}/auth/verify-email/${token}`;
  const mailStatus = await sendMail(
    "Email Verification Request from GameArena",
    email,
    emailVerificationLink(verificationUrl),
  );

  if (!mailStatus.success) {
    return apiResponse(res, true, 201, "Account created, but we could not send the verification email. Please log in to resend it.", {
      emailSent: false,
    });
  }

  return apiResponse(res, true, 201, "Registration success, please verify your email address.", {
    emailSent: true,
  });
}

export async function login(req, res) {
  requireFields(req.body, ["email", "password"]);

  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password).trim();

  enforceRateLimit(req, "auth:login", email, 5, 10 * 60 * 1000);

  const user = await findUserByEmail(email, { includePassword: true });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return apiResponse(res, false, 401, "Invalid login credentials.");
  }

  if (!user.isEmailVerified) {
    const token = await createEmailVerificationToken(user.id);
    const verificationUrl = `${getFrontendBaseUrl(req)}/auth/verify-email/${token}`;
    const mailStatus = await sendMail(
      "Email Verification request from GameArena",
      email,
      emailVerificationLink(verificationUrl),
    );

    if (!mailStatus.success) {
      return apiResponse(
        res,
        false,
        401,
        "Your email is not verified, and we could not send a verification link right now.",
      );
    }

    return apiResponse(
      res,
      false,
      401,
      "Your email is not verified. We have sent a verification link to your registered email address.",
    );
  }

  await deleteOtpsByEmail(email);
  const otp = generateOTP();
  await createOtpRecord(email, otp, { purpose: "LOGIN" });

  const otpStatus = await sendMail(
    "Your login verification code",
    email,
    otpEmail(otp),
  );

  if (!otpStatus.success) {
    return apiResponse(res, false, 400, "Failed to send OTP.");
  }

  return apiResponse(res, true, 200, "Please verify your device.");
}

export async function verifyOtp(req, res) {
  requireFields(req.body, ["email", "otp"]);

  const email = normalizeEmail(req.body.email);
  const otp = String(req.body.otp).trim();

  enforceRateLimit(req, "auth:verify-otp", email, 10, 10 * 60 * 1000);

  const otpRecord = await findValidOtpRecord(email, otp, { purpose: "LOGIN" });

  if (!otpRecord) {
    return apiResponse(res, false, 404, "Invalid or expired OTP.");
  }

  const user = await findUserByEmail(email);
  if (!user) {
    return apiResponse(res, false, 404, "User not found.");
  }

  const token = await createSessionToken(user);
  await deleteOtpRecord(otpRecord);
  setAuthCookie(res, token);

  return apiResponse(res, true, 200, "OTP verified successfully.", {
    ...sanitizeUser(user),
    token,
  });
}

export async function resendOtp(req, res) {
  requireFields(req.body, ["email"]);

  const email = normalizeEmail(req.body.email);
  enforceRateLimit(req, "auth:resend-otp", email, 3, 10 * 60 * 1000);

  const user = await findUserByEmail(email);
  if (!user) {
    return apiResponse(res, false, 404, "User not found.");
  }

  if (!user.isEmailVerified) {
    return apiResponse(
      res,
      false,
      400,
      "Email is not verified. Please verify your email first.",
    );
  }

  await deleteOtpsByEmail(email);
  const otp = generateOTP();
  await createOtpRecord(email, otp, { purpose: "LOGIN" });

  const mailStatus = await sendMail(
    "Your login verification code",
    email,
    otpEmail(otp),
  );

  if (!mailStatus.success) {
    return apiResponse(res, false, 500, "Failed to send OTP.");
  }

  return apiResponse(res, true, 200, "OTP sent successfully.");
}

export async function sendResetOtp(req, res) {
  requireFields(req.body, ["email"]);

  const email = normalizeEmail(req.body.email);
  enforceRateLimit(req, "auth:reset-send", email, 3, 10 * 60 * 1000);

  const user = await findUserByEmail(email);
  if (!user) {
    return apiResponse(res, false, 404, "User not found.");
  }

  await deleteOtpsByEmail(email, { purpose: "PASSWORD_RESET" });
  const otp = generateOTP();
  await createOtpRecord(email, otp, {
    purpose: "PASSWORD_RESET",
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });

  const mailStatus = await sendMail(
    "Your verification code",
    email,
    otpEmail(otp),
  );

  if (!mailStatus.success) {
    return apiResponse(res, false, 500, "Failed to send OTP.");
  }

  return apiResponse(res, true, 200, "OTP sent successfully.");
}

export async function verifyResetOtp(req, res) {
  requireFields(req.body, ["email", "otp"]);

  const email = normalizeEmail(req.body.email);
  const otp = String(req.body.otp).trim();
  enforceRateLimit(req, "auth:reset-verify", email, 10, 10 * 60 * 1000);

  const otpRecord = await findValidOtpRecord(email, otp, {
    purpose: "PASSWORD_RESET",
  });

  if (!otpRecord) {
    return apiResponse(res, false, 404, "Invalid or expired OTP.");
  }

  const user = await findUserByEmail(email);
  if (!user) {
    return apiResponse(res, false, 404, "User not found.");
  }

  const resetToken = await new SignJWT({
    email,
    userId: user.id.toString(),
    sv: Number(user.sessionVersion || 0),
    purpose: "password-reset",
  })
    .setIssuedAt()
    .setExpirationTime("15m")
    .setProtectedHeader({ alg: "HS256" })
    .sign(getSecret());

  await deleteOtpRecord(otpRecord);

  return apiResponse(res, true, 200, "OTP verified successfully.", {
    resetToken,
  });
}

export async function updatePassword(req, res) {
  requireFields(req.body, ["email", "password", "token"]);

  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password);
  const token = String(req.body.token);
  enforceRateLimit(req, "auth:reset-update", email, 5, 10 * 60 * 1000);

  let payload;
  try {
    const verified = await jwtVerify(token, getSecret());
    payload = verified.payload;
  } catch {
    return apiResponse(res, false, 400, "Invalid or expired reset token.");
  }

  const user = await findUserByEmail(email, { includePassword: true });
  if (!user) {
    return apiResponse(res, false, 404, "User not found.");
  }

  if (
    payload.email !== email ||
    payload.purpose !== "password-reset" ||
    payload.userId !== user.id.toString()
  ) {
    return apiResponse(res, false, 400, "Reset token does not match this account.");
  }

  const tokenVersion = Number(payload.sv ?? 0);
  const currentVersion = Number(user.sessionVersion ?? 0);
  if (tokenVersion !== currentVersion) {
    return apiResponse(res, false, 400, "Invalid or expired reset token.");
  }

  if (user.password && (await bcrypt.compare(password, user.password))) {
    return apiResponse(
      res,
      false,
      400,
      "New password cannot be the same as the previous password.",
    );
  }

  await updateUserRecord(user.id, {
    password: await bcrypt.hash(password, 10),
    sessionVersion: currentVersion + 1,
  });
  await deleteOtpsByEmail(email);

  return apiResponse(res, true, 200, "Password updated successfully.");
}

export async function verifyEmail(req, res) {
  const token = String(req.body?.token || "").trim();

  if (!token) {
    return apiResponse(res, false, 400, "Missing token.");
  }

  let decoded;
  try {
    decoded = await jwtVerify(decodeURIComponent(token), getSecret());
  } catch {
    return apiResponse(res, false, 400, "Invalid or expired token.");
  }

  const userId = decoded.payload.userId;

  const user = await findUserById(userId);
  if (!user) {
    return apiResponse(res, false, 404, "User not found.");
  }

  if (user.isEmailVerified) {
    return apiResponse(res, true, 200, "Email is already verified.");
  }

  await updateUserRecord(user.id, { isEmailVerified: true });

  return apiResponse(res, true, 200, "Email verification successful.");
}

export function logout(req, res) {
  res.clearCookie("token", { path: "/" });
  res.clearCookie("access_token", { path: "/" });
  return apiResponse(res, true, 200, "Logout successful.");
}

export async function me(req, res) {
  const user = await findUserById(req.user.id);

  if (!user) {
    return apiResponse(res, false, 404, "User not found");
  }

  return apiResponse(
    res,
    true,
    200,
    "User data retrieved successfully",
    sanitizeUser(user),
  );
}
