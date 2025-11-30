"use client";
import React, { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-foreground">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white transition-all duration-300 md:ml-64`}>
        <Topbar onOpenSidebar={openSidebar} />
        <main className="flex-1 overflow-y-auto p-4 pt-20 md:pt-4">{children}</main>
      </div>
    </div>
  );
}
