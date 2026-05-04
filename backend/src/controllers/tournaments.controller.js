import { advanceWinner, registrationToParticipant } from "../lib/tournamentEngine.js";
import {
  findRegistrationByTournamentAndEmail,
  listRegistrationsByEmail,
  listRegistrationsByTournamentId,
  registerTournamentEntry,
} from "../lib/playerStore.js";
import {
  createTournamentMatchRecords,
  createTournamentRecord,
  deleteTournamentMatchRecords,
  deleteTournamentRecord,
  findTournamentMatchRecord,
  getTournamentRecord,
  listTournamentMatchRecords,
  listTournamentRecords,
  listTournamentRecordsByIds,
  updateTournamentBracketRecord,
  updateTournamentRecord,
  upsertTournamentMatchRecord,
} from "../lib/tournamentStore.js";
import { connectPostgres, prisma } from "../lib/postgres.js";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const assertDatabaseId = (id, label = "ID") => {
  const value = String(id || "").trim();
  if (!UUID_REGEX.test(value)) {
    const error = new Error(`Invalid ${label}.`);
    error.statusCode = 400;
    throw error;
  }
};

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const parseEntryFee = (entryFee) => {
  if (!entryFee || entryFee === "Free") return 0;
  return Number.parseFloat(String(entryFee).replace(/[^0-9.-]+/g, "")) || 0;
};

export async function listTournaments(req, res) {
  const tournaments = await listTournamentRecords({
    status: req.query.status || null,
  });
  res.json({ data: tournaments });
}

export async function getTournament(req, res) {
  assertDatabaseId(req.params.id, "tournament ID");
  const tournament = await getTournamentRecord(req.params.id);
  if (!tournament) return res.status(404).json({ message: "Tournament not found." });
  res.json(tournament);
}

export async function createTournament(req, res) {
  const tournament = await createTournamentRecord(req.body);
  res.status(201).json(tournament);
}

export async function updateTournament(req, res) {
  const { id, ...updateData } = req.body;
  if (!id) return res.status(400).json({ message: "Tournament ID is required." });
  assertDatabaseId(id, "tournament ID");

  const tournament = await updateTournamentRecord(id, updateData);

  if (!tournament) return res.status(404).json({ message: "Tournament not found." });
  res.json(tournament);
}

export async function deleteTournament(req, res) {
  const id = req.query.id;
  if (!id) return res.status(400).json({ message: "Tournament ID is required." });
  assertDatabaseId(id, "tournament ID");

  const deleted = await deleteTournamentRecord(id);
  if (!deleted) return res.status(404).json({ message: "Tournament not found." });

  res.json({ message: "Tournament deleted successfully." });
}

export async function registerForTournament(req, res) {
  const {
    tournamentId,
    playerEmail,
    playerName,
    dateOfBirth,
    city,
    state,
    teamName,
    contactNumber,
  } = req.body;
  const normalizedEmail = normalizeEmail(playerEmail);

  if (!tournamentId || !normalizedEmail || !playerName || !dateOfBirth || !city || !state) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  assertDatabaseId(tournamentId, "tournament ID");

  try {
    await connectPostgres();
    await prisma.$transaction(async (tx) => {
      const tournament = await tx.tournament.findUnique({
        where: { id: String(tournamentId) },
      });

      if (!tournament) {
        throw Object.assign(new Error("Tournament not found"), { statusCode: 404 });
      }

      const feeAmount = parseEntryFee(tournament.entryFee);
      const capacityUpdate = await tx.tournament.updateMany({
        where: {
          id: String(tournamentId),
          currentParticipants: { lt: tournament.maxParticipants },
        },
        data: { currentParticipants: { increment: 1 } },
      });

      if (!capacityUpdate.count) {
        throw Object.assign(new Error("Tournament is full"), { statusCode: 400 });
      }

      await registerTournamentEntry({
        tournamentId,
        playerEmail: normalizedEmail,
        playerName,
        dateOfBirth,
        city,
        state,
        teamName: teamName || "",
        contactNumber: contactNumber || "",
        feeAmount,
        tournamentName: tournament.name,
        tx,
      });
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({
        error: "You are already registered for this tournament",
      });
    }
    return res.status(error.statusCode || 500).json({
      error: error.message || "Failed to register for tournament",
    });
  }

  res.json({ success: true, message: "Registration successful" });
}

export async function checkRegistration(req, res) {
  const { tournamentId, email } = req.query;
  if (!tournamentId || !email) {
    return res.status(400).json({ error: "Missing required parameters" });
  }
  assertDatabaseId(tournamentId, "tournament ID");

  const registration = await findRegistrationByTournamentAndEmail(tournamentId, email);
  res.json({ isRegistered: Boolean(registration) });
}

export async function listMyTournaments(req, res) {
  const email = normalizeEmail(req.user?.email);
  if (!email) {
    return res.status(401).json({ error: "Authenticated session is required" });
  }

  const registrations = await listRegistrationsByEmail(email);
  if (registrations.length === 0) return res.json({ data: [] });

  const tournamentIds = [
    ...new Set(
      registrations.map((registration) => String(registration.tournamentId || "")).filter(Boolean),
    ),
  ];
  const tournaments = await listTournamentRecordsByIds(tournamentIds);
  const tournamentMap = new Map(
    tournaments.map((tournament) => [String(tournament.id || tournament._id), tournament]),
  );

  const data = registrations.map((registration) => {
    const tournament = tournamentMap.get(String(registration.tournamentId));

    if (!tournament) {
      const fallbackId = String(registration.tournamentId || "");
      return {
        _id: fallbackId,
        id: fallbackId,
        name: registration.tournamentName || `Tournament ${fallbackId.slice(0, 8)}`,
        game: registration.game || "Game",
        description: registration.description || "",
        startDate: registration.startDate || "",
        endDate: registration.endDate || "",
        startTime: registration.startTime || "",
        endTime: registration.endTime || "",
        location: registration.location || "",
        format: registration.format || "Solo",
        entryFee: registration.entryFee || "Free",
        prize: registration.prize || "",
        status: registration.status || "upcoming",
        imageUrl: registration.imageUrl || "",
        bracketStatus: registration.bracketStatus || "not_generated",
        matchCount: Number(registration.matchCount || 0),
        registrationDate: registration.registrationDate,
        playerEmail: registration.playerEmail,
      };
    }

    return {
      ...tournament,
      registrationDate: registration.registrationDate,
      playerEmail: registration.playerEmail,
      _id: tournament._id || tournament.id,
    };
  });

  res.json({ data });
}

export async function listRegistrations(req, res) {
  const email = normalizeEmail(req.query.email);
  if (!email) return res.status(400).json({ error: "Email parameter is required" });
  const registrations = await listRegistrationsByEmail(email);
  res.json({ success: true, data: registrations });
}

export async function listMatches(req, res) {
  assertDatabaseId(req.params.id, "tournament ID");
  const matches = await listTournamentMatchRecords(req.params.id);
  res.json({ data: matches });
}

export async function generateMatches(req, res) {
  assertDatabaseId(req.params.id, "tournament ID");
  const tournament = await getTournamentRecord(req.params.id);
  if (!tournament) return res.status(404).json({ message: "Tournament not found." });

  const existingMatches = await listTournamentMatchRecords(req.params.id);
  if (existingMatches.length > 0 && !req.body?.regenerate) {
    return res.status(409).json({ message: "Bracket already exists. Use regenerate to rebuild it." });
  }
  if (req.body?.regenerate) await deleteTournamentMatchRecords(req.params.id);

  const registrations = await listRegistrationsByTournamentId(req.params.id);
  if (registrations.length < 2) {
    return res.status(400).json({
      message: "At least two registered participants are required to generate a bracket.",
    });
  }

  const participants = registrations.map((registration, index) =>
    registrationToParticipant(registration, index + 1),
  );
  const matchesToCreate = [];
  for (let index = 0; index < participants.length; index += 2) {
    const participantA = participants[index] || null;
    const participantB = participants[index + 1] || null;
    const isBye = participantA && !participantB;
    matchesToCreate.push({
      tournamentId: req.params.id,
      round: 1,
      matchNumber: Math.floor(index / 2) + 1,
      bracketPosition: Math.floor(index / 2) + 1,
      participantA,
      participantB,
      status: isBye ? "completed" : "scheduled",
      winnerSide: isBye ? "A" : "TBD",
      winnerRegistrationId: isBye ? participantA.registrationId : null,
      resultVerified: Boolean(isBye),
      notes: isBye ? "Automatic bye due to odd participant count." : "",
    });
  }

  const createdMatches = await createTournamentMatchRecords(matchesToCreate);
  for (const match of createdMatches) {
    if (match.status === "completed") await advanceWinner(match);
  }
  await updateTournamentBracketRecord(req.params.id, {
    bracketStatus: "generated",
    matchCount: createdMatches.length,
  });
  const matches = await listTournamentMatchRecords(req.params.id);
  res.status(201).json({ message: "Bracket generated successfully.", data: matches });
}

export async function updateMatch(req, res) {
  assertDatabaseId(req.params.id, "tournament ID");
  assertDatabaseId(req.params.matchId, "match ID");
  const match = await findTournamentMatchRecord(req.params.id, req.params.matchId);
  if (!match) return res.status(404).json({ message: "Match not found." });

  const update = {};
  for (const field of ["status", "winnerSide", "notes"]) {
    if (req.body[field] !== undefined) update[field] = req.body[field];
  }
  if (req.body.scoreA !== undefined) update.scoreA = Number(req.body.scoreA || 0);
  if (req.body.scoreB !== undefined) update.scoreB = Number(req.body.scoreB || 0);
  if (req.body.scheduledAt !== undefined) update.scheduledAt = req.body.scheduledAt ? new Date(req.body.scheduledAt) : null;
  if (req.body.resultVerified !== undefined) update.resultVerified = Boolean(req.body.resultVerified);

  if (update.status === "completed" && update.winnerSide && update.winnerSide !== "TBD") {
    const winner = update.winnerSide === "A" ? match.participantA : match.participantB;
    if (!winner?.registrationId) {
      return res.status(400).json({ message: "Selected winner slot does not contain a participant." });
    }
    update.winnerRegistrationId = winner.registrationId;
    update.resultVerified = true;
  } else if (update.winnerSide === "TBD" || update.status !== "completed") {
    update.winnerRegistrationId = null;
  }

  const updatedMatch = await upsertTournamentMatchRecord(
    {
      tournamentId: req.params.id,
      round: match.round,
      matchNumber: match.matchNumber,
      data: update,
    },
  );
  await advanceWinner(updatedMatch);
  res.json({ message: "Match updated successfully.", data: updatedMatch });
}

export async function getStandings(req, res) {
  assertDatabaseId(req.params.id, "tournament ID");
  const [registrations, matches] = await Promise.all([
    listRegistrationsByTournamentId(req.params.id),
    listTournamentMatchRecords(req.params.id),
  ]);

  const standings = registrations.map((registration) => {
    const registrationId = String(registration._id || registration.id || "");
    let played = 0, wins = 0, losses = 0, pointsFor = 0, pointsAgainst = 0;
    for (const match of matches) {
      const isA = String(match.participantA?.registrationId || "") === registrationId;
      const isB = String(match.participantB?.registrationId || "") === registrationId;
      if ((!isA && !isB) || match.status !== "completed" || !match.resultVerified) continue;
      played += 1;
      pointsFor += isA ? match.scoreA : match.scoreB;
      pointsAgainst += isA ? match.scoreB : match.scoreA;
      if (String(match.winnerRegistrationId || "") === registrationId) wins += 1;
      else losses += 1;
    }
    return {
      registrationId,
      name: registration.playerName,
      email: registration.playerEmail,
      teamName: registration.teamName || "",
      played, wins, losses, pointsFor, pointsAgainst,
      scoreDifference: pointsFor - pointsAgainst,
    };
  });

  standings.sort((a, b) => b.wins - a.wins || b.scoreDifference - a.scoreDifference || b.pointsFor - a.pointsFor);
  res.json({ data: standings });
}
