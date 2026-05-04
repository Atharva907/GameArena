"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Trophy,
  Wallet,
  Gamepad2,
  X,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Tournaments", href: "/dashboard/tournaments", icon: Gamepad2 },
  { name: "My Tournaments", href: "/dashboard/my-tournaments", icon: Trophy },
  { name: "Wallet", href: "/dashboard/wallet", icon: Wallet },
  { name: "Orders", href: "/dashboard/orders", icon: Package },
  { name: "My Account", href: "/dashboard/my-account", icon: User },
];

function isActiveRoute(pathname, href) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar({ isOpen = false, onClose = () => {} }) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800 bg-slate-950/95 backdrop-blur transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="border-b border-slate-800 px-4 py-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10 text-sky-300 ring-1 ring-sky-500/20">
                <Gamepad2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                  GameArena
                </p>
                <h1 className="text-base font-semibold text-white">Player Panel</h1>
              </div>
            </div>

            <Button
              onClick={onClose}
              type="button"
              size="icon"
              className="border border-slate-800 bg-slate-900 text-slate-200 hover:bg-slate-800 md:hidden"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Navigation
          </p>

          <div className="space-y-1">
            {navItems.map(({ name, href, icon: Icon }) => {
              const active = isActiveRoute(pathname, href);

              return (
                <Link
                  key={name}
                  href={href}
                  onClick={onClose}
                  className={`group flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
                    active
                      ? "border-sky-500/30 bg-sky-500/10 text-sky-300"
                      : "border-transparent text-slate-300 hover:border-slate-800 hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                      active
                        ? "bg-sky-500/15 text-sky-300"
                        : "bg-slate-900 text-slate-400 group-hover:bg-slate-800 group-hover:text-slate-200"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="font-medium">{name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-slate-800 p-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Workspace
            </p>
            <p className="mt-1.5 text-xs leading-5 text-slate-300">
              Tournament, wallet, profile, and order tools in one place.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
