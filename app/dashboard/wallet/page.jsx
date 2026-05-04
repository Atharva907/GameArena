"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wallet, ArrowDownRight, Plus, History } from "lucide-react";
import { formatCurrency } from "@/lib/esportUtils";
import TransactionRow from "@/components/dashboard/TransactionRow";
import { useSelector } from "react-redux";
import { apiFetch } from "@/lib/apiClient";

const paymentMethods = ["UPI", "Card", "Netbanking", "Wallet"];

export default function WalletPage() {
  const auth = useSelector((state) => state.authStore.auth);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sessionUser, setSessionUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositMethod, setDepositMethod] = useState("");
  const [isDepositing, setIsDepositing] = useState(false);
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);

  const walletEmail = auth?.email || sessionUser?.email;
  const currentPath = `${pathname || "/dashboard/wallet"}${
    searchParams?.toString() ? `?${searchParams.toString()}` : ""
  }`;

  const getSafeCallback = (value) => {
    if (!value || typeof value !== "string") return null;
    if (!value.startsWith("/") || value.startsWith("//")) return null;
    if (value.startsWith("/auth/")) return null;
    return value;
  };

  const returnTo = getSafeCallback(searchParams.get("callback"));

  useEffect(() => {
    let isMounted = true;

    const fetchSessionUser = async () => {
      try {
        const response = await apiFetch("/user/me");
        const data = await response.json().catch(() => ({}));

        if (response.ok && isMounted) {
          setSessionUser(data.data || data);
        }
      } catch (error) {
        console.error("Error checking wallet session:", error);
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
    const fetchWalletData = async () => {
      if (!walletEmail) {
        if (!checkingSession) {
          setLoading(false);
          setErrorMessage("Sign in to access your wallet.");
        }
        return;
      }

      setLoading(true);

      try {
        const response = await apiFetch(`/wallet?email=${encodeURIComponent(walletEmail)}`);
        const data = await response.json();

        if (response.ok) {
          setErrorMessage("");
          setBalance(Number(data.balance || 0));
          setTransactions(Array.isArray(data.transactions) ? data.transactions : []);
        } else {
          setBalance(0);
          setTransactions([]);
          setErrorMessage(data.error || "Failed to load wallet data.");
        }
      } catch (error) {
        console.error("Error fetching wallet data:", error);
        setBalance(0);
        setTransactions([]);
        setErrorMessage("Failed to load wallet data.");
      } finally {
        setLoading(false);
      }
    };

    if (!checkingSession) {
      fetchWalletData();
    }
  }, [walletEmail, checkingSession]);

  const refreshWallet = async () => {
    if (!walletEmail) return;

    try {
      const response = await apiFetch(`/wallet?email=${encodeURIComponent(walletEmail)}`);
      const data = await response.json();

      if (response.ok) {
        setBalance(Number(data.balance || 0));
        setTransactions(Array.isArray(data.transactions) ? data.transactions : []);
      }
    } catch (error) {
      console.error("Error refreshing wallet data:", error);
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || !depositMethod) return;
    if (!walletEmail) {
      setErrorMessage("Sign in to access your wallet.");
      return;
    }

    setIsDepositing(true);

    try {
      const response = await apiFetch("/wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: walletEmail,
          amount: depositAmount,
          type: "deposit",
          method: depositMethod,
          description: `Deposit via ${depositMethod}`,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setBalance(Number(data.balance || 0));
        setTransactions((prev) => [data.transaction, ...prev]);
        setErrorMessage("");
        setDepositAmount("");
        setDepositMethod("");
        setIsDepositDialogOpen(false);
        if (returnTo) {
          router.push(returnTo);
        }
      } else {
        setErrorMessage(data.error || "Deposit failed.");
      }
    } catch (error) {
      console.error("Error during deposit:", error);
      setErrorMessage("Error during deposit.");
    } finally {
      setIsDepositing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || !withdrawMethod) return;
    if (!walletEmail) {
      setErrorMessage("Sign in to access your wallet.");
      return;
    }

    setIsWithdrawing(true);

    try {
      const response = await apiFetch("/wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: walletEmail,
          amount: withdrawAmount,
          type: "withdraw",
          method: withdrawMethod,
          description: `Withdrawal via ${withdrawMethod}`,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setBalance(Number(data.balance || 0));
        setTransactions((prev) => [data.transaction, ...prev]);
        setErrorMessage("");
        setWithdrawAmount("");
        setWithdrawMethod("");
        setIsWithdrawDialogOpen(false);
      } else {
        setErrorMessage(data.error || "Withdrawal failed.");
      }
    } catch (error) {
      console.error("Error during withdrawal:", error);
      setErrorMessage("Error during withdrawal.");
    } finally {
      setIsWithdrawing(false);
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    if (activeTab === "all") return true;
    if (activeTab === "income") return Number(transaction.amount || 0) > 0;
    if (activeTab === "expenses") return Number(transaction.amount || 0) < 0;
    return true;
  });

  const totalIncome = transactions
    .filter((transaction) => Number(transaction.amount || 0) > 0)
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

  const totalExpenses = Math.abs(
    transactions
      .filter((transaction) => Number(transaction.amount || 0) < 0)
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0),
  );

  if (checkingSession) {
    return (
      <div className="space-y-4 p-3 md:p-4">
        <section className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-400">
          Checking wallet session...
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-3 md:p-4">
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-400">
              Wallet
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-white">
              Manage balance and transactions
            </h1>
            <p className="text-sm text-slate-400">
              Deposit, withdraw, and review account activity without leaving the page.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              asChild
              variant="outline"
              className="border-slate-700 bg-slate-950/30 text-slate-200 hover:bg-slate-800"
            >
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>

            <Dialog open={isDepositDialogOpen} onOpenChange={setIsDepositDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-sky-600 text-white hover:bg-sky-500">
                  <Plus className="h-4 w-4" />
                  Add funds
                </Button>
              </DialogTrigger>
              <DialogContent className="border-slate-800 bg-slate-950 text-slate-100 sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-lg">Add funds</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="deposit-amount">Amount</Label>
                    <Input
                      id="deposit-amount"
                      type="number"
                      min="1"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="border-slate-700 bg-slate-900 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Method</Label>
                    <Select value={depositMethod} onValueChange={setDepositMethod}>
                      <SelectTrigger className="border-slate-700 bg-slate-900 text-white">
                        <SelectValue placeholder="Select a method" />
                      </SelectTrigger>
                      <SelectContent className="border-slate-800 bg-slate-950 text-slate-100">
                        {paymentMethods.map((method) => (
                          <SelectItem key={method} value={method}>
                            {method}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-slate-700 bg-slate-900/60 text-slate-200 hover:bg-slate-800"
                      onClick={() => setIsDepositDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      className="bg-sky-600 text-white hover:bg-sky-500"
                      onClick={handleDeposit}
                      disabled={isDepositing}
                    >
                      {isDepositing ? "Adding..." : "Add funds"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="border-slate-700 bg-slate-950/30 text-slate-200 hover:bg-slate-800"
                >
                  <ArrowDownRight className="h-4 w-4" />
                  Withdraw
                </Button>
              </DialogTrigger>
              <DialogContent className="border-slate-800 bg-slate-950 text-slate-100 sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-lg">Withdraw funds</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="withdraw-amount">Amount</Label>
                    <Input
                      id="withdraw-amount"
                      type="number"
                      min="1"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="border-slate-700 bg-slate-900 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Method</Label>
                    <Select value={withdrawMethod} onValueChange={setWithdrawMethod}>
                      <SelectTrigger className="border-slate-700 bg-slate-900 text-white">
                        <SelectValue placeholder="Select a method" />
                      </SelectTrigger>
                      <SelectContent className="border-slate-800 bg-slate-950 text-slate-100">
                        {paymentMethods.map((method) => (
                          <SelectItem key={method} value={method}>
                            {method}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-slate-700 bg-slate-900/60 text-slate-200 hover:bg-slate-800"
                      onClick={() => setIsWithdrawDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      className="bg-sky-600 text-white hover:bg-sky-500"
                      onClick={handleWithdraw}
                      disabled={isWithdrawing}
                    >
                      {isWithdrawing ? "Processing..." : "Withdraw"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-950/30 px-3 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Current balance
                </p>
                <p className="mt-1 text-lg font-semibold text-white">
                  {loading ? "Loading..." : formatCurrency(balance)}
                </p>
              </div>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-300 ring-1 ring-sky-500/20">
                <Wallet className="h-4 w-4" />
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/30 px-3 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Total deposits
            </p>
            <p className="mt-1 text-lg font-semibold text-emerald-300">
              {formatCurrency(totalIncome)}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/30 px-3 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Total withdrawals
            </p>
            <p className="mt-1 text-lg font-semibold text-rose-300">
              {formatCurrency(totalExpenses)}
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
            <p>{errorMessage}</p>
            {errorMessage.toLowerCase().includes("profile") && (
              <div className="mt-2">
                <Button
                  type="button"
                  className="bg-sky-600 text-white hover:bg-sky-500"
                  onClick={() =>
                    router.push(
                      `/dashboard/my-account?callback=${encodeURIComponent(currentPath)}`,
                    )
                  }
                >
                  Create profile
                </Button>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
              <History className="h-4 w-4 text-sky-300" />
              Transaction history
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Review your recent wallet movements by type.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full lg:w-auto">
            <TabsList className="grid w-full grid-cols-3 bg-slate-950/30 lg:w-[320px]">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="income">Income</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              {loading ? (
                <div className="rounded-xl border border-slate-800 bg-slate-950/30 px-3 py-3 text-sm text-slate-400">
                  Loading transactions...
                </div>
              ) : filteredTransactions.length > 0 ? (
                <div className="space-y-2">
                  {filteredTransactions.map((transaction, index) => (
                    <TransactionRow key={`${transaction.type}-${index}`} {...transaction} />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-slate-800 bg-slate-950/30 px-4 py-4 text-sm text-slate-400">
                  No transactions found for the selected filter.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
