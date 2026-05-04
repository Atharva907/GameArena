import crypto from "node:crypto";
import { connectPostgres, prisma } from "./postgres.js";
import { findUserByEmail } from "./accountStore.js";

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function asPlainRecord(record) {
  if (!record) return null;

  if (typeof record.toObject === "function") {
    return record.toObject({ versionKey: false });
  }

  return { ...record };
}

function buildError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function parseDateValue(value, fieldName = "Date") {
  if (!value) {
    throw buildError(`${fieldName} is required.`);
  }

  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw buildError(`${fieldName} is invalid.`);
  }

  return parsed;
}

function parseWalletAmount(amount) {
  const parsed = Number.parseFloat(String(amount || "").trim());
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw buildError("Amount must be greater than 0");
  }

  return Math.round(parsed);
}

function normalizeTransactionStatus(status) {
  return String(status || "completed").trim().toLowerCase();
}

function normalizeTransactionRecord(record) {
  if (!record) return null;

  const plain = asPlainRecord(record);
  const id = String(plain.transactionId || plain.id || plain._id || "");

  return {
    ...plain,
    id,
    _id: plain._id ? String(plain._id) : id,
    transactionId: plain.transactionId ? String(plain.transactionId) : id,
    date: plain.date ? new Date(plain.date) : new Date(),
    type: plain.type || "",
    amount: Number(plain.amount || 0),
    status: normalizeTransactionStatus(plain.status),
    method: plain.method || "",
    description: plain.description || "",
    tournamentId: plain.tournamentId ? String(plain.tournamentId) : "",
    orderId: plain.orderId ? String(plain.orderId) : "",
  };
}

function normalizePlayerRecord(record, { includeTransactions = true } = {}) {
  if (!record) return null;

  const plain = asPlainRecord(record);
  const id = String(plain.id || plain._id || "");
  const transactions = includeTransactions
    ? Array.isArray(plain.transactions)
      ? plain.transactions
          .map(normalizeTransactionRecord)
          .filter(Boolean)
          .sort(
          (a, b) => new Date(b.date || 0) - new Date(a.date || 0),
        )
      : []
    : [];

  return {
    ...plain,
    id,
    _id: plain._id ? String(plain._id) : id,
    userId: plain.userId ? String(plain.userId) : null,
    email: normalizeEmail(plain.email),
    walletBalance: Number(plain.walletBalance || 0),
    transactions,
  };
}

function normalizeRegistrationRecord(record) {
  if (!record) return null;

  const plain = asPlainRecord(record);
  const id = String(plain.id || plain._id || "");

  return {
    ...plain,
    id,
    _id: plain._id ? String(plain._id) : id,
    tournamentId: String(plain.tournamentId || ""),
    playerId: plain.playerId ? String(plain.playerId) : null,
    playerEmail: normalizeEmail(plain.playerEmail),
    playerName: plain.playerName || "",
    dateOfBirth: plain.dateOfBirth || "",
    city: plain.city || "",
    state: plain.state || "",
    teamName: plain.teamName || "",
    contactNumber: plain.contactNumber || "",
    paid: Boolean(plain.paid),
    registrationDate: plain.registrationDate
      ? new Date(plain.registrationDate)
      : plain.createdAt
        ? new Date(plain.createdAt)
        : new Date(),
  };
}

function normalizePlayerPayload(data = {}) {
  const payload = {};

  if (typeof data.fullName !== "undefined") payload.fullName = String(data.fullName || "").trim();
  if (typeof data.username !== "undefined") payload.username = String(data.username || "").trim();
  if (typeof data.email !== "undefined") payload.email = normalizeEmail(data.email);
  if (typeof data.phoneNumber !== "undefined") {
    payload.phoneNumber = String(data.phoneNumber || "").trim();
  }
  if (typeof data.dateOfBirth !== "undefined") {
    payload.dateOfBirth = parseDateValue(data.dateOfBirth, "Date of birth");
  }
  if (typeof data.favoriteGame !== "undefined") {
    payload.favoriteGame = String(data.favoriteGame || "").trim();
  }
  if (typeof data.city !== "undefined") payload.city = String(data.city || "").trim();
  if (typeof data.state !== "undefined") payload.state = String(data.state || "").trim();
  if (typeof data.country !== "undefined") payload.country = String(data.country || "").trim();

  if (typeof data.walletBalance !== "undefined") {
    const balance = Number(data.walletBalance || 0);
    payload.walletBalance = Number.isFinite(balance) && balance >= 0 ? balance : 0;
  }

  return payload;
}

function ensureRequiredFields(data = {}, fields = []) {
  const missing = fields.filter((field) => !String(data[field] || "").trim());
  if (missing.length) {
    throw buildError(`Missing required fields: ${missing.join(", ")}`);
  }
}

async function findPostgresPlayerByEmail(email, { includeTransactions = true } = {}) {
  await connectPostgres();
  const player = await prisma.player.findUnique({
    where: { email: normalizeEmail(email) },
    ...(includeTransactions
      ? {
          include: {
            transactions: {
              orderBy: { date: "desc" },
            },
          },
        }
      : {}),
  });
  return normalizePlayerRecord(player, { includeTransactions });
}

export async function findPlayerByEmail(email, options = {}) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return null;

  return findPostgresPlayerByEmail(normalizedEmail, options);
}

export async function findPlayerByUsername(username, { excludeEmail = null } = {}) {
  const normalizedUsername = String(username || "").trim();
  if (!normalizedUsername) return null;

  await connectPostgres();
  const player = await prisma.player.findFirst({
    where: {
      username: normalizedUsername,
      ...(excludeEmail ? { email: { not: normalizeEmail(excludeEmail) } } : {}),
    },
  });
  return normalizePlayerRecord(player, { includeTransactions: false });
}

export async function createPlayerProfileRecord(data = {}) {
  const playerData = normalizePlayerPayload(data);

  ensureRequiredFields(playerData, [
    "fullName",
    "username",
    "email",
    "phoneNumber",
    "dateOfBirth",
    "favoriteGame",
    "city",
    "state",
    "country",
  ]);

  const existingPlayer = await findPlayerByEmail(playerData.email, {
    includeTransactions: false,
  });
  if (existingPlayer) {
    throw buildError(
      "A player with this email already exists. Would you like to update your profile?",
      409,
    );
  }

  const usernameMatch = await findPlayerByUsername(playerData.username);
  if (usernameMatch) {
    throw buildError("This username is already taken by another player", 409);
  }

  const linkedUser = await findUserByEmail(playerData.email);

  await connectPostgres();
  const created = await prisma.player.create({
    data: {
      userId: linkedUser?.id || null,
      fullName: playerData.fullName,
      username: playerData.username,
      email: playerData.email,
      phoneNumber: playerData.phoneNumber,
      dateOfBirth: playerData.dateOfBirth,
      favoriteGame: playerData.favoriteGame,
      city: playerData.city,
      state: playerData.state,
      country: playerData.country,
      walletBalance: Number(playerData.walletBalance || 0),
    },
    include: {
      transactions: {
        orderBy: { date: "desc" },
      },
    },
  });
  return normalizePlayerRecord(created);
}

export async function updatePlayerProfileRecord(email, data = {}) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    throw buildError("Email is required for updating profile");
  }

  const updateData = normalizePlayerPayload(data);
  delete updateData.email;

  if (updateData.username) {
    const usernameMatch = await findPlayerByUsername(updateData.username, {
      excludeEmail: normalizedEmail,
    });

    if (usernameMatch) {
      throw buildError("This username is already taken by another player", 409);
    }
  }

  await connectPostgres();
  const currentPlayer = await prisma.player.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, userId: true },
  });

  if (!currentPlayer) {
    throw buildError("Player profile not found", 404);
  }

  const linkedUser = currentPlayer.userId
    ? null
    : await findUserByEmail(normalizedEmail);

  const updated = await prisma.player.update({
    where: { email: normalizedEmail },
    data: {
      ...updateData,
      ...(linkedUser?.id ? { userId: linkedUser.id } : {}),
    },
    include: {
      transactions: {
        orderBy: { date: "desc" },
      },
    },
  });

  return normalizePlayerRecord(updated);
}

export async function getWalletSnapshotByEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return null;

  const player = await findPlayerByEmail(normalizedEmail, { includeTransactions: true });
  if (!player) return null;

  const transactions = Array.isArray(player.transactions)
    ? [...player.transactions].sort(
        (a, b) => new Date(b.date || 0) - new Date(a.date || 0),
      )
    : [];

  return {
    success: true,
    balance: Number(player.walletBalance || 0),
    walletBalance: Number(player.walletBalance || 0),
    transactions,
  };
}

export async function applyWalletTransaction({
  email,
  amount,
  type,
  method,
  description,
  tournamentId = null,
  orderId = null,
  session = null,
}) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedType = String(type || "").trim().toLowerCase();
  const transactionAmount = parseWalletAmount(amount);

  if (!normalizedEmail) {
    throw buildError("Email is required");
  }

  if (!["deposit", "withdraw"].includes(normalizedType)) {
    throw buildError("Invalid transaction type");
  }

  const transactionLabel = normalizedType === "deposit" ? "Deposit" : "Withdrawal";
  const signedAmount =
    normalizedType === "deposit" ? transactionAmount : -transactionAmount;
  const transactionStatus =
    normalizedType === "deposit" ? "completed" : "pending";

  await connectPostgres();
  const result = await prisma.$transaction(async (tx) => {
    const player = await tx.player.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, walletBalance: true },
    });

    if (!player) {
      throw buildError(
        "Player profile not found. Complete your profile before using the wallet.",
        404,
      );
    }

    if (
      normalizedType === "withdraw" &&
      Number(player.walletBalance || 0) < transactionAmount
    ) {
      throw buildError("Insufficient balance", 400);
    }

    if (normalizedType === "withdraw") {
      const updated = await tx.player.updateMany({
        where: {
          id: player.id,
          walletBalance: { gte: transactionAmount },
        },
        data: { walletBalance: { decrement: transactionAmount } },
      });

      if (!updated.count) {
        throw buildError("Insufficient balance", 400);
      }
    } else {
      await tx.player.update({
        where: { id: player.id },
        data: { walletBalance: { increment: transactionAmount } },
      });
    }

    const createdTransaction = await tx.playerTransaction.create({
      data: {
        transactionId: crypto.randomUUID(),
        playerId: player.id,
        date: new Date(),
        type: transactionLabel,
        amount: signedAmount,
        status: transactionStatus === "completed" ? "COMPLETED" : "PENDING",
        method: method || null,
        description: description || null,
        tournamentId: tournamentId || null,
        orderId: orderId || null,
      },
    });

    const updatedPlayer = await tx.player.findUnique({
      where: { id: player.id },
      include: {
        transactions: {
          orderBy: { date: "desc" },
        },
      },
    });

    return {
      player: normalizePlayerRecord(updatedPlayer),
      transaction: normalizeTransactionRecord(createdTransaction),
    };
  });

  return {
    success: true,
    message: `${transactionLabel} successful`,
    balance: Number(result.player?.walletBalance || 0),
    walletBalance: Number(result.player?.walletBalance || 0),
    transaction: result.transaction,
    player: result.player,
  };
}

async function executePostgresTournamentRegistration(client, {
  tournamentId,
  normalizedEmail,
  playerName,
  dateOfBirth,
  city,
  state,
  teamName,
  contactNumber,
  normalizedFee,
  tournamentName,
}) {
  const player = await client.player.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, walletBalance: true },
  });

  if (!player) {
    throw buildError(
      "Player profile not found. Complete your profile before using the wallet.",
      404,
    );
  }

  const duplicate = await client.gameTournamentRegistration.findUnique({
    where: {
      tournamentId_playerEmail: {
        tournamentId: String(tournamentId),
        playerEmail: normalizedEmail,
      },
    },
  });

  if (duplicate) {
    throw buildError("You are already registered for this tournament", 400);
  }

  if (normalizedFee > 0) {
    const balanceUpdated = await client.player.updateMany({
      where: {
        id: player.id,
        walletBalance: { gte: normalizedFee },
      },
      data: { walletBalance: { decrement: normalizedFee } },
    });

    if (!balanceUpdated.count) {
      throw buildError("Insufficient balance or player not found", 400);
    }

    await client.playerTransaction.create({
      data: {
        transactionId: crypto.randomUUID(),
        playerId: player.id,
        date: new Date(),
        type: "Tournament Entry Fee",
        amount: -normalizedFee,
        status: "COMPLETED",
        description: `Registration fee for ${tournamentName}`,
        tournamentId: String(tournamentId),
      },
    });
  }

  const registration = await client.gameTournamentRegistration.create({
    data: {
      tournamentId: String(tournamentId),
      playerId: player.id,
      playerEmail: normalizedEmail,
      playerName,
      dateOfBirth,
      city,
      state,
      teamName: teamName || null,
      contactNumber: contactNumber || null,
      paid: true,
    },
  });

  return {
    registration: normalizeRegistrationRecord(registration),
  };
}

export async function registerTournamentEntry({
  tournamentId,
  playerEmail,
  playerName,
  dateOfBirth,
  city,
  state,
  teamName = "",
  contactNumber = "",
  feeAmount = 0,
  tournamentName = "",
  session = null,
  tx = null,
}) {
  const normalizedEmail = normalizeEmail(playerEmail);
  const numericFee = Number(feeAmount);
  const normalizedFee = Number.isFinite(numericFee) ? Math.round(numericFee) : 0;

  if (!normalizedEmail) {
    throw buildError("Email is required");
  }

  if (tx) {
    return executePostgresTournamentRegistration(tx, {
      tournamentId,
      normalizedEmail,
      playerName,
      dateOfBirth,
      city,
      state,
      teamName,
      contactNumber,
      normalizedFee,
      tournamentName,
    });
  }

  await connectPostgres();
  return prisma.$transaction((transactionClient) =>
    executePostgresTournamentRegistration(transactionClient, {
      tournamentId,
      normalizedEmail,
      playerName,
      dateOfBirth,
      city,
      state,
      teamName,
      contactNumber,
      normalizedFee,
      tournamentName,
    }),
  );
}

export async function findRegistrationByTournamentAndEmail(tournamentId, email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !tournamentId) return null;

  await connectPostgres();
  const registration = await prisma.gameTournamentRegistration.findUnique({
    where: {
      tournamentId_playerEmail: {
        tournamentId: String(tournamentId),
        playerEmail: normalizedEmail,
      },
    },
  });
  return normalizeRegistrationRecord(registration);
}

export async function listRegistrationsByEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return [];

  await connectPostgres();
  const registrations = await prisma.gameTournamentRegistration.findMany({
    where: { playerEmail: normalizedEmail },
    orderBy: [{ createdAt: "desc" }, { registrationDate: "desc" }],
  });
  return registrations.map(normalizeRegistrationRecord);
}

export async function listRegistrationsByTournamentId(tournamentId) {
  const normalizedTournamentId = String(tournamentId || "").trim();
  if (!normalizedTournamentId) return [];

  await connectPostgres();
  const registrations = await prisma.gameTournamentRegistration.findMany({
    where: { tournamentId: normalizedTournamentId },
    orderBy: [{ createdAt: "asc" }, { registrationDate: "asc" }],
  });
  return registrations.map(normalizeRegistrationRecord);
}
