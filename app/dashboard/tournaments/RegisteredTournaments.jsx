"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MapPin,
  Users,
  Trophy,
  ExternalLink,
} from "lucide-react";
import { formatDate, getStatusColor } from "@/lib/esportUtils";
import { useRouter } from "next/navigation";

export default function RegisteredTournaments({ tournaments }) {
  const router = useRouter();

  if (tournaments.length === 0) return null;

  return (
    <section className="mt-6 space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-white">My registered tournaments</h2>
          <p className="mt-1 text-xs text-slate-400">
            Events that are already linked to your account.
          </p>
        </div>
        <Badge variant="outline" className="border-sky-500/20 bg-sky-500/10 text-sky-300">
          {tournaments.length} active
        </Badge>
      </div>

      <div className="space-y-2">
        {tournaments.map((t) => (
          <article
            key={t.id || t._id}
            className="rounded-xl border border-slate-800 bg-slate-950/30 px-3 py-3"
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Trophy className="h-4 w-4 text-slate-500" />
                  <h3 className="text-sm font-semibold text-white">{t.name}</h3>
                  <Badge className={getStatusColor(t.status)}>{t.status}</Badge>
                  <Badge variant="outline" className="border-slate-700 bg-slate-950/30 text-slate-200">
                    {t.game}
                  </Badge>
                </div>

                <div className="grid gap-2 text-xs text-slate-400 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(t.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{t.region}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{t.format}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    <span>{t.prize}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-700 bg-slate-950/30 text-slate-200 hover:bg-slate-800"
                  onClick={() => router.push(`/dashboard/my-tournaments/${t.id || t._id}`)}
                >
                  <ExternalLink className="h-4 w-4" />
                  Details
                </Button>

                {t.status === "upcoming" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-rose-500/20 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20"
                  >
                    Unregister
                  </Button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
