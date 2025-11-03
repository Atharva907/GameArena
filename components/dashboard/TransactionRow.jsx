"use client";

import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, getTransactionColor } from "@/lib/esportUtils";
import { Trophy, ArrowUpRight, ArrowDownRight, CreditCard, Gift, Wallet } from "lucide-react";

export default function TransactionRow({ date, type, amount, status, tournamentId, description }) {
  // Get appropriate icon based on transaction type
  const getTransactionIcon = (type) => {
    switch (type) {
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
  
  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-600/20 text-green-300 border-green-500/50";
      case "pending":
        return "bg-yellow-600/20 text-yellow-300 border-yellow-500/50";
      case "failed":
        return "bg-red-600/20 text-red-300 border-red-500/50";
      default:
        return "bg-gray-600/20 text-gray-300 border-gray-500/50";
    }
  };
  
  return (
    <div className="flex items-center justify-between py-3 px-4 hover:bg-slate-700/30 rounded-lg transition-colors">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${amount > 0 ? "bg-green-500/20" : "bg-red-500/20"}`}>
          <div className={amount > 0 ? "text-green-400" : "text-red-400"}>
            {getTransactionIcon(type)}
          </div>
        </div>
        
        <div>
          <p className="font-medium text-white">{type}</p>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>{formatDate(date)}</span>
            {description && (
              <>
                <span>•</span>
                <span>{description}</span>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {status && (
          <Badge variant="outline" className={getStatusColor(status)}>
            {status}
          </Badge>
        )}
        
        <p className={`font-semibold ${getTransactionColor(type)}`}>
          {amount > 0 ? `+${formatCurrency(amount)}` : formatCurrency(amount)}
        </p>
      </div>
    </div>
  );
}
