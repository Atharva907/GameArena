import bcrypt from "bcryptjs";
import {
  createUserRecord,
  deleteOtpsByEmails,
  findUserByEmail,
  findUserById,
  listUserRecords,
  softDeleteUserRecord,
  updateUserRecord,
} from "../lib/accountStore.js";
import { apiResponse } from "../utils/response.js";

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

export async function listUsers(req, res) {
  const role = req.query.role;
  const search = req.query.search;
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Number.parseInt(req.query.limit, 10) || 10, 100);
  const { users, total } = await listUserRecords({ role, search, page, limit });

  return apiResponse(res, true, 200, "Users retrieved successfully", {
    users,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
    },
  });
}

export async function createUser(req, res) {
  const userData = {
    isEmailVerified: true,
    ...req.body,
  };

  if (userData.email) {
    userData.email = normalizeEmail(userData.email);
  }

  const existingUser = await findUserByEmail(userData.email);

  if (existingUser) {
    return apiResponse(res, false, 409, "User with this email already exists");
  }

  if (userData.password) {
    userData.password = await bcrypt.hash(userData.password, 10);
  }

  const newUser = await createUserRecord(userData);
  const userResponse = await findUserById(newUser.id);

  return apiResponse(res, true, 201, "User created successfully", userResponse);
}

export async function updateUser(req, res) {
  const { id, ...updateData } = req.body;
  if (!id) {
    return apiResponse(res, false, 400, "User ID is required");
  }

  const existingUser = await findUserById(id, { includePassword: true, includeDeleted: true });
  if (!existingUser) {
    return apiResponse(res, false, 404, "User not found");
  }

  const originalEmail = normalizeEmail(existingUser.email);
  if (updateData.email) {
    updateData.email = normalizeEmail(updateData.email);
  }

  const emailChanged = Boolean(updateData.email && updateData.email !== originalEmail);
  const passwordChanged = Boolean(updateData.password);

  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
    updateData.sessionVersion = Number(existingUser.sessionVersion || 0) + 1;
  }

  const updatedUser = await updateUserRecord(id, updateData);

  if (!updatedUser) {
    return apiResponse(res, false, 404, "User not found");
  }

  if (passwordChanged || emailChanged) {
    const emailsToClear = [...new Set([originalEmail, updateData.email].filter(Boolean))];
    if (emailsToClear.length > 0) {
      await deleteOtpsByEmails(emailsToClear);
    }
  }

  return apiResponse(res, true, 200, "User updated successfully", updatedUser);
}

export async function deleteUser(req, res) {
  const id = req.query.id;
  if (!id) {
    return apiResponse(res, false, 400, "User ID is required");
  }

  const deletedUser = await softDeleteUserRecord(id);

  if (!deletedUser) {
    return apiResponse(res, false, 404, "User not found");
  }

  return apiResponse(res, true, 200, "User deleted successfully", deletedUser);
}
