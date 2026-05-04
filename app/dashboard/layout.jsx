"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { apiFetch } from "@/lib/apiClient";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authErrorMessage, setAuthErrorMessage] = useState("");
  const currentPath = `${pathname || "/dashboard"}${
    searchParams?.toString() ? `?${searchParams.toString()}` : ""
  }`;
  const loginHref = `/auth/login?callback=${encodeURIComponent(currentPath)}`;

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  useEffect(() => {
    let isMounted = true;

    const verifyDashboardAccess = async () => {
      try {
        const response = await apiFetch("/user/me");
        if (response.ok) {
          setAuthErrorMessage("");
        } else if (response.status === 401 || response.status === 403) {
          router.replace(loginHref);
          return;
        } else {
          setAuthErrorMessage(
            "Unable to verify your session right now. Please try again later.",
          );
        }
      } catch {
        setAuthErrorMessage(
          "Unable to verify your session right now. Please try again later.",
        );
      } finally {
        if (isMounted) {
          setCheckingAuth(false);
        }
      }
    };

    verifyDashboardAccess();

    return () => {
      isMounted = false;
    };
  }, [router, loginHref]);

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-6 py-5 shadow-sm">
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <span className="h-3 w-3 animate-pulse rounded-full bg-sky-500" />
            Checking session...
          </div>
        </div>
      </div>
    );
  }

  if (authErrorMessage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
        <section className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-white">
            Dashboard unavailable
          </h1>
          <p className="mt-2 text-sm text-slate-400">{authErrorMessage}</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button onClick={() => router.refresh()} className="bg-sky-600 hover:bg-sky-500">
              Retry
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-slate-700 bg-slate-900/60 text-slate-200 hover:bg-slate-800"
            >
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="dashboard-shell flex h-screen bg-slate-950 text-slate-100">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      <div className="flex flex-1 flex-col transition-all duration-300 md:ml-64">
        <Topbar onOpenSidebar={openSidebar} />
        <main className="flex-1 min-h-0 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
