"use client";

import Link from "next/link";
import { Home, User, Trophy, Settings, Wallet, Gamepad2, X, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Overview", href: "/dashboard", icon: Home, color: "from-blue-600 to-purple-600" },
  { name: "My Account", href: "/dashboard/my-account", icon: User, color: "from-purple-600 to-pink-600" },
  { name: "Tournaments", href: "/dashboard/tournaments", icon: Gamepad2, color: "from-orange-600 to-red-600" },
  { name: "My Tournaments", href: "/dashboard/my-tournaments", icon: Trophy, color: "from-yellow-600 to-orange-600" },
  { name: "Orders", href: "/dashboard/orders", icon: Package, color: "from-indigo-600 to-blue-600" },
  { name: "Wallet", href: "/dashboard/wallet", icon: Wallet, color: "from-green-600 to-emerald-600" },
];

export default function Sidebar({ isOpen = false, onClose = () => {} }) {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 z-50 flex flex-col
          transform transition-transform duration-300 ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0`}
        aria-hidden={isOpen ? "false" : "true"}
      >
        {/* Header: title + close button */}
        <div className="border-b border-slate-700 p-4 flex justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600"></div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">Player Panel</h1>
          {/* Close button */}
          <Button
            onClick={onClose}
            type="button"
            size="icon"
            className="md:hidden bg-slate-800 hover:bg-slate-700 border border-slate-600"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5 text-white" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map(({ name, href, icon: Icon, color }) => (
            <Link
              key={name}
              href={href}
              onClick={onClose}
              className="group flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-slate-700/50 transition-all duration-300 relative overflow-hidden"
            >
              <div className={`p-1.5 rounded-lg bg-gradient-to-br ${color} group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={16} className="text-white" />
              </div>
              <span className="font-medium group-hover:text-white transition-colors duration-300">{name}</span>
              <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
            </Link>
          ))}
        </nav>
        
        {/* Footer with gaming theme */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center justify-center mb-2">
            <div className="h-1 w-20 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-full"></div>
          </div>
          <p className="text-xs text-center text-gray-400">GameArena Dashboard</p>
        </div>
      </aside>
    </>
  );
}
