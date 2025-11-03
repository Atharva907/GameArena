"use client";

import DashboardCard from "@/components/dashboard/DashboardCard";
import QuickNavigation from "@/components/dashboard/QuickNavigation";
import WalletCard from "@/components/dashboard/WalletCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Gamepad2, TrendingUp, Users, Calendar, Wallet } from "lucide-react";

export default function DashboardClient({ user }) {
  return (
    <div className="space-y-6 p-4 md:p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen rounded-t-3xl">
      <div className="relative overflow-hidden pb-2">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 h-1 w-full"></div>
        <h1 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text">Dashboard</h1>
        <p className="text-gray-400">Welcome back! Here's your esports overview</p>
      </div>

      <QuickNavigation />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <DashboardCard title="Tournaments Played" value="8" />
        <DashboardCard title="Wins" value="3" />
        <DashboardCard title="Win Rate" value="37.5%" />
        <DashboardCard title="Earnings" value="$450" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WalletCard />
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 text-white shadow-xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-xl flex items-center gap-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              <div className="p-1.5 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg">
                <Trophy className="h-4 w-4 text-white" />
              </div>
              Upcoming Tournaments
            </CardTitle>
            <Button variant="outline" size="sm" className="border-purple-500/50 text-purple-300 hover:bg-purple-600/20 hover:border-purple-500 transition-all duration-300">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-700/30 to-slate-800/30 rounded-lg border border-slate-600/50 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Gamepad2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Valorant Blitz Cup</p>
                    <p className="text-xs text-gray-400">Nov 10, 2025</p>
                  </div>
                </div>
                <Badge className="bg-blue-600/20 text-blue-300 border-blue-500/50">Upcoming</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-700/30 to-slate-800/30 rounded-lg border border-slate-600/50 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Gamepad2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">CS2 Battle Arena</p>
                    <p className="text-xs text-gray-400">Nov 18, 2025</p>
                  </div>
                </div>
                <Badge className="bg-blue-600/20 text-blue-300 border-blue-500/50">Upcoming</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 text-white shadow-xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-600 via-emerald-600 to-blue-600"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-xl flex items-center gap-2 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              <div className="p-1.5 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg">
                <Wallet className="h-4 w-4 text-white" />
              </div>
              Recent Transactions
            </CardTitle>
            <Button variant="outline" size="sm" className="border-green-500/50 text-green-300 hover:bg-green-600/20 hover:border-green-500 transition-all duration-300">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-700/30 to-slate-800/30 rounded-lg border border-slate-600/50 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300 cursor-pointer group">
                <div>
                  <p className="font-medium">Tournament Win</p>
                  <p className="text-xs text-gray-400">Oct 18, 2025</p>
                </div>
                <p className="font-semibold text-green-400 group-hover:text-green-300 transition-colors duration-300">+$150</p>
              </div>

              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-700/30 to-slate-800/30 rounded-lg border border-slate-600/50 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300 cursor-pointer group">
                <div>
                  <p className="font-medium">Withdrawal</p>
                  <p className="text-xs text-gray-400">Oct 10, 2025</p>
                </div>
                <p className="font-semibold text-red-400 group-hover:text-red-300 transition-colors duration-300">-$100</p>
              </div>

              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-700/30 to-slate-800/30 rounded-lg border border-slate-600/50 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300 cursor-pointer group">
                <div>
                  <p className="font-medium">Tournament Win</p>
                  <p className="text-xs text-gray-400">Sep 25, 2025</p>
                </div>
                <p className="font-semibold text-green-400 group-hover:text-green-300 transition-colors duration-300">+$225</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}