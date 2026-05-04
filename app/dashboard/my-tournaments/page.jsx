"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Trophy, Users, MapPin, Clock, ExternalLink } from "lucide-react";
import { formatDate, getStatusColor } from "@/lib/esportUtils";
import { apiFetch } from "@/lib/apiClient";

export default function MyTournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegisteredTournaments = async () => {
      try {
        const response = await apiFetch("/player/registrations");
        if (!response.ok) {
          throw new Error("Failed to fetch registered tournaments");
        }
        const data = await response.json();
        const tournamentsData = data.data || data;
        setTournaments(Array.isArray(tournamentsData) ? tournamentsData : []);
      } catch (error) {
        console.error("Error fetching registered tournaments:", error);
        setTournaments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRegisteredTournaments();
  }, []);

  if (loading) {
    return (
      <div className="p-3 md:p-4">
        <section className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-4 text-sm text-slate-400">
          Loading your tournaments...
        </section>
      </div>
    );
  }

  if (tournaments.length === 0) {
    return (
      <div className="p-3 md:p-4">
        <section className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-4">
          <div className="flex items-start gap-3">
            <Trophy className="mt-0.5 h-10 w-10 text-slate-500" />
            <div className="space-y-2">
              <h1 className="text-xl font-semibold text-white">No tournaments yet</h1>
              <p className="text-sm text-slate-400">
                You have not registered for any tournaments yet.
              </p>
              <Button asChild className="bg-sky-600 text-white hover:bg-sky-500">
                <Link href="/tournaments">Browse tournaments</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-3 md:p-4">
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-400">
          My tournaments
        </p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-white">
          Registered events
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Review the tournaments linked to your account.
        </p>
      </section>

      <div className="grid gap-3">
        {tournaments.map((tournament) => (
          <article
            key={tournament._id}
            className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-4"
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
              <div className="relative h-24 w-full overflow-hidden rounded-lg border border-slate-800 bg-slate-950/30 lg:h-28 lg:w-36 lg:flex-shrink-0">
                {tournament.imageUrl ? (
                  <img
                    src={tournament.imageUrl}
                    alt={tournament.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/assets/images/tournaments/placeholder.jpg";
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-950/30">
                    <Trophy className="h-10 w-10 text-slate-400" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold text-white">
                      {tournament.name}
                    </h2>
                    <p className="mt-1 text-sm text-slate-400 line-clamp-2">
                      {tournament.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={getStatusColor(tournament.status)}>{tournament.status}</Badge>
                    <Badge variant="outline" className="border-slate-700 bg-slate-950/30 text-slate-200">
                      {tournament.game}
                    </Badge>
                  </div>
                </div>

                <div className="mt-3 grid gap-2 text-xs text-slate-400 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {tournament.startDate} - {tournament.endDate}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      {tournament.startTime} - {tournament.endTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{tournament.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{tournament.format}</span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-4 text-sm">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Entry fee
                    </p>
                    <p className="mt-1 font-medium text-emerald-300">
                      {tournament.entryFee || "Free"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Prize pool
                    </p>
                    <p className="mt-1 font-medium text-amber-300">
                      {tournament.prize || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Joined
                    </p>
                    <p className="mt-1 text-white">{formatDate(tournament.joinedAt || tournament.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <Button asChild className="bg-sky-600 text-white hover:bg-sky-500">
                <Link href={`/dashboard/my-tournaments/${tournament._id}`}>
                  <ExternalLink className="h-4 w-4" />
                  View details
                </Link>
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
