import {
  countTournamentMatchRecords,
  updateTournamentBracketRecord,
  upsertTournamentMatchRecord,
} from "./tournamentStore.js";

export const registrationToParticipant = (registration, seed) => ({
  registrationId: String(registration._id || registration.id || ""),
  name: registration.playerName || registration.playerEmail || "Player",
  email: registration.playerEmail || "",
  teamName: registration.teamName || "",
  seed,
});

const getWinnerParticipant = (match) => {
  if (match.winnerSide === "A") return match.participantA;
  if (match.winnerSide === "B") return match.participantB;
  return null;
};

export async function advanceWinner(match) {
  if (match.status !== "completed" || !match.winnerRegistrationId) {
    return null;
  }

  const currentRoundMatches = await countTournamentMatchRecords(
    match.tournamentId,
    match.round,
  );
  const winnerParticipant = getWinnerParticipant(match);

  if (!winnerParticipant || currentRoundMatches <= 1) {
    await updateTournamentBracketRecord(match.tournamentId, {
      status: "completed",
      bracketStatus: "completed",
    });
    return null;
  }

  const nextRound = match.round + 1;
  const nextMatchNumber = Math.ceil(match.matchNumber / 2);
  const slot = match.matchNumber % 2 === 1 ? "participantA" : "participantB";

  const nextMatch = await upsertTournamentMatchRecord({
    tournamentId: match.tournamentId,
    round: nextRound,
    matchNumber: nextMatchNumber,
    data: {
      bracketPosition: nextMatchNumber,
      status: "scheduled",
      winnerSide: "TBD",
      [slot]: winnerParticipant,
    },
  });

  await updateTournamentBracketRecord(match.tournamentId, {
    status: "live",
    bracketStatus: "in_progress",
  });

  return nextMatch;
}
