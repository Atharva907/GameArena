import { randomInt } from "node:crypto";

export const apiResponse = (res, success, statusCode, message, data = {}) =>
  res.status(statusCode).json({
    success,
    statusCode,
    message,
    data,
  });

export const generateOTP = () =>
  randomInt(100000, 1000000).toString();

export function sanitizeUser(user) {
  if (!user) return null;

  const id = String(user.id || user._id || "");
  const avatar =
    user.avatar && typeof user.avatar === "object"
      ? user.avatar
      : user.avatar
        ? { url: user.avatar }
        : { url: "/assets/avatar.jpg" };

  return {
    id,
    _id: id,
    name: user.name,
    email: user.email,
    role: String(user.role || "user").toLowerCase(),
    isEmailVerified: user.isEmailVerified,
    avatar,
    phone: user.phone,
    address: user.address,
    createdAt: user.createdAt,
  };
}
