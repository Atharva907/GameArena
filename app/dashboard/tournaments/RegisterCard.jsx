"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Users,
  Trophy,
  MapPin,
  Clock,
  ExternalLink,
} from "lucide-react";
import { getStatusColor, truncateText } from "@/lib/esportUtils";
import { useRouter } from "next/navigation";

export default function RegisterCard({ tournament, isRegistered, onRegister, onUnregister }) {
  const router = useRouter();
  const currentParticipants = Number(tournament.currentParticipants || 0);
  const maxParticipants = Math.max(Number(tournament.maxParticipants || 0), 1);
  const registrationProgress = (currentParticipants / maxParticipants) * 100;
  const isFull = currentParticipants >= maxParticipants;
  const isPast = new Date(tournament.startDate) < new Date();

  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start">
          <div className="relative h-24 w-full overflow-hidden rounded-lg border border-slate-800 bg-slate-950/30 md:h-24 md:w-36 md:flex-shrink-0">
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
                <h3 className="truncate text-base font-semibold text-white">
                  {tournament.name}
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  {truncateText(tournament.description, 90)}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge className={getStatusColor(tournament.status)}>
                  {tournament.status}
                </Badge>
                <Badge variant="outline" className="border-slate-700 bg-slate-950/30 text-slate-200">
                  {tournament.game}
                </Badge>
              </div>
            </div>

            <div className="mt-3 grid gap-2 text-sm text-slate-400 sm:grid-cols-2 xl:grid-cols-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-500" />
                <span>
                  {tournament.startDate || "N/A"} - {tournament.endDate || "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-500" />
                <span>
                  {tournament.startTime || "N/A"} - {tournament.endTime || "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-500" />
                <span>{tournament.location || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-500" />
                <span>{tournament.format || "N/A"}</span>
              </div>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-800 bg-slate-950/30 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Entry fee
                </p>
                <p className="mt-1 text-sm font-medium text-emerald-300">
                  {tournament.entryFee || "Free"}
                </p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950/30 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Prize pool
                </p>
                <p className="mt-1 text-sm font-medium text-amber-300">
                  {tournament.prize || "N/A"}
                </p>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Registration</span>
                <span>
                  {currentParticipants}/{maxParticipants}
                </span>
              </div>
              <Progress value={registrationProgress} className="h-2 bg-slate-800" />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={isRegistered ? onUnregister : onRegister}
            disabled={isFull || isPast}
            className={`${
              isRegistered ? "bg-rose-600 hover:bg-rose-500" : "bg-sky-600 hover:bg-sky-500"
            } ${isFull || isPast ? "cursor-not-allowed opacity-50" : ""}`}
          >
            {isRegistered ? "Unregister" : isFull ? "Full" : isPast ? "Ended" : "Register"}
          </Button>

          <Button
            variant="outline"
            className="border-slate-700 bg-slate-950/30 text-slate-200 hover:bg-slate-800"
            onClick={() => router.push(`/tournaments/${tournament.id || tournament._id}`)}
          >
            <ExternalLink className="h-4 w-4" />
            View details
          </Button>
        </div>
      </div>
    </article>
  );
}
