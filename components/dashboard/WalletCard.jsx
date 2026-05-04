"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, History, ArrowUpRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/apiClient";

export default function WalletCard() {
  const router = useRouter();
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [showTransactions, setShowTransactions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [sessionUser, setSessionUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const { auth } = useAuth();
  const walletEmail = auth?.email || sessionUser?.email;
  const needsProfile = errorMessage.toLowerCase().includes("profile");

  useEffect(() => {
    let isMounted = true;

    const fetchSessionUser = async () => {
      try {
        const response = await apiFetch("/user/me");
        const data = await response.json().catch(() => ({}));

        if (response.ok && isMounted) {
          setSessionUser(data.data || data);
        }
      } catch {
        // ignore session fetch issues here; the dashboard guard already handles auth
      } finally {
        if (isMounted) {
          setCheckingSession(false);
        }
      }
    };

    fetchSessionUser();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!checkingSession) {
      fetchWalletData();
    }
  }, [walletEmail, checkingSession]);

  const fetchWalletData = async () => {
    try {
      if (!walletEmail) {
        setErrorMessage("Sign in to access your wallet.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMessage("");

      const response = await apiFetch(
        `/wallet?email=${encodeURIComponent(walletEmail)}`,
      );
      const data = await response.json();

      if (response.ok) {
        setWalletBalance(data.balance);
        setTransactions(data.transactions || []);
      } else {
        setWalletBalance(0);
        setTransactions([]);
        setErrorMessage(data.error || "Failed to load wallet data.");
      }
    } catch {
      setWalletBalance(0);
      setTransactions([]);
      setErrorMessage("Failed to load wallet data.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenWallet = () => {
    if (!walletEmail) {
      setErrorMessage("Sign in to access your wallet.");
      return;
    }

    if (needsProfile) {
      router.push(
        `/dashboard/my-account?callback=${encodeURIComponent("/dashboard/wallet")}`,
      );
      return;
    }

    router.push("/dashboard/wallet");
  };

  if (checkingSession) {
    return (
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 shadow-sm">
        <p className="text-sm text-slate-400">Checking wallet session...</p>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 shadow-sm">
      <div className="absolute inset-x-0 top-0 h-px bg-sky-500" />
      <div className="flex flex-row items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-300 ring-1 ring-sky-500/20">
            <Wallet className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-white">Wallet balance</h3>
            <p className="text-xs text-slate-400">Funds available for entries and orders.</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-slate-700 bg-slate-950/30 text-slate-200 hover:bg-slate-800"
          onClick={() => setShowTransactions((value) => !value)}
        >
          <History className="h-4 w-4" />
          {showTransactions ? "Hide activity" : "Activity"}
        </Button>
      </div>

      <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/30 px-3 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Available balance
        </p>
        <div className="mt-2 flex items-end justify-between gap-3">
          <p className="text-xl font-semibold tracking-tight text-white">
            {loading ? "Loading..." : formatCurrency(walletBalance)}
          </p>
          <Badge
            variant="outline"
            className="border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
          >
            Active
          </Badge>
        </div>
      </div>

      {errorMessage && (
        <div
          className={`mt-3 rounded-xl border px-3 py-2 text-sm ${
            needsProfile
              ? "border-amber-500/20 bg-amber-500/10 text-amber-200"
              : "border-rose-500/20 bg-rose-500/10 text-rose-200"
          }`}
        >
          {errorMessage}
        </div>
      )}

      <Button
        onClick={handleOpenWallet}
        disabled={loading || !walletEmail || (!!errorMessage && !needsProfile)}
        className="mt-3 w-full bg-sky-600 text-white hover:bg-sky-500"
      >
        <ArrowUpRight className="h-4 w-4" />
        {needsProfile ? "Complete Profile" : "Open Wallet"}
      </Button>

      {showTransactions && (
        <div className="mt-3 space-y-2.5">
          <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Recent transactions
          </h4>
          {transactions.length === 0 ? (
            <p className="text-sm text-slate-500">No transactions yet.</p>
          ) : (
            transactions.slice(0, 5).map((transaction, index) => {
              const positive = Number(transaction.amount || 0) > 0;

              return (
                <div
                  key={index}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/30 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          positive
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                            : "border-rose-500/20 bg-rose-500/10 text-rose-300"
                        }
                      >
                        {transaction.type || "Transaction"}
                      </Badge>
                    </div>
                    <p className="mt-1.5 truncate text-sm text-slate-300">
                      {transaction.description || "Wallet activity"}
                    </p>
                  </div>

                  <span
                    className={`whitespace-nowrap font-semibold ${
                      positive ? "text-emerald-300" : "text-rose-300"
                    }`}
                  >
                    {positive ? "+" : ""}
                    {formatCurrency(transaction.amount || 0)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}
    </section>
  );
}
