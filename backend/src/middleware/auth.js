import { jwtVerify } from "jose";
import { env } from "../config/env.js";
import { findUserById } from "../lib/accountStore.js";

const unauthorized = (message = "Authentication required.") => {
  const error = new Error(message);
  error.statusCode = 401;
  return error;
};

const forbidden = (message = "Forbidden.") => {
  const error = new Error(message);
  error.statusCode = 403;
  return error;
};

const serviceUnavailable = (message = "Authentication service unavailable.") => {
  const error = new Error(message);
  error.statusCode = 503;
  return error;
};

const normalizeComparableEmail = (value) => String(value || "").trim().toLowerCase();

export async function authenticate(req, res, next) {
  try {
    const token =
      req.cookies?.token ||
      req.cookies?.access_token ||
      req.headers.authorization?.replace(/^Bearer\s+/i, "");

    if (!token) {
      throw unauthorized();
    }

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(env.secretKey),
    );

    const userId = payload.id || payload._id || payload.userId;
    if (!userId) {
      throw unauthorized();
    }

    try {
      const user = await findUserById(userId);

      if (!user || user.deletedAt) {
        throw unauthorized();
      }

      const tokenVersion = Number(payload.sv ?? payload.sessionVersion ?? 0);
      const currentVersion = Number(user.sessionVersion ?? 0);

      if (tokenVersion !== currentVersion) {
        throw unauthorized("Session expired. Please log in again.");
      }

      req.user = {
        id: user.id.toString(),
        email: user.email,
        role: user.role || "user",
        isEmailVerified: user.isEmailVerified,
        sessionVersion: currentVersion,
      };
    } catch (error) {
      if (error.statusCode === 401 || error.statusCode === 403) {
        throw error;
      }

      throw serviceUnavailable();
    }

    next();
  } catch (error) {
    if (error.statusCode === 401 || error.statusCode === 403 || error.statusCode === 503) {
      next(error);
      return;
    }

    next(unauthorized(error.message || "Authentication failed."));
  }
}

export const requireRole = (role = "admin") => [
  authenticate,
  (req, res, next) => {
    if (req.user?.role !== role) {
      next(forbidden("Unauthorized."));
      return;
    }

    next();
  },
];

export const requireSelfOrAdmin = (emailParam = "email") => [
  authenticate,
  (req, res, next) => {
    const requestedEmail =
      req.params[emailParam] || req.query[emailParam] || req.body?.[emailParam];

    if (
      req.user?.role === "admin" ||
      normalizeComparableEmail(req.user?.email) === normalizeComparableEmail(requestedEmail)
    ) {
      next();
      return;
    }

    next(forbidden());
  },
];
