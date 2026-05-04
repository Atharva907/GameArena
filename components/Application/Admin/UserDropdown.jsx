"use client";

import React from "react";
import Link from "next/link";
import { LayoutDashboard, PackagePlus, ShoppingBag } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import adminlogo from "@/public/assets/images/adminlogo.png";
import { useSelector } from "react-redux";
import LogoutButton from "./LogoutButton";

const UserDropdown = () => {
  const auth = useSelector((store) => store.authStore.auth);
  const initials =
    auth?.name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "GA";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg border border-border/80 bg-background px-1.5 py-1 transition hover:bg-accent"
          aria-label="Open user menu"
        >
          <Avatar className="size-7">
            <AvatarImage src={adminlogo.src} alt={auth?.name || "Admin"} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden max-w-24 truncate text-[13px] font-medium sm:inline-block">
            {auth?.name || "Admin"}
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="mr-1 w-56 rounded-xl p-2">
        <DropdownMenuLabel className="px-2 py-2">
          <p className="text-[13px] font-semibold">{auth?.name || "GameArena Admin"}</p>
          <p className="mt-0.5 text-xs font-normal text-muted-foreground">
            {auth?.email || "Signed in to the admin workspace"}
          </p>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/admin" className="cursor-pointer rounded-lg text-[13px]">
            <LayoutDashboard className="size-4" />
            Overview
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/admin/products/new" className="cursor-pointer rounded-lg text-[13px]">
            <PackagePlus className="size-4" />
            Add Product
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/admin/orders" className="cursor-pointer rounded-lg text-[13px]">
            <ShoppingBag className="size-4" />
            View Orders
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <LogoutButton />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
