
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  BookOpen,
  GraduationCap,
  Languages,
  UserCog,
  Loader2,
  ChefHat,
  CalendarClock,
  Database,
  BrainCircuit,
  Bot
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import GlobalAICamera from "@/components/global-ai-camera";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [role, setRole] = React.useState("User");
  const [isPolicyModalOpen, setIsPolicyModalOpen] = React.useState(false);
  const [isPolicyAccepted, setIsPolicyAccepted] = React.useState(false);

  React.useEffect(() => {
    // Check for policy acceptance on mount. Use sessionStorage for session-only persistence.
    const policyAccepted = sessionStorage.getItem('sanity-track-policy-accepted');
    if (!loading && user && policyAccepted !== 'true') {
      setIsPolicyModalOpen(true);
    }
  }, [loading, user]);

  React.useEffect(() => {
    // On initial load in the browser, try to get the role from session storage
    const savedRole = sessionStorage.getItem('userRole');
    if (savedRole) {
      setRole(savedRole);
    }
  }, []);

  React.useEffect(() => {
    // When the path changes, detect if it's a role-specific page
    let detectedRole = "";
    if (pathname.includes("/owner")) detectedRole = "Owner";
    else if (pathname.includes("/manager")) detectedRole = "Manager";
    else if (pathname.includes("/employee")) detectedRole = "Employee";
    else if (pathname.includes("/health-department")) detectedRole = "Health Department";
    
    // If a role page is detected, update the role and save it to session storage
    if (detectedRole) {
        sessionStorage.setItem('userRole', detectedRole);
        setRole(detectedRole);
    }
  }, [pathname]);

  const getDashboardLink = () => {
    if (role === "Owner") return "/dashboard/owner";
    if (role === "Employee") return "/dashboard/employee";
    if (role === "Manager") return "/dashboard/manager";
    if (role === "Health Department") return "/dashboard/health-department";
    // Fallback to a default dashboard if role is not set
    return "/dashboard/employee";
  };
  
  const handleLogout = async () => {
      await logout();
  };

  const handleAcceptPolicy = () => {
    if (isPolicyAccepted) {
      sessionStorage.setItem('sanity-track-policy-accepted', 'true');
      setIsPolicyModalOpen(false);
    }
  };

  const dashboardLink = getDashboardLink();
  const navItems = [
    { href: dashboardLink, icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/owner/agent-rules", icon: Bot, label: "Agent Rules", roles: ["Owner"]},
    { href: "/dashboard/manager/shifts", icon: CalendarClock, label: "Shifts", roles: ["Manager", "Owner"]},
    { href: "/dashboard/taskboard", icon: ClipboardList, label: "Taskboard", roles: ["Employee", "Manager"] },
    { href: "/dashboard/manager/quality-control", icon: ChefHat, label: "Quality Control", roles: ["Manager", "Owner"] },
    { href: "/dashboard/brain", icon: BrainCircuit, label: "Company Brain", roles: ["Employee", "Manager", "Owner"] },
    { href: "/dashboard/manager/knowledge", icon: Database, label: "Knowledge Base", roles: ["Manager", "Owner"] },
    { href: "/dashboard/training", icon: BookOpen, label: "Training", roles: ["Employee", "Manager", "Owner"] },
    { href: "/dashboard/training/setup", icon: GraduationCap, label: "Training Setup", roles: ["Manager", "Owner"] },
  ];

  const filteredNavItems = navItems.filter(item => !item.roles || item.roles.includes(role));

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  }

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
            {filteredNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
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
          <GlobalAICamera />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-14 w-full justify-start px-2" disabled={loading}>
                 {loading ? (
                    <div className="flex items-center w-full gap-2">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <div className="space-y-1 hidden group-data-[collapsible=icon]:hidden">
                         <Skeleton className="h-4 w-24" />
                         <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                ) : (
                    <div className="flex w-full items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-9 w-9">
                            <AvatarImage src={user?.photoURL || "https://placehold.co/100x100.png"} alt="User Avatar" data-ai-hint="user avatar" />
                            <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
                            </Avatar>
                            <div className="hidden text-left group-data-[collapsible=icon]:hidden">
                            <p className="font-semibold">{user?.displayName || 'Demo User'}</p>
                            <p className="text-xs text-muted-foreground">{role}</p>
                            </div>
                        </div>
                        <ChevronDown className="hidden h-4 w-4 group-data-[collapsible=icon]:hidden" />
                    </div>
                 )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" className="w-56">
              <DropdownMenuLabel>{user ? 'My Account' : 'Account'}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Languages className="mr-2 h-4 w-4" />
                <span>Language</span>
                <span className="ml-auto text-xs text-muted-foreground">English</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <UserCog className="mr-2 h-4 w-4" />
                <span>Permissions</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
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
        <main className="flex-1 p-4 md:p-6">
          {loading ? (
             <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
          ) : (
            <>
              {children}
              <Dialog open={isPolicyModalOpen}>
                <DialogContent showCloseButton={false} onInteractOutside={(e) => e.preventDefault()}>
                  <DialogHeader>
                    <DialogTitle className="font-headline text-2xl">Terms of Use & AI Notice</DialogTitle>
                    <DialogDescription>
                      Before using SanityTrack, please read and agree to the following terms.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto text-sm text-muted-foreground pr-2">
                    <p>Welcome to SanityTrack. This is a powerful operational tool designed to improve safety, efficiency, and compliance.</p>
                    <h4 className="font-semibold text-foreground">AI & Camera Usage</h4>
                    <p>By using this application, you acknowledge and agree that SanityTrack utilizes Artificial Intelligence (AI) and camera-based monitoring for operational purposes. This includes, but is not limited to:</p>
                    <ul className="list-disc list-inside space-y-1 pl-2">
                        <li>Analyzing camera feeds to detect potential safety hazards (e.g., spills), assess quality standards, and monitor operational efficiency (e.g., wait times).</li>
                        <li>Generating tasks, reports, and communications based on AI analysis of data you provide or data collected through application features.</li>
                        <li>Using photos you upload for task completion verification, issue reporting, and AI analysis.</li>
                    </ul>
                    <h4 className="font-semibold text-foreground">Data & Privacy</h4>
                    <p>All data, including images and text you provide, is processed to power the application's features. We are committed to handling your data responsibly. This is a demonstration application; do not upload sensitive personal or business information.</p>
                     <h4 className="font-semibold text-foreground">User Agreement</h4>
                    <p>You agree to use SanityTrack responsibly and in accordance with all applicable laws and company policies. You understand that this tool is used for operational management and compliance monitoring.</p>
                  </div>
                   <div className="flex items-center space-x-2 pt-4 border-t">
                      <Checkbox id="terms" checked={isPolicyAccepted} onCheckedChange={(checked) => setIsPolicyAccepted(checked as boolean)} />
                      <Label htmlFor="terms" className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        I have read and agree to the terms and conditions.
                      </Label>
                    </div>
                  <DialogFooter className="mt-4">
                    <Button onClick={handleAcceptPolicy} disabled={!isPolicyAccepted}>
                        Accept & Continue to Dashboard
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
