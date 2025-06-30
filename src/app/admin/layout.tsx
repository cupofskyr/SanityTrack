
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
  Shield,
  Component,
  FileText,
  Flag,
  Home,
  Bot
} from "lucide-react";
import { Logo } from "@/components/icons";
import { Button } from "@/components/ui/button";

const adminNav = [
    { name: "Admin Home", href: "/admin", icon: Shield, exact: true },
    { name: "System Handbook", href: "/admin/documentation", icon: FileText },
    { name: "UI Components", href: "/admin/components", icon: Component },
    { name: "Feature Flags", href: "/admin/features", icon: Flag },
    { name: "AI Agent Rules", href: "/admin/agent-rules", icon: Bot },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Logo className="h-7 w-7 text-primary" />
            <span className="text-lg font-semibold text-primary font-headline group-data-[collapsible=icon]:hidden">
              Leifur AI
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
            <SidebarMenu>
                {adminNav.map((item) => (
                    <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.name}>
                            <Link href={item.href}>
                                <item.icon />
                                <span>{item.name}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
            <Button variant="ghost" asChild className="w-full justify-start">
                <Link href="/">
                    <Home className="mr-2"/>
                    <span className="group-data-[collapsible=icon]:hidden">Back to Main App</span>
                </Link>
            </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <div className="md:hidden">
            <SidebarTrigger />
          </div>
          <h1 className="text-2xl font-headline font-bold hidden md:block">Admin Panel</h1>
        </header>
        <main className="flex-1 p-4 md:p-6">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
