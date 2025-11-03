"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function DashboardCard({ title, value }) {
  // Determine gradient based on title
  let gradientClass = "";
  let iconColor = "";
  
  if (title.includes("Tournaments")) {
    gradientClass = "from-blue-600 to-purple-600";
    iconColor = "text-blue-400";
  } else if (title.includes("Wins")) {
    gradientClass = "from-green-600 to-emerald-600";
    iconColor = "text-green-400";
  } else if (title.includes("Win Rate")) {
    gradientClass = "from-orange-600 to-red-600";
    iconColor = "text-orange-400";
  } else if (title.includes("Earnings")) {
    gradientClass = "from-purple-600 to-pink-600";
    iconColor = "text-purple-400";
  }
  
  return (
    <Card className="bg-slate-800 border-slate-700 shadow-lg overflow-hidden relative">
      <div className={`absolute top-0 right-0 h-20 w-20 bg-gradient-to-br ${gradientClass} rounded-bl-full opacity-20`}></div>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-gray-400">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-2xl font-bold ${iconColor}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
