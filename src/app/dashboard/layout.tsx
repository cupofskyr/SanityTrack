
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
  User,
  LogOut,
  ChevronDown,
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
  BrainCircuit,
  Lightbulb,
  DollarSign,
  Camera,
  Package,
  Link as LinkIcon,
  Gift,
  Flag,
  CookingPot,
  Printer,
  ShieldAlert,
  ListTodo,
  Clock,
  Sparkles,
  Award,
  MessageSquare,
  Megaphone,
  Briefcase,
  Bot,
  TrendingUp,
  FileText,
  Handshake,
  Heart,
  CalendarCheck2
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
import { useToast } from "@/hooks/use-toast";

const managerNav = [
    { 
        category: "Daily Operations",
        icon: Activity,
        links: [
          { name: "Dashboard", href: "/dashboard/manager", exact: true },
          { name: "Live Time Clock", href: "/dashboard/manager#time-clock-feed" },
          { name: "Quality Control", href: "/dashboard/manager/quality-control" },
          { name: "Master Task List", href: "/dashboard/manager/equipment" },
        ]
    },
    { 
        category: "Planning & Inventory",
        icon: Calendar,
        links: [
          { name: "Shift Planner", href: "/dashboard/manager/shifts" },
          { name: "Inventory", href: "/dashboard/manager/inventory" },
          { name: "Ordering", href: "/dashboard/manager/ordering" },
          { name: "Food Prep & Labeling", href: "/dashboard/manager/prep" },
        ]
    },
    { 
        category: "Team & Training",
        icon: Users,
        links: [
          { name: "Arcade Zone", href: "/dashboard/training" },
          { name: "Arcade Zone Setup", href: "/dashboard/training/setup"},
          { name: "Knowledge Base", href: "/dashboard/manager/knowledge" },
          { name: "Hiring Requests", href: "/dashboard/manager#hiring-request" },
          { name: "Employee Perks", href: "/dashboard/perks" },
        ]
    },
    {
        category: "Store Tools",
        icon: Wrench,
        links: [
            { name: "Service Contacts", href: "/dashboard/manager#service-contacts" },
        ]
    },
];

const ownerNav = [
    {
        category: "Executive",
        icon: BarChart3,
        links: [
            { name: "Executive Dashboard", href: "/dashboard/owner", exact: true },
            { name: "Live Operations", href: "/dashboard/owner/live-operations" },
            { name: "KPI Overview", href: "/dashboard/owner#kpi-overview" },
        ]
    },
    {
        category: "Strategy & Ops",
        icon: Eye,
        links: [
            { name: "Strategic Command", href: "/dashboard/owner#strategic-command" },
            { name: "Monitoring Setup", href: "/dashboard/owner/monitoring" },
            { name: "Agent Rules", href: "/dashboard/owner/agent-rules" },
            { name: "Agent Alerts", href: "/dashboard/owner#sentinel-alerts" },
        ]
    },
    {
        category: "AI Agents",
        icon: Bot,
        links: [
            { name: "Agent Dashboard", href: "/dashboard/owner/agents" },
            { name: "Create Agent", href: "/dashboard/owner/agents/new" },
            { name: "Agent Templates", href: "/dashboard/owner/agents/templates" },
        ]
    },
    {
        category: "Growth & Compliance",
        icon: Lightbulb,
        links: [
            { name: "Permit Applications", href: "/dashboard/owner/permits" },
            { name: "Document Storage", href: "/dashboard/owner/documents" },
        ]
    },
     {
        category: "System Admin",
        icon: Settings,
        links: [
            { name: "Team & Permissions", href: "/dashboard/owner/team" },
            { name: "Branding", href: "/dashboard/owner/branding" },
            { name: "API Integrations", href: "/dashboard/owner/integrations" },
            { name: "Feature Flags", href: "/dashboard/owner/features" },
        ]
    },
    {
        category: "Financials",
        icon: DollarSign,
        links: [
            { name: "Financial Overview", href: "/dashboard/owner/financials" },
            { name: "Billing", href: "/dashboard/owner/billing"},
        ]
    }
];

const employeeNav = [
    {
        category: "My Day",
        icon: LayoutDashboard,
        links: [
            { name: "Dashboard", href: "/dashboard/employee", exact: true, icon: LayoutDashboard },
            { name: "My Schedule", href: "/dashboard/employee/schedule", icon: CalendarCheck2 },
            { name: "Tasks & Checklists", href: "/dashboard/employee#tasks-checklists", icon: ListTodo },
            { name: "Clock In / Clock Out", href: "/dashboard/employee#clock-in-out", icon: Clock },
        ]
    },
    {
        category: "Learn & Grow",
        icon: Award,
        links: [
            { name: "Arcade Zone", href: "/dashboard/training", icon: Sparkles },
            { name: "Training Progress", href: "/dashboard/employee#performance-card", icon: TrendingUp },
            { name: "Knowledge Base", href: "/dashboard/brain", icon: BrainCircuit },
            { name: "Feedback Center", href: "/dashboard/employee", icon: Handshake },
        ]
    },
    {
        category: "Company Info",
        icon: Briefcase,
        links: [
            { name: "Company Perks", href: "/dashboard/perks", icon: Gift },
            { name: "Store Announcements", href: "/dashboard/employee", icon: Megaphone },
            { name: "Team Directory", href: "/dashboard/employee#whos-on-shift", icon: Users },
            { name: "Service Contacts", href: "/dashboard/employee", icon: FileText },
        ]
    },
    {
        category: "Ask the Brain",
        icon: BrainCircuit,
        links: [
            { name: "Chat with Assistant", href: "/dashboard/brain", icon: MessageSquare },
            { name: "My Questions History", href: "/dashboard/brain", icon: Heart },
        ]
    }
];


const inspectorNav = [
    { name: "Dashboard", href: "/dashboard/health-department", icon: LayoutDashboard },
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
  const { toast } = useToast();

  React.useEffect(() => {
    
    const policyAccepted = sessionStorage.getItem('leifur-ai-policy-accepted');
    if (!loading && user && policyAccepted !== 'true') {
      setIsPolicyModalOpen(true);
    }
  }, [loading, user]);


  React.useEffect(() => {
    
    const savedRole = sessionStorage.getItem('userRole');
    if (savedRole) {
      setRole(savedRole);
    }
  }, []);

  React.useEffect(() => {
    
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
      sessionStorage.setItem('leifur-ai-policy-accepted', 'true');
      setIsPolicyModalOpen(false);
    }
  };
  
  const handleLanguageChange = (lang: string) => {
    toast({
        title: "Language preference updated (simulated)",
        description: `Interface has been set to ${lang}.`
    });
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
      case "Employee":
        navItems = employeeNav;
        break;
      case "Health Department":
        return (
            <SidebarMenu>
                {inspectorNav.map((item) => (
                    <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.name}>
                            <Link href={item.href}><item.icon /><span>{item.name}</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        );
      default:
        navItems = employeeNav;
    }

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
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Logo className="h-7 w-7 text-primary" />
            <span className="text-lg font-semibold text-primary font-headline group-data-[collapsible=icon]:hidden">
              Leifur.AI
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
                            <Avatar className="h-9 w-9 relative">
                                <AvatarImage src={user?.photoURL || "https://placehold.co/100x100.png"} alt="User Avatar" data-ai-hint="user avatar" />
                                <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
                                <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />
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
                <UserCog className="mr-2 h-4 w-4" />
                <span>Permissions</span>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/owner/billing">
                    <DollarSign className="mr-2 h-4 w-4" />
                    <span>Billing</span>
                </Link>
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
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <div className="md:hidden">
            <SidebarTrigger />
          </div>
          <h1 className="text-2xl font-headline font-bold hidden md:block">{role} Dashboard</h1>
          <div className="flex items-center gap-4">
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                        <Languages className="mr-2 h-4 w-4"/>
                        <span>EN</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleLanguageChange('English')}>🇺🇸 English</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleLanguageChange('Spanish')}>🇲🇽 Español</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleLanguageChange('Icelandic')}>🇮🇸 Íslenska</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          {loading ? (
             <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
          ) : (
            <>
              {children}
              <Dialog open={isPolicyModalOpen} onOpenChange={(open) => {
                if (!open && !isPolicyAccepted) {
                    setIsPolicyModalOpen(true);
                } else {
                    setIsPolicyModalOpen(open);
                }
              }}>
                <DialogContent showCloseButton={false} onInteractOutside={(e) => e.preventDefault()}>
                  <DialogHeader>
                    <DialogTitle className="font-headline text-2xl">Terms of Use & AI Notice</DialogTitle>
                    <DialogDescription>
                      Before using Leifur.AI, please read and agree to the following terms.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto text-sm text-muted-foreground pr-2">
                    <p>Welcome to Leifur.AI. This is a powerful operational tool designed to improve safety, efficiency, and compliance.</p>
                    <h4 className="font-semibold text-foreground">AI & Camera Usage</h4>
                    <p>By using this application, you acknowledge and agree that Leifur.AI utilizes Artificial Intelligence (AI) and camera-based monitoring for operational purposes. This includes, but is not limited to:</p>
                    <ul className="list-disc list-inside space-y-1 pl-2">
                        <li>Analyzing camera feeds to detect potential safety hazards (e.g., spills), assess quality standards, and monitor operational efficiency (e.g., wait times).</li>
                        <li>Generating tasks, reports, and communications based on AI analysis of data you provide or data collected through application features.</li>
                        <li>Using photos you upload for task completion verification, issue reporting, and AI analysis.</li>
                    </ul>
                    <h4 className="font-semibold text-foreground">Data & Privacy</h4>
                    <p>All data, including images and text you provide, is processed to power the application's features. We are committed to handling your data responsibly. This is a demonstration application; do not upload sensitive personal or business information.</p>
                     <h4 className="font-semibold text-foreground">User Agreement</h4>
                    <p>You agree to use Leifur.AI responsibly and in accordance with all applicable laws and company policies. You understand that this tool is used for operational management and compliance monitoring.</p>
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
