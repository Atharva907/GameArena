"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LuChevronRight } from "react-icons/lu";
import { IoMdClose } from "react-icons/io";
import { Button } from "@/components/ui/button";
import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { adminSidebarMenu } from "@/lib/adminSidebarMenu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import adminLogo from "@/public/assets/images/adminlogo.png";

const routeMatchesPath = (pathname, url) => {
  if (!url || url === "#") {
    return false;
  }

  return pathname === url || pathname.startsWith(`${url}/`);
};

const routeIsExact = (pathname, url) => {
  if (!url || url === "#") {
    return false;
  }

  return pathname === url;
};

const menuIsExpanded = (pathname, menu) => {
  if (routeMatchesPath(pathname, menu.url)) {
    return true;
  }

  return menu.submenu?.some((subMenu) => routeMatchesPath(pathname, subMenu.url));
};

const hasUsableRoute = (url) => Boolean(url && url !== "#");

const baseItemClass =
  "h-9 rounded-xl px-2.5 py-2 text-[13px] font-medium text-slate-600 transition hover:bg-rose-50 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white data-[active=true]:bg-rose-100 data-[active=true]:text-rose-700 dark:data-[active=true]:bg-rose-400/15 dark:data-[active=true]:text-rose-200";

const AppSidebar = ({ mobile = false, onClose = () => {} }) => {
  const pathname = usePathname();

  return (
    <>
      {mobile && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
          onClick={onClose}
          aria-label="Close sidebar overlay"
        />
      )}

      <aside
        className={cn(
          "z-50 flex min-h-0 shrink-0 flex-col overflow-hidden border-r border-border/70 bg-background/95 backdrop-blur",
          mobile
            ? "fixed inset-y-0 left-0 w-[17rem] max-w-[calc(100vw-1rem)] shadow-2xl lg:hidden"
            : "sticky top-0 hidden h-screen w-60 lg:flex",
        )}
      >
        <SidebarHeader className="flex h-14 shrink-0 items-center border-b border-border/70 px-3">
          <div className="flex w-full items-center justify-between gap-3">
            <Link
              href="/admin"
              onClick={mobile ? onClose : undefined}
              className="flex items-center gap-3 leading-none"
            >
              <Image
                src={adminLogo}
                alt="GameArena admin"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <div className="min-w-0 leading-tight">
                <p className="text-[13px] font-semibold text-foreground">GameArena</p>
                <p className="text-[11px] text-muted-foreground">Admin panel</p>
              </div>
            </Link>

            {mobile && (
              <Button
                onClick={onClose}
                type="button"
                size="icon"
                variant="ghost"
                className="size-8 rounded-lg"
                aria-label="Close sidebar"
              >
                <IoMdClose className="text-base" />
              </Button>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent className="min-h-0 flex-1 overflow-y-auto px-2.5 py-3">
          <SidebarMenu className="gap-1">
            {adminSidebarMenu.map((menu) => {
              const hasSubmenu = Array.isArray(menu.submenu) && menu.submenu.length > 0;
              const expanded = menuIsExpanded(pathname, menu);
              const menuHasRoute = hasUsableRoute(menu.url);

              return (
                <Collapsible key={menu.title} defaultOpen={expanded} className="group/collapsible">
                  <SidebarMenuItem>
                    {hasSubmenu ? (
                      <>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton isActive={expanded} className={baseItemClass}>
                            <menu.icon className="size-4 shrink-0" />
                            <span className="flex-1 text-left">
                              {menu.title}
                            </span>
                            <LuChevronRight className="size-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>

                          <CollapsibleContent>
                            <SidebarMenuSub className="mt-1 ml-2 border-l border-border/70 pl-2.5">
                              {menu.submenu.map((subMenu) => {
                              const subActive = routeIsExact(pathname, subMenu.url);
                              const subHasRoute = hasUsableRoute(subMenu.url);

                              return (
                                <SidebarMenuSubItem key={subMenu.title}>
                                  {subHasRoute ? (
                                  <SidebarMenuSubButton
                                      asChild
                                      isActive={subActive}
                                      className={cn(
                                        baseItemClass,
                                        "mt-1 h-8 w-full px-2 py-1.5 text-[12px]",
                                      )}
                                    >
                                      <Link
                                        href={subMenu.url}
                                        onClick={mobile ? onClose : undefined}
                                      >
                                        {subMenu.title}
                                      </Link>
                                    </SidebarMenuSubButton>
                                  ) : (
                                    <SidebarMenuSubButton
                                      isActive={false}
                                      className={cn(
                                        baseItemClass,
                                        "mt-1 h-8 w-full cursor-not-allowed px-2 py-1.5 text-[12px] opacity-50",
                                      )}
                                      aria-disabled="true"
                                    >
                                      {subMenu.title}
                                    </SidebarMenuSubButton>
                                  )}
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </>
                    ) : (
                      <>
                        {menuHasRoute ? (
                          <SidebarMenuButton asChild isActive={expanded} className={baseItemClass}>
                            <Link href={menu.url} onClick={mobile ? onClose : undefined}>
                              <menu.icon className="size-4 shrink-0" />
                              <span>{menu.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        ) : (
                          <SidebarMenuButton
                            isActive={false}
                            className={cn(baseItemClass, "cursor-not-allowed opacity-50")}
                            aria-disabled="true"
                          >
                            <menu.icon className="size-4 shrink-0" />
                            <span>{menu.title}</span>
                          </SidebarMenuButton>
                        )}
                      </>
                    )}
                  </SidebarMenuItem>
                </Collapsible>
              );
            })}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="shrink-0 border-t border-border/70 px-3 py-3">
          <Button
            asChild
            variant="outline"
            className="h-9 w-full justify-start rounded-xl px-3 text-[13px] font-medium"
          >
            <Link href="/" target="_blank" rel="noreferrer">
              Open storefront
            </Link>
          </Button>
        </SidebarFooter>
      </aside>
    </>
  );
};

export default AppSidebar;
