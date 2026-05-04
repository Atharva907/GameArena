import bcrypt from "bcryptjs";
import { connectPostgres, prisma } from "./postgres.js";

const OTP_PURPOSE_LOGIN = "LOGIN";
const OTP_PURPOSE_PASSWORD_RESET = "PASSWORD_RESET";

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function normalizeRoleForApi(role) {
  return String(role || "user").trim().toLowerCase();
}

function normalizeRoleForWrite(role) {
  return normalizeRoleForApi(role).toUpperCase();
}

function asPlainRecord(record) {
  if (!record) return null;

  if (typeof record.toObject === "function") {
    return record.toObject({ versionKey: false });
  }

  return { ...record };
}

function normalizeId(record) {
  return String(record?.id || record?._id || "");
}

function toUserRecord(record) {
  if (!record) return null;

  const plain = asPlainRecord(record);
  const id = normalizeId(plain);

  return {
    ...plain,
    id,
    _id: plain._id ? String(plain._id) : id,
    role: normalizeRoleForApi(plain.role),
    avatar: plain.avatar || null,
    deletedAt: plain.deletedAt || null,
    sessionVersion: Number(plain.sessionVersion || 0),
  };
}

function userSelect(includePassword = false) {
  const select = {
    id: true,
    name: true,
    email: true,
    role: true,
    avatar: true,
    isEmailVerified: true,
    phone: true,
    address: true,
    deletedAt: true,
    sessionVersion: true,
    createdAt: true,
    updatedAt: true,
  };

  if (includePassword) {
    select.password = true;
  }

  return select;
}

function userWhere(emailOrId, { includeDeleted = false, byId = false } = {}) {
  const base = includeDeleted ? {} : { deletedAt: null };
  if (byId) {
    return { ...base, id: String(emailOrId || "") };
  }

  return { ...base, email: normalizeEmail(emailOrId) };
}

function userUpdateData(data = {}) {
  const updateData = {};

  if (typeof data.name !== "undefined") updateData.name = String(data.name).trim();
  if (typeof data.email !== "undefined") updateData.email = normalizeEmail(data.email);
  if (typeof data.role !== "undefined") updateData.role = normalizeRoleForWrite(data.role);
  if (typeof data.avatar !== "undefined") updateData.avatar = data.avatar;
  if (typeof data.isEmailVerified !== "undefined") updateData.isEmailVerified = Boolean(data.isEmailVerified);
  if (typeof data.phone !== "undefined") updateData.phone = String(data.phone || "").trim() || null;
  if (typeof data.address !== "undefined") updateData.address = String(data.address || "").trim() || null;
  if (typeof data.password !== "undefined") updateData.password = String(data.password);
  if (typeof data.sessionVersion !== "undefined") updateData.sessionVersion = Number(data.sessionVersion || 0);
  if (typeof data.deletedAt !== "undefined") updateData.deletedAt = data.deletedAt;

  return updateData;
}

async function findPostgresUser(query, { includePassword = false } = {}) {
  await connectPostgres();
  const user = await prisma.user.findFirst({
    where: query,
    select: userSelect(includePassword),
  });
  return toUserRecord(user);
}

export async function findUserByEmail(email, options = {}) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return null;

  return findPostgresUser(userWhere(normalizedEmail, options), options);
}

export async function findUserById(id, options = {}) {
  const normalizedId = String(id || "").trim();
  if (!normalizedId) return null;

  return findPostgresUser(
    userWhere(normalizedId, { ...options, byId: true }),
    options,
  );
}

export async function createUserRecord(data = {}) {
  const userData = userUpdateData(data);

  if (!userData.email) {
    throw new Error("Email is required.");
  }
  if (!userData.name) {
    throw new Error("Name is required.");
  }
  if (!userData.password) {
    throw new Error("Password is required.");
  }

  await connectPostgres();
  const created = await prisma.user.create({
    data: {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role || "USER",
      avatar: userData.avatar ?? null,
      isEmailVerified: Boolean(userData.isEmailVerified),
      phone: userData.phone ?? null,
      address: userData.address ?? null,
      deletedAt: userData.deletedAt ?? null,
      sessionVersion: Number(userData.sessionVersion || 0),
    },
    select: userSelect(false),
  });
  return toUserRecord(created);
}

export async function updateUserRecord(id, data = {}) {
  const userId = String(id || "").trim();
  if (!userId) {
    throw new Error("User ID is required.");
  }

  const updateData = userUpdateData(data);

  await connectPostgres();
  const updated = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: userSelect(false),
  });
  return toUserRecord(updated);
}

export async function softDeleteUserRecord(id) {
  return updateUserRecord(id, { deletedAt: new Date() });
}

function buildUserQuery({ role, search, includeDeleted = false } = {}) {
  const query = includeDeleted ? {} : { deletedAt: null };

  if (role) {
    query.role = normalizeRoleForWrite(role);
  }

  if (search) {
    const normalizedSearch = String(search).trim();
    query.OR = [
      { name: { contains: normalizedSearch, mode: "insensitive" } },
      { email: { contains: normalizedSearch, mode: "insensitive" } },
      { phone: { contains: normalizedSearch, mode: "insensitive" } },
    ];
  }

  return query;
}

export async function listUserRecords({
  role,
  search,
  page = 1,
  limit = 10,
  includeDeleted = false,
} = {}) {
  const safePage = Math.max(Number.parseInt(page, 10) || 1, 1);
  const safeLimit = Math.min(Number.parseInt(limit, 10) || 10, 100);
  const skip = (safePage - 1) * safeLimit;
  const query = buildUserQuery({ role, search, includeDeleted });

  await connectPostgres();
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: query,
      orderBy: { createdAt: "desc" },
      skip,
      take: safeLimit,
      select: userSelect(false),
    }),
    prisma.user.count({ where: query }),
  ]);

  return {
    users: users.map(toUserRecord),
    total,
    page: safePage,
    limit: safeLimit,
  };
}

export async function countUserRecords({ role, search, includeDeleted = false } = {}) {
  const query = buildUserQuery({ role, search, includeDeleted });

  await connectPostgres();
  return prisma.user.count({ where: query });
}

export async function createOtpRecord(
  email,
  otp,
  {
    purpose = OTP_PURPOSE_LOGIN,
    expiresAt = new Date(Date.now() + 10 * 60 * 1000),
  } = {},
) {
  const normalizedEmail = normalizeEmail(email);

  await connectPostgres();
  await prisma.otp.deleteMany({ where: { email: normalizedEmail, purpose } });
  return prisma.otp.create({
    data: {
      email: normalizedEmail,
      purpose,
      otpHash: await bcrypt.hash(String(otp), 10),
      expiresAt,
    },
  });
}

export async function findValidOtpRecord(
  email,
  otp,
  { purpose = OTP_PURPOSE_LOGIN } = {},
) {
  const normalizedEmail = normalizeEmail(email);

  await connectPostgres();
  const record = await prisma.otp.findFirst({
    where: {
      email: normalizedEmail,
      purpose,
      expiresAt: { gt: new Date() },
    },
  });

  if (!record) return null;

  const matches = await bcrypt.compare(String(otp), record.otpHash);
  return matches ? record : null;
}

export async function deleteOtpRecord(record) {
  if (!record) return;

  await connectPostgres();
  if (record.id) {
    await prisma.otp.delete({ where: { id: record.id } });
  }
}

export async function deleteOtpsByEmail(email, { purpose = null } = {}) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return;

  await connectPostgres();
  await prisma.otp.deleteMany({
    where: {
      email: normalizedEmail,
      ...(purpose ? { purpose } : {}),
    },
  });
}

export async function deleteOtpsByEmails(emails = []) {
  const uniqueEmails = [...new Set(emails.map(normalizeEmail).filter(Boolean))];
  if (!uniqueEmails.length) return;

  await Promise.all(uniqueEmails.map((email) => deleteOtpsByEmail(email)));
}

export function getOtpPurposeLogin() {
  return OTP_PURPOSE_LOGIN;
}

export function getOtpPurposePasswordReset() {
  return OTP_PURPOSE_PASSWORD_RESET;
}
