"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Wallet, User, Gamepad2, ShoppingCart } from "lucide-react";

export default function QuickNavigation() {
  return (
    <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 text-white mb-6 shadow-xl overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600"></div>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <span className="h-5 w-1 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></span>
          Quick Access
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Link href="/dashboard">
            <Button variant="outline" className="w-full justify-start gap-2 bg-slate-700/30 border-slate-600 text-gray-300 hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-purple-600/20 hover:border-blue-500/50 transition-all duration-300">
              <div className="p-1 bg-gradient-to-br from-blue-600 to-purple-600 rounded">
                <Gamepad2 className="h-3 w-3 text-white" />
              </div>
              Dashboard
            </Button>
          </Link>
          <Link href="/dashboard/tournaments">
            <Button variant="outline" className="w-full justify-start gap-2 bg-slate-700/30 border-slate-600 text-gray-300 hover:bg-gradient-to-r hover:from-yellow-600/20 hover:to-orange-600/20 hover:border-yellow-500/50 transition-all duration-300">
              <div className="p-1 bg-gradient-to-br from-yellow-600 to-orange-600 rounded">
                <Trophy className="h-3 w-3 text-white" />
              </div>
              Tournaments
            </Button>
          </Link>
          <Link href="/dashboard/wallet">
            <Button variant="outline" className="w-full justify-start gap-2 bg-slate-700/30 border-slate-600 text-gray-300 hover:bg-gradient-to-r hover:from-green-600/20 hover:to-emerald-600/20 hover:border-green-500/50 transition-all duration-300">
              <div className="p-1 bg-gradient-to-br from-green-600 to-emerald-600 rounded">
                <Wallet className="h-3 w-3 text-white" />
              </div>
              Wallet
            </Button>
          </Link>
          <Link href="/shop">
            <Button variant="outline" className="w-full justify-start gap-2 bg-slate-700/30 border-slate-600 text-gray-300 hover:bg-gradient-to-r hover:from-pink-600/20 hover:to-red-600/20 hover:border-pink-500/50 transition-all duration-300">
              <div className="p-1 bg-gradient-to-br from-pink-600 to-red-600 rounded">
                <ShoppingCart className="h-3 w-3 text-white" />
              </div>
              Shop
            </Button>
          </Link>
          <Link href="/dashboard/my-account">
            <Button variant="outline" className="w-full justify-start gap-2 bg-slate-700/30 border-slate-600 text-gray-300 hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-pink-600/20 hover:border-purple-500/50 transition-all duration-300">
              <div className="p-1 bg-gradient-to-br from-purple-600 to-pink-600 rounded">
                <User className="h-3 w-3 text-white" />
              </div>
              Profile
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}