"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import DashboardCard from "@/components/dashboard/DashboardCard";
import QuickNavigation from "@/components/dashboard/QuickNavigation";
import WalletCard from "@/components/dashboard/WalletCard";
import TransactionRow from "@/components/dashboard/TransactionRow";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Gamepad2,
  Wallet,
  Target,
  CalendarDays,
  Activity,
  ArrowRight,
} from "lucide-react";
import { apiFetch } from "@/lib/apiClient";
import { calculateWinRate } from "@/lib/esportUtils";
import { formatCurrency } from "@/lib/utils";

export default function DashboardClient() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState("Player");
  const [profileNotice, setProfileNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    played: 0,
    wins: 0,
    winRate: "0.0%",
    walletBalance: formatCurrency(0),
  });
  const [upcomingTournaments, setUpcomingTournaments] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const fetchDashboardData = async () => {
      setLoading(true);
      setProfileNotice("");

      try {
        const meResponse = await apiFetch("/user/me");
        if (!meResponse.ok) {
          throw new Error("Session expired. Please log in again.");
        }

        const meData = await meResponse.json();
        const sessionUser = meData.data || meData;
        const email = sessionUser?.email;

        if (!email) {
          throw new Error("Session email missing.");
        }

        const [
          profileResponse,
          walletResponse,
          registrationsResponse,
          upcomingResponse,
        ] = await Promise.all([
          apiFetch(`/player?email=${encodeURIComponent(email)}`),
          apiFetch(`/wallet?email=${encodeURIComponent(email)}`),
          apiFetch("/player/registrations"),
          apiFetch("/tournaments?status=upcoming"),
        ]);

        let profile = null;
        if (profileResponse.ok) {
          profile = await profileResponse.json();
        } else if (profileResponse.status === 404 && !cancelled) {
          setProfileNotice(
            "Complete your player profile to unlock wallet and tournament stats.",
          );
        }

        const walletData = walletResponse.ok
          ? await walletResponse.json()
          : { balance: 0, transactions: [] };

        const registrationsData = registrationsResponse.ok
          ? await registrationsResponse.json()
          : { data: [] };

        const registeredTournaments = Array.isArray(
          registrationsData.data || registrationsData,
        )
          ? registrationsData.data || registrationsData
          : [];

        const standingsResults = await Promise.allSettled(
          registeredTournaments.map(async (tournament) => {
            const response = await apiFetch(`/tournaments/${tournament._id}/standings`);
            if (!response.ok) return null;

            const standingsData = await response.json();
            const standings = standingsData.data || standingsData || [];
            return standings.find((row) => row.email === email) || null;
          }),
        );

        const totals = standingsResults.reduce(
          (acc, result) => {
            if (result.status === "fulfilled" && result.value) {
              acc.wins += Number(result.value.wins || 0);
              acc.played += Number(result.value.played || 0);
            }

            return acc;
          },
          { wins: 0, played: 0 },
        );

        const upcomingData = upcomingResponse.ok
          ? await upcomingResponse.json()
          : { data: [] };
        const upcomingTournamentsRaw = Array.isArray(
          upcomingData.data || upcomingData,
        )
          ? upcomingData.data || upcomingData
          : [];

        const formattedUpcoming = [...upcomingTournamentsRaw]
          .filter((tournament) => Boolean(tournament?.startDate))
          .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
          .slice(0, 3)
          .map((tournament) => ({
            id: tournament._id,
            title: tournament.name,
            date: `${tournament.startDate || "TBA"}${
              tournament.endDate ? ` - ${tournament.endDate}` : ""
            }`,
            game: tournament.game || "Game",
            status: tournament.status || "upcoming",
            statusLabel:
              tournament.status === "live"
                ? "Live"
                : tournament.status === "completed"
                  ? "Completed"
                  : "Upcoming",
            statusClass:
              tournament.status === "live"
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                : tournament.status === "completed"
                  ? "border-slate-700 bg-slate-800 text-slate-300"
                  : "border-sky-500/20 bg-sky-500/10 text-sky-300",
          }));

        const formattedTransactions = (
          Array.isArray(walletData.transactions) ? walletData.transactions : []
        )
          .slice()
          .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
          .slice(0, 5)
          .map((transaction) => ({
            type: transaction.type || "Wallet transaction",
            date: new Date(transaction.date || Date.now()).toLocaleDateString(
              "en-US",
              { month: "short", day: "numeric", year: "numeric" },
            ),
            amount: Number(transaction.amount || 0),
            status: transaction.status || "completed",
            description: transaction.description || "",
          }));

        if (cancelled) return;

        const displayName =
          profile?.fullName || sessionUser?.name || email.split("@")[0] || "Player";

        setPlayerName(displayName.split(" ")[0]);
        setStats({
          played: registeredTournaments.length,
          wins: totals.wins,
          winRate: `${calculateWinRate(totals.wins, totals.played)}%`,
          walletBalance: formatCurrency(
            Number(walletData.balance ?? walletData.walletBalance ?? 0),
          ),
        });
        setUpcomingTournaments(formattedUpcoming);
        setRecentTransactions(formattedTransactions);
      } catch (error) {
        if (!cancelled) {
          setProfileNotice(error.message || "Failed to load dashboard data.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();

    return () => {
      cancelled = true;
    };
  }, []);

  const overviewCards = [
    {
      title: "Tournaments played",
      value: loading ? "Loading..." : stats.played,
      description: "Registered events on your account.",
      icon: Gamepad2,
      tone: "blue",
    },
    {
      title: "Wins",
      value: loading ? "Loading..." : stats.wins,
      description: "Confirmed victories across events.",
      icon: Trophy,
      tone: "emerald",
    },
    {
      title: "Win rate",
      value: loading ? "Loading..." : stats.winRate,
      description: "Success rate from completed matches.",
      icon: Target,
      tone: "amber",
    },
    {
      title: "Wallet balance",
      value: loading ? "Loading..." : stats.walletBalance,
      description: "Funds available for entries and orders.",
      icon: Wallet,
      tone: "slate",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="w-full space-y-4 px-3 py-4 sm:px-4 sm:py-4 lg:px-6 lg:py-5"
    >
      <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm md:p-5">
        <div className="absolute inset-x-0 top-0 h-1 bg-sky-500" />
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-400">
                Dashboard overview
              </p>
              <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Welcome back, {playerName}
              </h1>
              <p className="mt-1.5 max-w-xl text-sm leading-5 text-slate-400">
                Monitor tournaments, wallet activity, and your competitive progress
                from one place.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" className="bg-sky-600 text-white hover:bg-sky-500">
                <Link href="/dashboard/tournaments">
                  <Gamepad2 className="h-4 w-4" />
                  Browse tournaments
                </Link>
              </Button>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="border-slate-700 bg-slate-950/40 text-slate-200 hover:bg-slate-800"
              >
                <Link href="/dashboard/wallet">
                  <Wallet className="h-4 w-4" />
                  Open wallet
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[320px]">
            <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                Profile status
              </p>
              <p className="mt-1.5 text-sm leading-5 text-slate-300">
                {profileNotice || "Profile and wallet are synced for your next match."}
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                Wallet snapshot
              </p>
              <p className="mt-1.5 text-xl font-semibold tracking-tight text-white">
                {loading ? "Loading..." : stats.walletBalance}
              </p>
              <p className="text-sm text-slate-400">
                Available for entries and orders
              </p>
            </div>
          </div>
        </div>

        {profileNotice && (
          <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
            {profileNotice}
          </div>
        )}
      </section>

      <QuickNavigation />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {overviewCards.map((card) => (
          <DashboardCard
            key={card.title}
            title={card.title}
            value={card.value}
            description={card.description}
            icon={card.icon}
            tone={card.tone}
          />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 shadow-sm">
          <div className="flex flex-row items-start justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-300 ring-1 ring-sky-500/20">
                  <CalendarDays className="h-4 w-4" />
                </span>
                Upcoming tournaments
              </h2>
              <p className="mt-1.5 text-sm text-slate-400">
                Jump into the next event and keep your schedule in view.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="border-slate-700 bg-slate-950/30 text-slate-200 hover:bg-slate-800"
              onClick={() => router.push("/dashboard/tournaments")}
            >
              View all
            </Button>
          </div>

          <div className="mt-3 space-y-2.5">
            {loading ? (
              <div className="rounded-xl border border-slate-800 bg-slate-950/30 px-3 py-3 text-sm text-slate-400">
                Loading tournaments...
              </div>
            ) : upcomingTournaments.length > 0 ? (
              upcomingTournaments.map((tournament) => (
                <Link
                  key={tournament.id}
                  href={`/tournaments/${tournament.id}`}
                  className="group flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/30 px-3 py-3 transition-colors hover:border-sky-500/30 hover:bg-slate-950/50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white group-hover:text-sky-300">
                      {tournament.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {tournament.game} {"\u2022"} {tournament.date}
                    </p>
                  </div>

                  <Badge variant="outline" className={tournament.statusClass}>
                    {tournament.statusLabel}
                  </Badge>
                </Link>
              ))
            ) : (
              <div className="rounded-xl border border-slate-800 bg-slate-950/30 px-3 py-3 text-sm text-slate-400">
                No upcoming tournaments found.
              </div>
            )}
          </div>
        </section>

        <WalletCard />
      </div>

      <section className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 shadow-sm">
        <div className="flex flex-row items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20">
                <Activity className="h-4 w-4" />
              </span>
              Recent activity
            </h2>
            <p className="mt-1.5 text-sm text-slate-400">
              Recent wallet movements and tournament updates.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="border-slate-700 bg-slate-950/30 text-slate-200 hover:bg-slate-800"
            onClick={() => router.push("/dashboard/wallet")}
          >
            View wallet
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-3 space-y-2">
          {loading ? (
            <div className="rounded-xl border border-slate-800 bg-slate-950/30 px-3 py-3 text-sm text-slate-400">
              Loading activity...
            </div>
          ) : recentTransactions.length > 0 ? (
            recentTransactions.map((transaction, index) => (
              <TransactionRow key={`${transaction.type}-${index}`} {...transaction} />
            ))
          ) : (
            <div className="rounded-xl border border-slate-800 bg-slate-950/30 px-4 py-3 text-center">
              <p className="text-sm text-slate-400">No recent activity available yet.</p>
            </div>
          )}
        </div>
      </section>
    </motion.div>
  );
}
