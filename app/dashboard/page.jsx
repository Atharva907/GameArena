// Disable static generation for this page
export const dynamic = "force-dynamic";

import nextDynamic from "next/dynamic";

const DashboardClient = nextDynamic(() => import("./DashboardClient"), {
  loading: () => (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-6 py-5 shadow-sm">
        <div className="flex items-center gap-3 text-sm text-slate-300">
          <span className="h-3 w-3 animate-pulse rounded-full bg-sky-500" />
          Loading dashboard...
        </div>
      </div>
    </div>
  ),
});

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <DashboardClient />
    </main>
  );
}
