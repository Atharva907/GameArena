// Disable static generation for this page
export const dynamic = "force-dynamic";

import dynamic from "next/dynamic";

// Dynamically import the dashboard client component with SSR disabled
const DashboardClient = dynamic(() => import("./DashboardClient"), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-screen">
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