"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink } from "lucide-react";
import ThemeSwitch from "./ThemeSwitch";
import UserDropdown from "./UserDropdown";
import { Button } from "@/components/ui/button";
import { RiMenu4Fill } from "react-icons/ri";

const getSectionTitle = (pathname) => {
  if (pathname === "/admin" || pathname === "/admin/dashboard") {
    return "Dashboard";
  }

  if (pathname.startsWith("/admin/products")) {
    return "Products";
  }

  if (pathname.startsWith("/admin/orders")) {
    return "Orders";
  }

  if (pathname.startsWith("/admin/users")) {
    return "Users";
  }

  if (pathname.startsWith("/admin/categories")) {
    return "Categories";
  }

  if (pathname.startsWith("/admin/tournaments")) {
    return "Tournaments";
  }

  if (pathname.startsWith("/admin/media")) {
    return "Media";
  }

  return "Admin";
};

const Topbar = ({ onOpenSidebar = () => {} }) => {
  const pathname = usePathname();
  const sectionTitle = getSectionTitle(pathname);

  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-border/70 bg-background/95 backdrop-blur">
      <div className="flex h-14 items-center justify-between gap-3 px-3 sm:px-4 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            onClick={onOpenSidebar}
            type="button"
            size="icon"
            variant="outline"
            className="size-8 rounded-lg lg:hidden"
            aria-label="Open sidebar"
          >
            <RiMenu4Fill className="size-4" />
          </Button>

          <div className="min-w-0">
            <p className="text-[11px] text-muted-foreground">GameArena admin</p>
            <p className="truncate text-[13px] font-semibold text-foreground">
              {sectionTitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="outline"
            className="hidden h-8 rounded-lg px-3 text-[12px] sm:inline-flex"
          >
            <Link href="/" target="_blank" rel="noreferrer">
              <ExternalLink className="size-4" />
              View Site
            </Link>
          </Button>
          <ThemeSwitch />
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default Topbar;
