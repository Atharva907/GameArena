"use client";

import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, getTransactionColor } from "@/lib/esportUtils";
import {
  Trophy,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Gift,
  Wallet,
} from "lucide-react";

export default function TransactionRow({ date, type, amount, status, description }) {
  const getTransactionIcon = (value) => {
    switch (value) {
      case "Tournament Win":
        return <Trophy className="h-4 w-4" />;
      case "Withdrawal":
        return <ArrowDownRight className="h-4 w-4" />;
      case "Deposit":
        return <ArrowUpRight className="h-4 w-4" />;
      case "Bonus":
        return <Gift className="h-4 w-4" />;
      case "Tournament Entry Fee":
        return <CreditCard className="h-4 w-4" />;
      default:
        return <Wallet className="h-4 w-4" />;
    }
  };

  const getStatusColor = (value) => {
    switch (value) {
      case "completed":
        return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
      case "pending":
        return "border-amber-500/20 bg-amber-500/10 text-amber-300";
      case "failed":
        return "border-rose-500/20 bg-rose-500/10 text-rose-300";
      default:
        return "border-slate-700 bg-slate-800 text-slate-300";
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950/30 px-3 py-2.5 transition-colors hover:border-slate-700 hover:bg-slate-950/50">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`rounded-lg p-1.5 ${
            amount > 0 ? "bg-emerald-500/10" : "bg-rose-500/10"
          }`}
        >
          <div className={amount > 0 ? "text-emerald-300" : "text-rose-300"}>
            {getTransactionIcon(type)}
          </div>
        </div>

        <div className="min-w-0">
          <p className="text-sm font-medium text-white">{type}</p>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
            <span>{formatDate(date)}</span>
            {description && (
              <>
                <span aria-hidden="true">•</span>
                <span className="truncate">{description}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {status && (
          <Badge variant="outline" className={`${getStatusColor(status)} text-[11px]`}>
            {status}
          </Badge>
        )}

        <p className={`text-sm font-semibold ${getTransactionColor(type)}`}>
          {amount > 0 ? `+${formatCurrency(amount)}` : formatCurrency(amount)}
        </p>
      </div>
    </div>
  );
}
