"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Wallet,
  User,
  ShoppingCart,
  ArrowRight,
  Gamepad2,
} from "lucide-react";

const quickLinks = [
  {
    href: "/dashboard",
    title: "Overview",
    description: "Return to the main dashboard summary.",
    icon: LayoutDashboard,
    tone: "sky",
  },
  {
    href: "/dashboard/tournaments",
    title: "Tournaments",
    description: "Browse live and upcoming events.",
    icon: Gamepad2,
    tone: "sky",
  },
  {
    href: "/dashboard/wallet",
    title: "Wallet",
    description: "Check your balance and recent transactions.",
    icon: Wallet,
    tone: "emerald",
  },
  {
    href: "/shop",
    title: "Shop",
    description: "Open the storefront and cart flow.",
    icon: ShoppingCart,
    tone: "amber",
  },
  {
    href: "/dashboard/my-account",
    title: "Profile",
    description: "Review player information and settings.",
    icon: User,
    tone: "rose",
  },
];

const toneMap = {
  sky: "bg-sky-500/10 text-sky-300 ring-sky-500/20",
  emerald: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/20",
  amber: "bg-amber-500/10 text-amber-300 ring-amber-500/20",
  rose: "bg-rose-500/10 text-rose-300 ring-rose-500/20",
};

export default function QuickNavigation() {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white">Quick access</h3>
          <p className="text-xs text-slate-400">
            Jump to the areas you use most often.
          </p>
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
        {quickLinks.map(({ href, title, description, icon: Icon, tone }) => (
          <Link
            key={title}
            href={href}
            className="group rounded-xl border border-slate-800 bg-slate-950/30 px-3 py-3 transition-all hover:border-sky-500/30 hover:bg-slate-950/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30"
          >
            <div className="flex items-start gap-3">
              <span
                className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ${toneMap[tone]}`}
              >
                <Icon className="h-4 w-4" />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-white">{title}</p>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-500 transition-transform group-hover:translate-x-0.5 group-hover:text-sky-400" />
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-400">{description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
