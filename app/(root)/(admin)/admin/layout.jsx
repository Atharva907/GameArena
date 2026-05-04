"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ThemeProvider } from "next-themes";
import AppSidebar from "@/components/Application/Admin/AppSidebar";
import Topbar from "@/components/Application/Admin/Topbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { apiFetch } from "@/lib/apiClient";
import { USER_DASHBOARD } from "@/routes/WebsiteRoute";

const Layout = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authErrorMessage, setAuthErrorMessage] = useState("");
  const currentPath = `${pathname || "/admin"}${
    searchParams?.toString() ? `?${searchParams.toString()}` : ""
  }`;
  const loginHref = `/auth/login?callback=${encodeURIComponent(currentPath)}`;

  useEffect(() => {
    let isMounted = true;

    const verifyAdminAccess = async () => {
      try {
        const response = await apiFetch("/user/me");
        const data = await response.json().catch(() => ({}));
        const user = data.data || data;

        if (response.ok) {
          setAuthErrorMessage("");
        } else if (response.status === 401 || response.status === 403) {
          router.replace(loginHref);
          return;
        } else {
          setAuthErrorMessage(
            "Unable to verify your session right now. Please try again later.",
          );
          return;
        }

        if (user.role !== "admin") {
          router.replace(USER_DASHBOARD);
          return;
        }
      } catch {
        setAuthErrorMessage("Unable to verify your session right now. Please try again later.");
      } finally {
        if (isMounted) {
          setCheckingAuth(false);
        }
      }
    };

    verifyAdminAccess();

    return () => {
      isMounted = false;
    };
  }, [router, loginHref]);

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Checking admin session...
      </div>
    );
  }

  if (authErrorMessage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
        <Card className="w-full max-w-lg border-slate-700 bg-slate-900 text-white">
          <CardContent className="space-y-4 p-6 text-center">
            <h1 className="text-2xl font-semibold">Admin dashboard unavailable</h1>
            <p className="text-sm text-slate-300">{authErrorMessage}</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button onClick={() => router.refresh()} className="bg-purple-600 hover:bg-purple-700">
                Retry
              </Button>
              <Button asChild variant="outline" className="border-slate-600 text-white">
                <Link href={USER_DASHBOARD}>User Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SidebarProvider>
        <div className="min-h-screen w-full bg-slate-50 text-foreground dark:bg-slate-950">
          <div className="flex min-h-screen w-full items-stretch">
            <AppSidebar />
            {isSidebarOpen && (
              <AppSidebar mobile onClose={() => setIsSidebarOpen(false)} />
            )}

            <div className="flex min-h-screen min-w-0 flex-1 flex-col">
              <Topbar onOpenSidebar={() => setIsSidebarOpen(true)} />

              <main className="min-w-0 flex-1 px-3 py-4 sm:px-4 sm:py-5 lg:px-6">
                <div className="w-full">{children}</div>
              </main>

              <footer className="border-t border-border/70 bg-background px-3 py-3 sm:px-4 lg:px-6">
                <div className="flex w-full flex-col gap-1 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                  <p>&copy; {new Date().getFullYear()} GameArena</p>
                  <p>Admin dashboard</p>
                </div>
              </footer>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
};

export default Layout;
