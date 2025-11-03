// Disable static generation for this page
export const dynamicConfig = "force-dynamic";

import nextDynamic from "next/dynamic";

// Dynamically import the dashboard client component (client-side only)
const DashboardClient = nextDynamic(() => import("./DashboardClient"), {
  loading: () => (
    <div className="flex justify-center items-center h-screen bg-slate-900">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  ),
});

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <DashboardClient />
    </main>
  );
}
