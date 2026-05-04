"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { showToast } from "@/lib/showToast";
import { logout } from "@/store/reducer/authReducer";
import { Menu, User, LogOut } from "lucide-react";
import { apiFetch } from "@/lib/apiClient";

const routeLabels = [
  ["/dashboard", "Overview"],
  ["/dashboard/tournaments", "Tournaments"],
  ["/dashboard/my-tournaments", "My Tournaments"],
  ["/dashboard/wallet", "Wallet"],
  ["/dashboard/orders", "Orders"],
  ["/dashboard/my-account", "My Account"],
];

function getSectionLabel(pathname) {
  return (
    routeLabels.find(([href]) => pathname === href || pathname.startsWith(`${href}/`))?.[1] ||
    "Dashboard"
  );
}

export default function Topbar({ onOpenSidebar = () => {} }) {
  const [playerName, setPlayerName] = useState("Player");
  const router = useRouter();
  const dispatch = useDispatch();
  const pathname = usePathname();
  const sectionLabel = getSectionLabel(pathname || "/dashboard");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await apiFetch("/user/me");
        if (!response.ok) return;

        const responseData = await response.json();
        const userData = responseData.data || responseData;

        if (userData.email) {
          const playerResponse = await apiFetch(
            `/player?email=${encodeURIComponent(userData.email)}`,
          );

          if (playerResponse.ok) {
            const playerData = await playerResponse.json();
            if (playerData.fullName) {
              setPlayerName(playerData.fullName.split(" ")[0]);
              return;
            }
          }
        }

        if (userData.name) {
          setPlayerName(userData.name.split(" ")[0]);
        }
      } catch {
        // Ignore session fetch errors here. The layout guard handles access control.
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await apiFetch("/auth/logout", { method: "POST" });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Logout failed");
      }

      dispatch(logout());
      localStorage.removeItem("playerEmail");
      showToast("success", data.message);
      router.replace("/auth/login");
    } catch (error) {
      showToast("error", error.message || "Logout failed");
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            onClick={onOpenSidebar}
            type="button"
            size="icon"
            className="border border-slate-800 bg-slate-900 text-slate-100 hover:bg-slate-800 md:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-400">
              {sectionLabel}
            </p>
            <h2 className="truncate text-base font-semibold text-white">
              Welcome back, {playerName}
            </h2>
            <p className="text-xs text-slate-400">
              Manage your competitive profile and activity.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard/my-account")}
            className="border-slate-700 bg-slate-900/70 text-slate-200 hover:bg-slate-800"
          >
            <User className="h-4 w-4" />
            Profile
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-rose-500/30 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20 hover:text-white"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
