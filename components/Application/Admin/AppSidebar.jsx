"use client";
import React from "react";
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import Image from "next/image";
import logoBlack from "@/public/assets/images/logo-white.png";
import logoWhite from "@/public/assets/images/logo-black.png";
import { Button } from "@/components/ui/button";
import { LuChevronRight } from "react-icons/lu";
import { IoMdClose } from "react-icons/io";
import { adminSidebarMenu } from "@/lib/adminSidebarMenu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Link from "next/link";

const AppSidebar = ({ isOpen = false, onClose = () => {} }) => {
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
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-card border-r z-50 flex flex-col
          transform transition-transform duration-300 ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          } md:relative md:translate-x-0`}
        aria-hidden={isOpen ? "false" : "true"}
      >
        {/* Header: logo + close button */}
        <SidebarHeader className="border-b h-24 p-0">
          <div className="flex items-center justify-between px-4 h-full w-full">
            {/* Logo group */}
            <div className="flex items-center gap-4">
              <Image
                src={logoBlack}
                width={150}
                height={80}
                className="block dark:hidden"
                alt="logo-dark"
              />
              <Image
                src={logoWhite}
                width={150}
                height={80}
                className="hidden dark:block"
                alt="logo-white"
              />
            </div>

            {/* Close button */}
            <Button
              onClick={onClose}
              type="button"
              size="icon"
              className="md:hidden w-14 h-14 flex items-center justify-center"
              aria-label="Close sidebar"
            >
              <IoMdClose className="text-3xl" />
            </Button>
          </div>
        </SidebarHeader>

        {/* Sidebar Content */}
        <SidebarContent className="flex-1 overflow-y-auto p-3">
          <SidebarMenu>
            {adminSidebarMenu.map((menu, index) => (
              <Collapsible key={index} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      asChild
                      className="px-3 py-3 flex items-center w-full text-left text-sm" 
                    >
                      <Link
                        href={menu?.url}
                        className="flex items-center w-full gap-3 text-sm" 
                      >
                        <menu.icon className="text-base" /> 
                        <span>{menu.title}</span>
                        {menu.submenu?.length > 0 && (
                          <LuChevronRight className="ml-auto text-base transition-transform duration-200 group-data-[state-open]/collapsible:rotate-90" /> 
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>

                  {menu.submenu?.length > 0 && (
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {menu.submenu.map((sub, si) => (
                          <SidebarMenuSubItem key={si}>
                            <SidebarMenuSubButton
                              asChild
                              className="px-3 py-2 text-sm" 
                            >
                              <Link href={sub.url}>{sub.title}</Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  )}
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </aside>
    </>
  );
};

export default AppSidebar;
