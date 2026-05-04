"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, RefreshCcw, Swords, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/apiClient";

const participantLabel = (participant) => {
  if (!participant) {
    return "TBD";
  }

  if (participant.teamName) {
    return `${participant.teamName} (${participant.name})`;
  }

  return participant.name || participant.email || "Player";
};

const getRoundLabel = (round, totalRounds) => {
  if (totalRounds > 1 && round === totalRounds) {
    return "Final";
  }

  if (totalRounds > 2 && round === totalRounds - 1) {
    return "Semi Final";
  }

  return `Round ${round}`;
};

function AdminMatchEditor({ tournamentId, match, onSaved }) {
  const [scoreA, setScoreA] = useState(match.scoreA || 0);
  const [scoreB, setScoreB] = useState(match.scoreB || 0);
  const [winnerSide, setWinnerSide] = useState(match.winnerSide || "TBD");
  const [status, setStatus] = useState(match.status || "scheduled");
  const [scheduledAt, setScheduledAt] = useState(
    match.scheduledAt ? new Date(match.scheduledAt).toISOString().slice(0, 16) : "",
  );
  const [notes, setNotes] = useState(match.notes || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const saveMatch = async () => {
    try {
      setSaving(true);
      setError("");

      const response = await apiFetch(
        `/tournaments/${tournamentId}/matches/${match._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            scoreA,
            scoreB,
            winnerSide,
            status,
            scheduledAt,
            notes,
            resultVerified: status === "completed" && winnerSide !== "TBD",
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update match");
      }

      await onSaved();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4 space-y-3 rounded-lg border border-border/70 bg-muted/20 p-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-xs font-medium">
          Score A
          <Input
            type="number"
            min="0"
            value={scoreA}
            onChange={(event) => setScoreA(event.target.value)}
          />
        </label>
        <label className="space-y-1 text-xs font-medium">
          Score B
          <Input
            type="number"
            min="0"
            value={scoreB}
            onChange={(event) => setScoreB(event.target.value)}
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-xs font-medium">
          Status
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option value="scheduled">Scheduled</option>
            <option value="live">Live</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>

        <label className="space-y-1 text-xs font-medium">
          Winner
          <select
            value={winnerSide}
            onChange={(event) => setWinnerSide(event.target.value)}
            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option value="TBD">TBD</option>
            <option value="A">{participantLabel(match.participantA)}</option>
            <option value="B">{participantLabel(match.participantB)}</option>
          </select>
        </label>
      </div>

      <label className="space-y-1 text-xs font-medium">
        Schedule
        <Input
          type="datetime-local"
          value={scheduledAt}
          onChange={(event) => setScheduledAt(event.target.value)}
        />
      </label>

      <label className="space-y-1 text-xs font-medium">
        Admin Notes
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="min-h-20 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          placeholder="Room ID, lobby notes, result proof, or ruling notes."
        />
      </label>

      {error && <p className="text-xs text-rose-500">{error}</p>}

      <Button type="button" onClick={saveMatch} disabled={saving} className="w-full">
        <CheckCircle2 className="size-4" />
        {saving ? "Saving..." : "Save Result"}
      </Button>
    </div>
  );
}

export default function TournamentBracket({ tournamentId, admin = false }) {
  const [matches, setMatches] = useState([]);
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");

  const loadData = useCallback(async () => {
    if (!tournamentId) {
      return;
    }

    try {
      setMessage("");
      const [matchesResponse, standingsResponse] = await Promise.all([
        apiFetch(`/tournaments/${tournamentId}/matches`),
        apiFetch(`/tournaments/${tournamentId}/standings`),
      ]);

      const matchesPayload = await matchesResponse.json();
      const standingsPayload = await standingsResponse.json();

      if (!matchesResponse.ok) {
        throw new Error(matchesPayload.message || "Failed to load bracket");
      }

      if (!standingsResponse.ok) {
        throw new Error(standingsPayload.message || "Failed to load standings");
      }

      setMatches(matchesPayload.data || []);
      setStandings(standingsPayload.data || []);
    } catch (loadError) {
      setMessage(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const rounds = useMemo(() => {
    const grouped = matches.reduce((result, match) => {
      const key = String(match.round);
      result[key] = result[key] || [];
      result[key].push(match);
      return result;
    }, {});

    return Object.entries(grouped)
      .map(([round, roundMatches]) => ({
        round: Number(round),
        matches: roundMatches.sort((a, b) => a.matchNumber - b.matchNumber),
      }))
      .sort((a, b) => a.round - b.round);
  }, [matches]);

  const generateBracket = async (regenerate = false) => {
    try {
      setGenerating(true);
      setMessage("");

      const response = await apiFetch(`/tournaments/${tournamentId}/matches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ regenerate }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate bracket");
      }

      setMessage(data.message || "Bracket generated successfully.");
      await loadData();
    } catch (generateError) {
      setMessage(generateError.message);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <section className="rounded-xl border border-border/70 bg-background/80 p-5 text-sm text-muted-foreground">
        Loading tournament bracket...
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Tournament Bracket</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Match schedule, verified results, and participant standings.
          </p>
        </div>

        {admin && (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => generateBracket(false)}
              disabled={generating}
            >
              <Swords className="size-4" />
              {generating ? "Generating..." : "Generate"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => generateBracket(true)}
              disabled={generating}
            >
              <RefreshCcw className="size-4" />
              Regenerate
            </Button>
          </div>
        )}
      </div>

      {message && (
        <div className="rounded-lg border border-border/70 bg-muted/25 px-4 py-3 text-sm text-muted-foreground">
          {message}
        </div>
      )}

      {rounds.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-5 py-8 text-center">
          <Trophy className="mx-auto size-8 text-muted-foreground" />
          <h3 className="mt-3 font-semibold">Bracket not generated yet</h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Once an admin generates the bracket, participants can view their
            match order and results here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex gap-4 overflow-x-auto pb-2">
            {rounds.map(({ round, matches: roundMatches }) => (
              <div key={round} className="min-w-[280px] flex-1 space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {getRoundLabel(round, rounds.length)}
                </h3>

                {roundMatches.map((match) => (
                  <article
                    key={match._id}
                    className="rounded-xl border border-border/70 bg-background p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Match {match.matchNumber}
                      </span>
                      <span className="rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-xs capitalize text-muted-foreground">
                        {match.status}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/25 px-3 py-2">
                        <span className="min-w-0 truncate">
                          {participantLabel(match.participantA)}
                        </span>
                        <span className="font-semibold">{match.scoreA}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/25 px-3 py-2">
                        <span className="min-w-0 truncate">
                          {participantLabel(match.participantB)}
                        </span>
                        <span className="font-semibold">{match.scoreB}</span>
                      </div>
                    </div>

                    {match.scheduledAt && (
                      <p className="mt-3 text-xs text-muted-foreground">
                        Scheduled: {new Date(match.scheduledAt).toLocaleString()}
                      </p>
                    )}

                    {match.winnerSide !== "TBD" && (
                      <p className="mt-3 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        Winner:{" "}
                        {participantLabel(
                          match.winnerSide === "A"
                            ? match.participantA
                            : match.participantB,
                        )}
                      </p>
                    )}

                    {match.notes && (
                      <p className="mt-3 rounded-lg bg-muted/25 px-3 py-2 text-xs text-muted-foreground">
                        {match.notes}
                      </p>
                    )}

                    {admin && (
                      <AdminMatchEditor
                        tournamentId={tournamentId}
                        match={match}
                        onSaved={loadData}
                      />
                    )}
                  </article>
                ))}
              </div>
            ))}
          </div>

          <aside className="rounded-xl border border-border/70 bg-background p-4">
            <h3 className="font-semibold">Standings</h3>
            <div className="mt-3 space-y-2">
              {standings.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No registered participants found.
                </p>
              ) : (
                standings.map((row, index) => (
                  <div
                    key={row.registrationId}
                    className="grid grid-cols-[32px_minmax(0,1fr)_56px] items-center gap-2 rounded-lg bg-muted/25 px-3 py-2 text-sm"
                  >
                    <span className="text-muted-foreground">#{index + 1}</span>
                    <span className="min-w-0 truncate">
                      {row.teamName ? `${row.teamName} (${row.name})` : row.name}
                    </span>
                    <span className="text-right font-medium">
                      {row.wins}-{row.losses}
                    </span>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
