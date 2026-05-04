"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Trophy,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { getStatusColor } from "@/lib/esportUtils";
import TournamentBracket from "@/components/tournaments/TournamentBracket";
import { apiFetch } from "@/lib/apiClient";

export default function TournamentDetails() {
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const params = useParams();
  const router = useRouter();
  const tournamentId = params.id;

  useEffect(() => {
    const fetchTournamentDetails = async () => {
      try {
        const response = await apiFetch(`/tournaments/${tournamentId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch tournament details");
        }
        const data = await response.json();
        setTournament(data.data || data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTournamentDetails();
  }, [tournamentId]);

  if (loading) {
    return (
      <div className="p-3 md:p-4">
        <section className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-4 text-sm text-slate-400">
          Loading tournament details...
        </section>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="p-3 md:p-4">
        <section className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-4">
          <h1 className="text-xl font-semibold text-white">Error loading tournament</h1>
          <p className="mt-2 text-sm text-slate-400">{error || "Tournament not found"}</p>
          <Button
            onClick={() => router.push("/dashboard/my-tournaments")}
            className="mt-4 bg-sky-600 text-white hover:bg-sky-500"
          >
            Go back
          </Button>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-3 md:p-4">
      <Button
        variant="outline"
        onClick={() => router.push("/dashboard/my-tournaments")}
        className="border-slate-700 bg-slate-950/30 text-slate-200 hover:bg-slate-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to my tournaments
      </Button>

      <section className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Trophy className="h-4 w-4 text-slate-500" />
              <h1 className="text-xl font-semibold tracking-tight text-white">
                {tournament.name}
              </h1>
              <Badge className={getStatusColor(tournament.status)}>
                {tournament.status}
              </Badge>
              <Badge variant="outline" className="border-slate-700 bg-slate-950/30 text-slate-200">
                {tournament.game}
              </Badge>
            </div>
            <p className="text-sm text-slate-400">{tournament.description}</p>
          </div>

          <Button
            onClick={() => router.push(`/tournaments/${tournament._id}`)}
            className="bg-sky-600 text-white hover:bg-sky-500"
          >
            <ExternalLink className="h-4 w-4" />
            View public page
          </Button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Date",
              value: `${tournament.startDate} - ${tournament.endDate}`,
              icon: Calendar,
            },
            {
              label: "Time",
              value: `${tournament.startTime} - ${tournament.endTime}`,
              icon: Clock,
            },
            {
              label: "Location",
              value: tournament.location,
              icon: MapPin,
            },
            {
              label: "Format",
              value: tournament.format,
              icon: Users,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-slate-800 bg-slate-950/30 px-3 py-3"
            >
              <div className="flex items-center gap-2">
                <item.icon className="h-4 w-4 text-slate-500" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {item.label}
                </p>
              </div>
              <p className="mt-2 text-sm text-white">{item.value}</p>
            </div>
          ))}
          <div className="rounded-lg border border-slate-800 bg-slate-950/30 px-3 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Prize pool
            </p>
            <p className="mt-2 text-sm text-amber-300">{tournament.prize || "N/A"}</p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950/30 px-3 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Entry fee
            </p>
            <p className="mt-2 text-sm text-emerald-300">{tournament.entryFee || "Free"}</p>
          </div>
        </div>

        {tournament.rules && (
          <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950/30 px-3 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Rules and regulations
            </p>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-300">
              {tournament.rules}
            </p>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-4">
        <TournamentBracket tournamentId={tournamentId} />
      </section>
    </div>
  );
}
