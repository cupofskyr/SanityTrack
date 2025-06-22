
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  ClipboardList,
  User,
  LogOut,
  ChevronDown,
  CalendarDays,
  Boxes,
  Wrench,
} from "lucide-react";
import { Logo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const getRole = () => {
    if (pathname.includes("/employee")) return "Employee";
    if (pathname.includes("/manager")) return "Manager";
    if (pathname.includes("/health-department")) return "Health Department";
    return "User";
  };

  const role = getRole();
  const getDashboardLink = () => {
    if (role === "Employee") return "/dashboard/employee";
    if (role === "Manager") return "/dashboard/manager";
    if (role === "Health Department") return "/dashboard/health-department";
    return "/dashboard";
  };

  const baseNavItems = [
    { href: getDashboardLink(), icon: LayoutDashboard, label: "Dashboard" },
    { href: "/taskboard", icon: ClipboardList, label: "Taskboard" },
  ];

  const managerNavItems = [
    { href: "/dashboard/manager/shifts", icon: CalendarDays, label: "Shift Planner" },
    { href: "/dashboard/manager/inventory", icon: Boxes, label: "Inventory & Counting" },
    { href: "/dashboard/manager/equipment", icon: Wrench, label: "Equipment Setup" },
  ];

  const navItems = role === "Manager" ? [...baseNavItems, ...managerNavItems] : baseNavItems;


  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Logo className="h-7 w-7 text-primary" />
            <span className="text-lg font-semibold text-primary font-headline">
              SanityTrack
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href)}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-14 w-full justify-start px-2">
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src="https://placehold.co/100x100.png" alt="User Avatar" data-ai-hint="user avatar" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div className="hidden text-left group-data-[collapsible=icon]:hidden">
                      <p className="font-semibold">Demo User</p>
                      <p className="text-xs text-muted-foreground">{role}</p>
                    </div>
                  </div>
                  <ChevronDown className="hidden h-4 w-4 group-data-[collapsible=icon]:hidden" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/login">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <div className="md:hidden">
            <SidebarTrigger />
          </div>
          <h1 className="text-2xl font-headline font-bold hidden md:block">{role} Dashboard</h1>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
