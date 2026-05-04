"use client";

import RegisterCard from "./RegisterCard";
import RegisteredTournaments from "./RegisteredTournaments";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Search, Calendar, TrendingUp } from "lucide-react";
import { sortTournamentsByDate } from "@/lib/esportUtils";
import LoadingSkeleton from "@/components/dashboard/LoadingSkeleton";
import { apiFetch } from "@/lib/apiClient";

export default function TournamentsPage() {
  const router = useRouter();
  const [registered, setRegistered] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchTournaments = async () => {
      setLoading(true);

      try {
        const response = await apiFetch("/tournaments");

        if (response.ok) {
          const data = await response.json();
          const tournamentsData = data.data || data;
          setTournaments(Array.isArray(tournamentsData) ? tournamentsData : []);
        } else {
          console.error("Failed to fetch tournaments");
        }
      } catch (error) {
        console.error("Error fetching tournaments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  const filteredTournaments = tournaments.filter((tournament) => {
    const matchesTab = activeTab === "all" || tournament.status === activeTab;
    const matchesSearch =
      tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tournament.game.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const sortedTournaments = sortTournamentsByDate(filteredTournaments);

  const handleRegister = (id) => {
    router.push(`/tournaments/${id}/register`);
  };

  const handleUnregister = (id) => {
    setRegistered(registered.filter((t) => t !== id));
  };

  const upcomingCount = tournaments.filter((t) => t.status === "upcoming").length;
  const liveCount = tournaments.filter((t) => t.status === "live").length;
  const completedCount = tournaments.filter((t) => t.status === "completed").length;

  return (
    <div className="space-y-4 p-3 md:p-4">
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-400">
              Tournaments
            </p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-white">
              Browse and join events
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Discover upcoming, live, and completed esports tournaments.
            </p>
          </div>

          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search tournaments"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-700 bg-slate-950/40 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            { label: "Upcoming", value: upcomingCount, icon: Calendar },
            { label: "Live now", value: liveCount, icon: TrendingUp },
            { label: "Completed", value: completedCount, icon: Trophy },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-slate-800 bg-slate-950/30 px-3 py-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {item.label}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-white">{item.value}</p>
                </div>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/60 text-slate-300">
                  <item.icon className="h-4 w-4" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-4">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-slate-950/30">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="live">Live</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {loading ? (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <section
                    key={i}
                    className="rounded-xl border border-slate-800 bg-slate-950/30 px-4 py-4"
                  >
                    <LoadingSkeleton />
                  </section>
                ))}
              </div>
            ) : sortedTournaments.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {sortedTournaments.map((t) => (
                  <RegisterCard
                    key={t.id || t._id}
                    tournament={t}
                    isRegistered={registered.includes(t.id || t._id)}
                    onRegister={() => handleRegister(t.id || t._id)}
                    onUnregister={() => handleUnregister(t.id || t._id)}
                  />
                ))}
              </div>
            ) : (
              <section className="rounded-xl border border-slate-800 bg-slate-950/30 px-4 py-4 text-center">
                <Trophy className="mx-auto h-10 w-10 text-slate-500" />
                <h3 className="mt-2 text-sm font-semibold text-white">No tournaments found</h3>
                <p className="mt-1 text-sm text-slate-400">
                  Try adjusting your search or filter.
                </p>
              </section>
            )}
          </TabsContent>
        </Tabs>
      </section>

      <RegisteredTournaments
        tournaments={tournaments.filter((t) => registered.includes(t.id || t._id))}
      />
    </div>
  );
}
