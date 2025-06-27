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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, } from "@/components/ui/accordion";
import {
  LayoutDashboard,
  ClipboardList,
  User,
  LogOut,
  ChevronDown,
  BookOpen,
  Languages,
  UserCog,
  Loader2,
  Activity,
  Calendar,
  Users,
  Wrench,
  BarChart3,
  Eye,
  Settings,
  CalendarDays,
  BrainCircuit,
  ChefHat,
  Database,
  Bot,
  FileText as FileTextIcon,
  ShoppingCart
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

const managerNav = [
  { 
    category: "Live Operations",
    icon: Activity,
    links: [
      { name: "Dashboard", href: "/dashboard/manager", exact: true },
      { name: "Live Time Clock", href: "/dashboard/manager#time-clock-feed" },
      { name: "QA & Service Alerts", href: "/dashboard/manager/quality-control" },
    ]
  },
  { 
    category: "Planning & Prep",
    icon: Calendar,
    links: [
      { name: "Shift Planner", href: "/dashboard/manager/shifts" },
      { name: "Inventory", href: "/dashboard/manager/inventory" },
      { name: "Ordering", href: "/dashboard/manager/ordering" },
      { name: "Hiring Requests", href: "/dashboard/manager#hiring-request" },
    ]
  },
   { 
    category: "Team & Quality",
    icon: Users,
    links: [
      { name: "Training Center", href: "/dashboard/training" },
      { name: "Quality Control", href: "/dashboard/manager/quality-control" },
    ]
  },
  {
    category: "Store Setup",
    icon: Wrench,
    links: [
        { name: "Master Task List", href: "/dashboard/manager/equipment" },
        { name: "Service Contacts", href: "/dashboard/manager#service-contacts" },
    ]
  },
];

const ownerNav = [
    {
        category: "Executive Dashboard",
        icon: BarChart3,
        links: [
            { name: "KPI Overview", href: "/dashboard/owner", exact: true },
        ]
    },
    {
        category: "Strategic Oversight",
        icon: Eye,
        links: [
            { name: "High-Priority Approvals", href: "/dashboard/owner#high-priority-approvals" },
            { name: "Agent Activity Log", href: "/dashboard/owner#agent-activity-log" },
            { name: "AI Monitoring Setup", href: "/dashboard/owner#ai-monitoring" },
        ]
    },
     {
        category: "Records & Compliance",
        icon: FileTextIcon,
        links: [
            { name: "Permit Applications", href: "/dashboard/owner/permits" },
            { name: "Document Storage", href: "/dashboard/owner/documents" },
        ]
    },
    {
        category: "Operational Oversight",
        icon: Wrench,
        links: [
            { name: "Shift Planner", href: "/dashboard/manager/shifts" },
            { name: "Inventory", href: "/dashboard/manager/inventory" },
            { name: "Ordering", href: "/dashboard/manager/ordering" },
            { name: "Quality Control", href: "/dashboard/manager/quality-control" },
            { name: "Master Task List", href: "/dashboard/manager/equipment" },
        ]
    },
    {
        category: "System Administration",
        icon: Settings,
        links: [
            { name: "Team & Permissions", href: "/dashboard/owner/team" },
            { name: "Branding", href: "/dashboard/owner/branding" },
            { name: "AI Agent Rules", href: "/dashboard/owner/agent-rules" },
            { name: "Billing", href: "/dashboard/owner/billing" },
        ]
    }
];

const employeeNav = [
    { name: "Dashboard", href: "/dashboard/employee", icon: LayoutDashboard },
    { name: "My Schedule", href: "/dashboard/employee", icon: CalendarDays },
    { name: "Training", href: "/dashboard/training", icon: BookOpen },
    { name: "Ask the Brain", href: "/dashboard/brain", icon: BrainCircuit },
];

const inspectorNav = [
    { name: "Dashboard", href: "/dashboard/health-department", icon: LayoutDashboard },
    { name: "Reports", href: "/dashboard/health-department", icon: ClipboardList },
];

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
    
    if (detectedRole) {
        sessionStorage.setItem('userRole', detectedRole);
        setRole(detectedRole);
    }
  }, [pathname]);
  
  const handleLogout = async () => {
      await logout();
  };

  const handleAcceptPolicy = () => {
    if (isPolicyAccepted) {
      sessionStorage.setItem('sanity-track-policy-accepted', 'true');
      setIsPolicyModalOpen(false);
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const renderNav = () => {
    let navItems;
    switch(role) {
      case "Owner":
        navItems = ownerNav;
        break;
      case "Manager":
        navItems = managerNav;
        break;
      case "Health Department":
        navItems = inspectorNav;
        break;
      case "Employee":
      default:
        navItems = employeeNav;
    }

    // For roles with collapsible sections
    if (role === 'Manager' || role === 'Owner') {
        const defaultActive = (navItems as any[]).findIndex(category => 
            category.links.some((link: any) => pathname.startsWith(link.href.split('#')[0]))
        );

        const isLinkActive = (href: string, exact: boolean = false) => {
            const cleanPath = href.split('#')[0];
            if (exact) {
              return pathname === cleanPath;
            }
            return pathname.startsWith(cleanPath);
        };

        return (
            <Accordion type="multiple" defaultValue={[`item-${defaultActive}`]} className="w-full">
                {(navItems as any[]).map((category, index) => (
                    <AccordionItem value={`item-${index}`} key={index} className="border-b-0">
                        <AccordionTrigger className="py-2 px-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground rounded-md hover:no-underline [&[data-state=open]]:bg-accent [&[data-state=open]]:text-accent-foreground">
                           <div className="flex items-center gap-2">
                             <category.icon className="h-4 w-4" />
                             <span className="group-data-[collapsible=icon]:hidden">{category.category}</span>
                           </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-1 pb-0">
                            <SidebarMenu className="pl-4 border-l ml-4">
                                {category.links.map((link: any) => (
                                    <SidebarMenuItem key={link.href}>
                                        <SidebarMenuButton asChild isActive={isLinkActive(link.href, link.exact)} size="sm">
                                            <Link href={link.href}>{link.name}</Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        );
    }

    // For roles with flat navigation
    return (
        <SidebarMenu>
            {(navItems as any[]).map((item) => (
            <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
                >
                <Link href={item.href}>
                    <item.icon />
                    <span>{item.name}</span>
                </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            ))}
      </SidebarMenu>
    );
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Logo className="h-7 w-7 text-primary" />
            <span className="text-lg font-semibold text-primary font-headline group-data-[collapsible=icon]:hidden">
              SanityTrack
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
            {renderNav()}
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
                    <DialogTitle className="font-headline text-2xl">Terms of Use &amp; AI Notice</DialogTitle>
                    <DialogDescription>
                      Before using SanityTrack, please read and agree to the following terms.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto text-sm text-muted-foreground pr-2">
                    <p>Welcome to SanityTrack. This is a powerful operational tool designed to improve safety, efficiency, and compliance.</p>
                    <h4 className="font-semibold text-foreground">AI &amp; Camera Usage</h4>
                    <p>By using this application, you acknowledge and agree that SanityTrack utilizes Artificial Intelligence (AI) and camera-based monitoring for operational purposes. This includes, but is not limited to:</p>
                    <ul className="list-disc list-inside space-y-1 pl-2">
                        <li>Analyzing camera feeds to detect potential safety hazards (e.g., spills), assess quality standards, and monitor operational efficiency (e.g., wait times).</li>
                        <li>Generating tasks, reports, and communications based on AI analysis of data you provide or data collected through application features.</li>
                        <li>Using photos you upload for task completion verification, issue reporting, and AI analysis.</li>
                    </ul>
                    <h4 className="font-semibold text-foreground">Data &amp; Privacy</h4>
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
                        Accept &amp; Continue to Dashboard
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
