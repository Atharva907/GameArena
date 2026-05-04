import { connectPostgres, prisma } from "./postgres.js";

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

function normalizeTournamentStatus(value) {
  return String(value || "upcoming").trim().toLowerCase();
}

function normalizeTournamentFormat(value) {
  const normalized = String(value || "Solo").trim().toLowerCase();
  if (normalized === "duo") return "Duo";
  if (normalized === "squad") return "Squad";
  return "Solo";
}

function normalizeTournamentPlatform(value) {
  const normalized = String(value || "PC").trim().toLowerCase();
  if (normalized === "mobile") return "Mobile";
  if (normalized === "console") return "Console";
  return "PC";
}

function normalizeBracketStatus(value) {
  return String(value || "not_generated").trim().toLowerCase();
}

function normalizeMatchStatus(value) {
  return String(value || "scheduled").trim().toLowerCase();
}

function normalizeWinnerSide(value) {
  const normalized = String(value || "TBD").trim().toUpperCase();
  if (normalized === "A" || normalized === "B") return normalized;
  return "TBD";
}

function normalizeParticipant(participant) {
  if (!participant) return null;

  const plain = asPlainRecord(participant);
  return {
    ...plain,
    registrationId: String(plain.registrationId || ""),
  };
}

function normalizeTournamentRecord(record) {
  if (!record) return null;

  const plain = asPlainRecord(record);
  const id = normalizeId(plain);

  return {
    ...plain,
    id,
    _id: plain._id ? String(plain._id) : id,
    status: normalizeTournamentStatus(plain.status),
    format: normalizeTournamentFormat(plain.format),
    platform: normalizeTournamentPlatform(plain.platform),
    bracketStatus: normalizeBracketStatus(plain.bracketStatus),
    currentParticipants: Number(plain.currentParticipants || 0),
    maxParticipants: Number(plain.maxParticipants || 0),
    matchCount: Number(plain.matchCount || 0),
  };
}

function normalizeMatchRecord(record) {
  if (!record) return null;

  const plain = asPlainRecord(record);
  const id = normalizeId(plain);

  return {
    ...plain,
    id,
    _id: plain._id ? String(plain._id) : id,
    tournamentId: String(plain.tournamentId || ""),
    round: Number(plain.round || 0),
    matchNumber: Number(plain.matchNumber || 0),
    bracketPosition: Number(plain.bracketPosition || 0),
    participantA: normalizeParticipant(plain.participantA),
    participantB: normalizeParticipant(plain.participantB),
    scheduledAt: plain.scheduledAt ? new Date(plain.scheduledAt) : null,
    status: normalizeMatchStatus(plain.status),
    scoreA: Number(plain.scoreA || 0),
    scoreB: Number(plain.scoreB || 0),
    winnerSide: normalizeWinnerSide(plain.winnerSide),
    winnerRegistrationId: plain.winnerRegistrationId ? String(plain.winnerRegistrationId) : null,
    resultVerified: Boolean(plain.resultVerified),
  };
}

function normalizeTournamentInput(data = {}, { partial = false } = {}) {
  const payload = {};
  const setIfPresent = (key, value) => {
    if (typeof value !== "undefined") payload[key] = value;
  };

  setIfPresent("name", data.name ? String(data.name).trim() : undefined);
  setIfPresent("game", data.game ? String(data.game).trim() : undefined);
  setIfPresent("description", data.description ? String(data.description) : undefined);
  setIfPresent("startDate", data.startDate ? String(data.startDate).trim() : undefined);
  setIfPresent("endDate", data.endDate ? String(data.endDate).trim() : undefined);
  setIfPresent("startTime", data.startTime ? String(data.startTime).trim() : undefined);
  setIfPresent("endTime", data.endTime ? String(data.endTime).trim() : undefined);
  setIfPresent("location", data.location ? String(data.location).trim() : undefined);
  setIfPresent(
    "maxParticipants",
    data.maxParticipants !== undefined ? Number(data.maxParticipants || 0) : undefined,
  );
  setIfPresent(
    "currentParticipants",
    data.currentParticipants !== undefined ? Number(data.currentParticipants || 0) : undefined,
  );
  setIfPresent("status", data.status ? normalizeTournamentStatus(data.status) : undefined);
  setIfPresent("entryFee", data.entryFee ? String(data.entryFee).trim() : undefined);
  setIfPresent("region", data.region ? String(data.region).trim() : undefined);
  setIfPresent("format", data.format ? normalizeTournamentFormat(data.format) : undefined);
  setIfPresent("platform", data.platform ? normalizeTournamentPlatform(data.platform) : undefined);
  setIfPresent("prize", data.prize ? String(data.prize).trim() : undefined);
  setIfPresent("rules", data.rules ? String(data.rules) : undefined);
  setIfPresent("imageUrl", data.imageUrl ? String(data.imageUrl).trim() : undefined);
  setIfPresent(
    "bracketStatus",
    data.bracketStatus ? normalizeBracketStatus(data.bracketStatus) : undefined,
  );
  setIfPresent("matchCount", data.matchCount !== undefined ? Number(data.matchCount || 0) : undefined);

  if (!partial) {
    payload.currentParticipants =
      typeof payload.currentParticipants === "number" ? payload.currentParticipants : 0;
    payload.status = payload.status || "upcoming";
    payload.entryFee = payload.entryFee || "Free";
    payload.region = payload.region || "Global";
    payload.format = payload.format || "Solo";
    payload.platform = payload.platform || "PC";
    payload.imageUrl = payload.imageUrl || "";
    payload.bracketStatus = payload.bracketStatus || "not_generated";
    payload.matchCount = typeof payload.matchCount === "number" ? payload.matchCount : 0;
  }

  return payload;
}

function normalizeMatchInput(data = {}, { partial = false } = {}) {
  const payload = {};
  const setIfPresent = (key, value) => {
    if (typeof value !== "undefined") payload[key] = value;
  };

  setIfPresent("tournamentId", data.tournamentId ? String(data.tournamentId) : undefined);
  setIfPresent("round", data.round !== undefined ? Number(data.round || 0) : undefined);
  setIfPresent(
    "matchNumber",
    data.matchNumber !== undefined ? Number(data.matchNumber || 0) : undefined,
  );
  setIfPresent(
    "bracketPosition",
    data.bracketPosition !== undefined ? Number(data.bracketPosition || 0) : undefined,
  );
  setIfPresent(
    "participantA",
    data.participantA
      ? normalizeParticipant(data.participantA)
      : data.participantA === null
        ? null
        : undefined,
  );
  setIfPresent(
    "participantB",
    data.participantB
      ? normalizeParticipant(data.participantB)
      : data.participantB === null
        ? null
        : undefined,
  );
  setIfPresent(
    "scheduledAt",
    data.scheduledAt
      ? new Date(data.scheduledAt)
      : data.scheduledAt === null
        ? null
        : undefined,
  );
  setIfPresent("status", data.status ? normalizeMatchStatus(data.status) : undefined);
  setIfPresent("scoreA", data.scoreA !== undefined ? Number(data.scoreA || 0) : undefined);
  setIfPresent("scoreB", data.scoreB !== undefined ? Number(data.scoreB || 0) : undefined);
  setIfPresent("winnerSide", data.winnerSide ? normalizeWinnerSide(data.winnerSide) : undefined);
  setIfPresent(
    "winnerRegistrationId",
    data.winnerRegistrationId ? String(data.winnerRegistrationId) : data.winnerRegistrationId === null ? null : undefined,
  );
  setIfPresent(
    "resultVerified",
    data.resultVerified !== undefined ? Boolean(data.resultVerified) : undefined,
  );
  setIfPresent("notes", data.notes !== undefined ? String(data.notes || "").trim() : undefined);

  if (!partial) {
    payload.bracketPosition =
      typeof payload.bracketPosition === "number" ? payload.bracketPosition : 0;
    payload.status = payload.status || "scheduled";
    payload.scoreA = typeof payload.scoreA === "number" ? payload.scoreA : 0;
    payload.scoreB = typeof payload.scoreB === "number" ? payload.scoreB : 0;
    payload.winnerSide = payload.winnerSide || "TBD";
    payload.resultVerified = Boolean(payload.resultVerified);
    payload.notes = payload.notes || "";
  }

  return payload;
}

function tournamentWhereStatus(status) {
  if (!status) return {};
  return { status: normalizeTournamentStatus(status).toUpperCase() };
}

async function getPostgresTournamentById(id) {
  await connectPostgres();
  const tournament = await prisma.tournament.findUnique({ where: { id: String(id) } });
  return normalizeTournamentRecord(tournament);
}

export async function listTournamentRecords({ status } = {}) {
  await connectPostgres();
  const tournaments = await prisma.tournament.findMany({
    where: status ? tournamentWhereStatus(status) : {},
    orderBy: { createdAt: "desc" },
  });
  return tournaments.map(normalizeTournamentRecord);
}

export async function listTournamentRecordsByIds(ids = []) {
  const uniqueIds = [...new Set(ids.map((id) => String(id || "").trim()).filter(Boolean))];
  if (!uniqueIds.length) return [];

  await connectPostgres();
  const tournaments = await prisma.tournament.findMany({
    where: { id: { in: uniqueIds } },
  });
  return tournaments.map(normalizeTournamentRecord);
}

export async function getTournamentRecord(id) {
  return getPostgresTournamentById(id);
}

export async function createTournamentRecord(data = {}) {
  const payload = normalizeTournamentInput(data);

  await connectPostgres();
  const created = await prisma.tournament.create({ data: payload });
  return normalizeTournamentRecord(created);
}

export async function updateTournamentRecord(id, data = {}) {
  const payload = normalizeTournamentInput(data, { partial: true });

  await connectPostgres();
  const tournament = await prisma.tournament.findUnique({ where: { id: String(id) } });
  if (!tournament) return null;

  const updated = await prisma.tournament.update({
    where: { id: String(id) },
    data: payload,
  });
  return normalizeTournamentRecord(updated);
}

export async function deleteTournamentRecord(id) {
  await connectPostgres();
  const deleted = await prisma.$transaction(async (tx) => {
    const existing = await tx.tournament.findUnique({
      where: { id: String(id) },
      select: { id: true },
    });

    if (!existing) {
      return false;
    }

    await tx.tournamentMatch.deleteMany({ where: { tournamentId: String(id) } });
    await tx.gameTournamentRegistration.deleteMany({ where: { tournamentId: String(id) } });
    await tx.tournament.delete({ where: { id: String(id) } });
    return true;
  });

  return deleted;
}

export async function listTournamentMatchRecords(tournamentId) {
  const normalizedTournamentId = String(tournamentId || "").trim();
  if (!normalizedTournamentId) return [];

  await connectPostgres();
  const matches = await prisma.tournamentMatch.findMany({
    where: { tournamentId: normalizedTournamentId },
    orderBy: [
      { round: "asc" },
      { matchNumber: "asc" },
    ],
  });
  return matches.map(normalizeMatchRecord);
}

export async function countTournamentMatchRecords(tournamentId, round = null) {
  const normalizedTournamentId = String(tournamentId || "").trim();
  if (!normalizedTournamentId) return 0;

  await connectPostgres();
  return prisma.tournamentMatch.count({
    where: {
      tournamentId: normalizedTournamentId,
      ...(round ? { round: Number(round) } : {}),
    },
  });
}

export async function listTournamentRegistrationsByTournamentId(tournamentId) {
  const normalizedTournamentId = String(tournamentId || "").trim();
  if (!normalizedTournamentId) return [];

  await connectPostgres();
  const registrations = await prisma.gameTournamentRegistration.findMany({
    where: { tournamentId: normalizedTournamentId },
    orderBy: [
      { registrationDate: "asc" },
      { createdAt: "asc" },
    ],
  });

  return registrations.map((registration) => ({
    ...registration,
    id: String(registration.id),
    _id: String(registration.id),
    tournamentId: String(registration.tournamentId),
    playerEmail: String(registration.playerEmail || "").toLowerCase(),
    playerName: registration.playerName || "",
    dateOfBirth: registration.dateOfBirth || "",
    city: registration.city || "",
    state: registration.state || "",
    teamName: registration.teamName || "",
    contactNumber: registration.contactNumber || "",
    paid: Boolean(registration.paid),
    registrationDate: registration.registrationDate || registration.createdAt,
  }));
}

export async function findTournamentMatchRecord(tournamentId, matchId) {
  const normalizedTournamentId = String(tournamentId || "").trim();
  const normalizedMatchId = String(matchId || "").trim();
  if (!normalizedTournamentId || !normalizedMatchId) return null;

  await connectPostgres();
  const match = await prisma.tournamentMatch.findFirst({
    where: {
      id: normalizedMatchId,
      tournamentId: normalizedTournamentId,
    },
  });
  return normalizeMatchRecord(match);
}

export async function createTournamentMatchRecords(matches = []) {
  const normalizedMatches = matches.map((match) => normalizeMatchInput(match));
  if (!normalizedMatches.length) return [];

  await connectPostgres();
  await prisma.tournamentMatch.createMany({
    data: normalizedMatches.map((match) => ({
      tournamentId: match.tournamentId,
      round: match.round,
      matchNumber: match.matchNumber,
      bracketPosition: match.bracketPosition,
      participantA: match.participantA || null,
      participantB: match.participantB || null,
      status: match.status.toUpperCase(),
      scoreA: match.scoreA,
      scoreB: match.scoreB,
      winnerSide: match.winnerSide,
      winnerRegistrationId: match.winnerRegistrationId || null,
      resultVerified: match.resultVerified,
      notes: match.notes,
      scheduledAt: match.scheduledAt || null,
    })),
  });

  return listTournamentMatchRecords(normalizedMatches[0].tournamentId);
}

export async function deleteTournamentMatchRecords(tournamentId) {
  const normalizedTournamentId = String(tournamentId || "").trim();
  if (!normalizedTournamentId) return;

  await connectPostgres();
  await prisma.tournamentMatch.deleteMany({
    where: { tournamentId: normalizedTournamentId },
  });
}

export async function upsertTournamentMatchRecord({
  tournamentId,
  round,
  matchNumber,
  data = {},
}) {
  const normalizedTournamentId = String(tournamentId || "").trim();
  const normalizedData = normalizeMatchInput({
    tournamentId: normalizedTournamentId,
    round,
    matchNumber,
    ...data,
  }, { partial: true });

  await connectPostgres();
  const updated = await prisma.tournamentMatch.upsert({
    where: {
      tournamentId_round_matchNumber: {
        tournamentId: normalizedTournamentId,
        round: Number(round),
        matchNumber: Number(matchNumber),
      },
    },
    create: {
      tournamentId: normalizedTournamentId,
      round: Number(round),
      matchNumber: Number(matchNumber),
      bracketPosition: Number(normalizedData.bracketPosition || matchNumber || 0),
      participantA: normalizedData.participantA ?? null,
      participantB: normalizedData.participantB ?? null,
      scheduledAt: normalizedData.scheduledAt || null,
      status: normalizedData.status ? normalizedData.status.toUpperCase() : "SCHEDULED",
      scoreA: Number(normalizedData.scoreA || 0),
      scoreB: Number(normalizedData.scoreB || 0),
      winnerSide: normalizeWinnerSide(normalizedData.winnerSide),
      winnerRegistrationId: normalizedData.winnerRegistrationId || null,
      resultVerified: Boolean(normalizedData.resultVerified),
      notes: normalizedData.notes || "",
    },
    update: {
      ...(normalizedData.bracketPosition !== undefined
        ? { bracketPosition: normalizedData.bracketPosition }
        : {}),
      ...(normalizedData.participantA !== undefined
        ? { participantA: normalizedData.participantA }
        : {}),
      ...(normalizedData.participantB !== undefined
        ? { participantB: normalizedData.participantB }
        : {}),
      ...(normalizedData.scheduledAt !== undefined
        ? { scheduledAt: normalizedData.scheduledAt }
        : {}),
      ...(normalizedData.status !== undefined
        ? { status: normalizedData.status.toUpperCase() }
        : {}),
      ...(normalizedData.scoreA !== undefined ? { scoreA: normalizedData.scoreA } : {}),
      ...(normalizedData.scoreB !== undefined ? { scoreB: normalizedData.scoreB } : {}),
      ...(normalizedData.winnerSide !== undefined
        ? { winnerSide: normalizeWinnerSide(normalizedData.winnerSide) }
        : {}),
      ...(normalizedData.winnerRegistrationId !== undefined
        ? { winnerRegistrationId: normalizedData.winnerRegistrationId }
        : {}),
      ...(normalizedData.resultVerified !== undefined
        ? { resultVerified: normalizedData.resultVerified }
        : {}),
      ...(normalizedData.notes !== undefined ? { notes: normalizedData.notes } : {}),
    },
  });
  return normalizeMatchRecord(updated);
}

export async function updateTournamentBracketRecord(tournamentId, data = {}) {
  const normalizedTournamentId = String(tournamentId || "").trim();
  const payload = {
    ...(data.status !== undefined ? { status: normalizeTournamentStatus(data.status) } : {}),
    ...(data.bracketStatus !== undefined ? { bracketStatus: normalizeBracketStatus(data.bracketStatus) } : {}),
    ...(data.matchCount !== undefined ? { matchCount: Number(data.matchCount || 0) } : {}),
    ...(data.currentParticipants !== undefined
      ? { currentParticipants: Number(data.currentParticipants || 0) }
      : {}),
  };

  await connectPostgres();
  const updated = await prisma.tournament.update({
    where: { id: normalizedTournamentId },
    data: {
      ...(payload.status !== undefined ? { status: payload.status.toUpperCase() } : {}),
      ...(payload.bracketStatus !== undefined
        ? { bracketStatus: payload.bracketStatus.toUpperCase() }
        : {}),
      ...(payload.matchCount !== undefined ? { matchCount: payload.matchCount } : {}),
      ...(payload.currentParticipants !== undefined
        ? { currentParticipants: payload.currentParticipants }
        : {}),
    },
  });
  return normalizeTournamentRecord(updated);
}
