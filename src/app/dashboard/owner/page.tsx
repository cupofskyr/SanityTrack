
'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import {
  fetchToastDataAction,
  postJobAction,
  runMasterAgentCycleAction,
  generateGhostShopperInviteAction,
  generateMarketingIdeasAction,
} from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, Briefcase, Check, X, Send, ShoppingCart, PlusCircle, Building, Activity, Bot, ShieldCheck, DollarSign, Smile, Users, Eye, Settings, Video, FileText, Handshake, Watch, ClipboardCopy, UserSearch, Megaphone, Lightbulb, TrendingUp, AlertTriangle, Trophy, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import type { ToastPOSData } from '@/ai/schemas/toast-pos-schemas';
import type { ServiceAlert } from '@/ai/schemas/service-alert-schemas';
import OwnerServiceAlertWidget from '@/components/owner-service-alert-widget';
import { Input } from '@/components/ui/input';
import OnboardingInterview from '@/components/onboarding/onboarding-interview';
import type { MasterAgentOutput } from '@/ai/schemas/agent-schemas';
import type { GenerateMarketingIdeasOutput } from '@/ai/schemas/menu-trends-schemas';
import { format, formatDistanceToNow, add } from 'date-fns';
import AIMonitoringSetup from '@/components/ai-monitoring-setup';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/context/AuthContext';
import Feature from '@/components/feature-flag';

type Location = {
  id: number;
  name: string;
  manager: string;
  inspectionCode: string;
  toastApiKey?: string;
};

type HiringRequest = {
    id: number;
    manager: string;
    location: string;
    role: string;
    urgency: string;
    shiftType: 'Full-time' | 'Part-time' | 'Contract';
    justification: string;
};

type DelegatedTask = {
    id: number;
    description: string;
    source: string;
    status: 'Pending' | 'PendingOwnerApproval';
    attachmentUrl?: string;
};

type AgentActivityLog = MasterAgentOutput & {
  timestamp: Date;
};

type PurchaseOrder = {
    id: string;
    locationName: string;
    submittedBy: string;
    subject: string;
    list: string;
};

type MarketingOpportunity = {
    opportunityId: string;
    eventName: string;
    eventDate: Date;
    aiSuggestion: string;
    status: 'new' | 'acknowledged' | 'campaign_created' | 'dismissed';
}

const initialDelegatedTasks: DelegatedTask[] = [
    { id: 2, description: "Monthly deep clean and sanitization of all ice machines.", source: "State Regulation 5.11a", status: 'Pending' },
    { id: 3, description: "Clear blockage from back storage area hand-washing sink.", source: "Health Inspector Report (2024-07-01)", status: 'Pending' },
];

export default function OwnerDashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [isNewUser, setIsNewUser] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  
  const [selectedLocation, setSelectedLocation] = useState<Location | undefined>(undefined);
  const [toastData, setToastData] = useState<ToastPOSData | null>(null);
  const [isFetchingToast, setIsFetchingToast] = useState(false);

  const [hiringRequests, setHiringRequests] = useState<HiringRequest[]>([]);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [requestToReject, setRequestToReject] = useState<HiringRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  const [isAddLocationDialogOpen, setIsAddLocationDialogOpen] = useState(false);
  const [newLocationData, setNewLocationData] = useState({ name: '', managerName: '', managerEmail: ''});
  
  const [agentActivity, setAgentActivity] = useState<AgentActivityLog[]>([]);
  const [isAgentRunning, setIsAgentRunning] = useState(false);
  
  const [pendingPOs, setPendingPOs] = useState<PurchaseOrder[]>([]);
  const [inspectorTasks] = useState<DelegatedTask[]>(initialDelegatedTasks);
  const [pendingAlertCount, setPendingAlertCount] = useState(0);

  const [copiedUrlId, setCopiedUrlId] = useState<number | null>(null);

  const [topSeller, setTopSeller] = useState('Yuzu');
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [marketingIdeas, setMarketingIdeas] = useState<GenerateMarketingIdeasOutput | null>(null);

  const [shopperEmail, setShopperEmail] = useState('');
  const [shopperOffer, setShopperOffer] = useState('$10 Gift Card for your next visit');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isGeneratingInvite, setIsGeneratingInvite] = useState(false);
  const [inviteContent, setInviteContent] = useState<{ subject: string; body: string; } | null>(null);

  const [isAnnouncementDialogOpen, setIsAnnouncementDialogOpen] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementVideo, setAnnouncementVideo] = useState<File | null>(null);

  const [opportunities, setOpportunities] = useState<MarketingOpportunity[]>([
    {
        opportunityId: 'opp-1',
        eventName: 'First Friday Art Walk',
        eventDate: add(new Date(), { days: 3 }),
        aiSuggestion: 'High foot-traffic event near your location. A perfect opportunity to attract new customers.',
        status: 'new'
    },
    {
        opportunityId: 'opp-2',
        eventName: 'Phoenix Suns Season Opener',
        eventDate: add(new Date(), { days: 12 }),
        aiSuggestion: "Major sporting event. Suggest a 'Game Day Special' to capture pre-game and post-game crowds.",
        status: 'new'
    }
  ]);

  useEffect(() => {
    const newUserFlag = sessionStorage.getItem('isNewUser');
    if (newUserFlag === 'true') {
        setIsNewUser(true);
        sessionStorage.removeItem('isNewUser');
    }
    const storedLocations = JSON.parse(localStorage.getItem('sanity-track-locations') || '[]');
    setLocations(storedLocations);
    if (storedLocations.length === 0 && newUserFlag !== 'true') {
        setIsAddLocationDialogOpen(true);
    }
  }, []);

  useEffect(() => {
    if (locations.length > 0 && !selectedLocation) {
        setSelectedLocation(locations[0]);
    }
  }, [locations, selectedLocation]);

  useEffect(() => {
    if (selectedLocation) {
        handleFetchToastData(selectedLocation.name);
    }
  }, [selectedLocation]);
  
  useEffect(() => {
    const checkStorage = () => {
        const storedRequests = localStorage.getItem('hiringRequests');
        if (storedRequests) setHiringRequests(JSON.parse(storedRequests));
        
        const storedPOs = JSON.parse(localStorage.getItem('pendingPurchaseOrders') || '[]');
        setPendingPOs(storedPOs);

        if (selectedLocation) {
          const storedAlerts = JSON.parse(localStorage.getItem('serviceAlerts') || '[]');
          const pending = storedAlerts.filter((a: ServiceAlert) => a.status === 'pending_owner_action' && a.locationId === selectedLocation.name);
          setPendingAlertCount(pending.length);
        }
    };

    checkStorage();
    const interval = setInterval(checkStorage, 2000); 

    return () => clearInterval(interval);
  }, [selectedLocation]);
  
  const handleOnboardingComplete = () => {
        setIsNewUser(false);
        setIsAddLocationDialogOpen(true);
        toast({ title: "Setup Complete!", description: "Welcome to your new dashboard. Please add your first location to begin." });
  };
    
  const handleAddLocation = (e: FormEvent) => {
      e.preventDefault();
      if (!newLocationData.name || !newLocationData.managerName || !newLocationData.managerEmail) {
          toast({ variant: 'destructive', title: 'Missing Information' });
          return;
      }
      const newId = locations.length > 0 ? Math.max(...locations.map(l => l.id)) + 1 : 1;
      const newLoc: Location = {
          id: newId,
          name: newLocationData.name,
          manager: newLocationData.managerName,
          inspectionCode: newLocationData.name.toLowerCase().includes('down') ? 'DT-1A2B' : 'UP-3C4D'
      };
      const updatedLocations = [...locations, newLoc];
      setLocations(updatedLocations);
      localStorage.setItem('sanity-track-locations', JSON.stringify(updatedLocations));
      toast({ title: 'Location Added' });
      setNewLocationData({ name: '', managerName: '', managerEmail: '' });
      setIsAddLocationDialogOpen(false);
  };

  const handleFetchToastData = async (locationName: string) => {
      setIsFetchingToast(true);
      const result = await fetchToastDataAction({ location: locationName });
      if (result.data) setToastData(result.data);
      else toast({ variant: 'destructive', title: 'Sales Data Error', description: result.error });
      setIsFetchingToast(false);
  };
  
  const handleApproveRequest = async (request: HiringRequest) => {
    toast({ title: 'Posting Job...', description: `Submitting request for a ${request.role}.` });
    
    const result = await postJobAction({ role: request.role, location: request.location, shiftType: request.shiftType });

    if (result.data) {
        toast({ title: 'Job Posted Successfully!', description: `Confirmation ID: ${result.data.confirmationId}` });
        const updatedRequests = hiringRequests.filter(r => r.id !== request.id);
        setHiringRequests(updatedRequests);
        localStorage.setItem('hiringRequests', JSON.stringify(updatedRequests));
    } else {
        toast({ variant: 'destructive', title: 'Job Posting Failed', description: result.error });
    }
  };

  const openRejectDialog = (request: HiringRequest) => {
      setRequestToReject(request);
      setIsRejectDialogOpen(true);
  };

  const handleRejectRequest = () => {
      if (!requestToReject || !rejectionReason) return;
      const rejectedList = JSON.parse(localStorage.getItem('rejectedHiringRequests') || '[]');
      rejectedList.push({ ...requestToReject, ownerComment: rejectionReason });
      localStorage.setItem('rejectedHiringRequests', JSON.stringify(rejectedList));
      const updatedRequests = hiringRequests.filter(r => r.id !== requestToReject.id);
      setHiringRequests(updatedRequests);
      localStorage.setItem('hiringRequests', JSON.stringify(updatedRequests));
      toast({ title: 'Request Rejected' });
      setIsRejectDialogOpen(false);
      setRejectionReason('');
      setRequestToReject(null);
  };

  const handleRunAgent = async () => {
    setIsAgentRunning(true);
    const result = await runMasterAgentCycleAction({ rules: [], currentState: {} });
    if (result.data) {
        setAgentActivity(prev => [{ ...result.data!, timestamp: new Date() }, ...prev]);
        toast({ title: "Agent Cycle Complete", description: result.data.actionTaken });
    } else {
        toast({ variant: 'destructive', title: 'Agent Cycle Failed', description: result.error });
    }
    setIsAgentRunning(false);
  };

  const handlePOAction = (poId: string, action: 'approved' | 'rejected') => {
    const updatedPOs = pendingPOs.filter(po => po.id !== poId);
    setPendingPOs(updatedPOs);
    localStorage.setItem('pendingPurchaseOrders', JSON.stringify(updatedPOs));
    toast({ title: `Purchase Order ${action}` });
  };

  const handleCopyUrl = (url: string, id: number) => {
    navigator.clipboard.writeText(url);
    setCopiedUrlId(id);
    toast({ title: "URL Copied!" });
    setTimeout(() => setCopiedUrlId(null), 2000);
  };

  const handleGenerateIdeas = async () => {
    setIsGeneratingIdeas(true);
    setMarketingIdeas(null);
    const result = await generateMarketingIdeasAction({ topSeller, companyConcept: "Skyr bowls and shakes" });
    if (result.error || !result.data) toast({ variant: 'destructive', title: 'AI Error', description: result.error || "Failed to generate ideas." });
    else setMarketingIdeas(result.data);
    setIsGeneratingIdeas(false);
  };

  const handleInviteGhostShopper = async (e: FormEvent) => {
    e.preventDefault();
    if (!shopperEmail || !shopperOffer || !selectedLocation) return;
    setIsGeneratingInvite(true);
    setInviteContent(null);
    setIsInviteDialogOpen(true);
    const result = await generateGhostShopperInviteAction({ shopperEmail, offerDetails: shopperOffer, locationName: selectedLocation.name });
    if (result.error || !result.data) toast({ variant: 'destructive', title: 'AI Error', description: result.error || 'Failed to generate invite' });
    else setInviteContent(result.data);
    setIsGeneratingInvite(false);
  };

  const handleSendInvite = () => {
    toast({ title: "Invite Sent!" });
    setIsInviteDialogOpen(false);
    setShopperEmail('');
  };

    const handlePostAnnouncement = (e: FormEvent) => {
        e.preventDefault();
        if (!announcementTitle || !announcementVideo) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const videoDataUrl = event.target?.result as string;
            localStorage.setItem('company-announcement', JSON.stringify({ title: announcementTitle, videoUrl: videoDataUrl }));
            toast({ title: 'Announcement Posted!' });
            setIsAnnouncementDialogOpen(false);
            setAnnouncementTitle('');
            setAnnouncementVideo(null);
        };
        reader.readAsDataURL(announcementVideo);
    };

    const handleDismissOpportunity = (id: string) => {
        setOpportunities(prev => prev.filter(op => op.opportunityId !== id));
    };

    if (isNewUser) return <OnboardingInterview onOnboardingComplete={handleOnboardingComplete} />;

    if (locations.length === 0) {
        return (
            <div className="flex items-center justify-center p-4 md:p-8">
                <Card className="w-full max-w-lg">
                    <CardHeader>
                        <CardTitle className="font-headline">Welcome to Leifur.AI!</CardTitle>
                        <CardDescription>To get started, please add your first business location.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddLocation} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="new-loc-name">Location Name</Label>
                                <Input id="new-loc-name" placeholder="e.g., Downtown Phoenix" value={newLocationData.name} onChange={e => setNewLocationData({...newLocationData, name: e.target.value})} required/>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="manager-name">Manager Name</Label>
                                <Input id="manager-name" placeholder="e.g., Alex Ray" value={newLocationData.managerName} onChange={e => setNewLocationData({...newLocationData, managerName: e.target.value})} required/>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="manager-email">Manager Email</Label>
                                <Input id="manager-email" type="email" placeholder="e.g., alex.ray@example.com" value={newLocationData.managerEmail} onChange={e => setNewLocationData({...newLocationData, managerEmail: e.target.value})} required/>
                            </div>
                            <Button type="submit" className="w-full">Add Location & Continue</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        )
    }

  return (
    <div className="space-y-6">
       <Feature name="executiveVitals">
         <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <CardTitle className="font-headline">KPI Overview</CardTitle>
                        <CardDescription>A high-level overview of your enterprise's health for: {selectedLocation?.name}</CardDescription>
                    </div>
                    <Select value={selectedLocation?.name} onValueChange={(name) => setSelectedLocation(locations.find(l => l.name === name))}>
                        <SelectTrigger className="w-full md:w-auto md:min-w-[200px]"><SelectValue placeholder="Select location..." /></SelectTrigger>
                        <SelectContent>{locations.map(loc => <SelectItem key={loc.id} value={loc.name}>{loc.name}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Today's Sales</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold flex items-center gap-2">{isFetchingToast ? <Loader2 className="h-5 w-5 animate-spin"/> : toastData ? `$${toastData.liveSalesToday.toLocaleString()}` : <p>N/A</p>}<DollarSign className="h-4 w-4 text-muted-foreground"/></div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Month-to-Date Sales</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold flex items-center gap-2">{isFetchingToast ? <Loader2 className="h-5 w-5 animate-spin"/> : toastData ? `$${toastData.salesThisMonth.toLocaleString()}` : <p>N/A</p>}<DollarSign className="h-4 w-4 text-muted-foreground"/></div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Compliance Score</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold flex items-center gap-2">92.5%<ShieldCheck className="h-4 w-4 text-muted-foreground"/></div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold flex items-center gap-2">4.8/5<Smile className="h-4 w-4 text-muted-foreground"/></div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Pending Approvals</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold flex items-center gap-2">{hiringRequests.length + pendingPOs.length}<Briefcase className="h-4 w-4 text-muted-foreground"/></div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Open Service Alerts</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold flex items-center gap-2">{pendingAlertCount}<AlertTriangle className="h-4 w-4 text-muted-foreground"/></div></CardContent>
                    </Card>
                </div>
            </CardContent>
         </Card>
       </Feature>

       <Feature name="approvalsQueue">
         <Card id="high-priority-approvals">
             <CardHeader>
                  <CardTitle className="font-headline">Action & Approval Queue</CardTitle>
                  <CardDescription>Your personal inbox for items requiring your immediate attention.</CardDescription>
             </CardHeader>
             <CardContent>
                  <Tabs defaultValue="approvals">
                      <TabsList className="grid w-full grid-cols-4">
                          <Feature name="hiringApprovals"><TabsTrigger value="approvals">Approvals</TabsTrigger></Feature>
                          <Feature name="serviceAlerts"><TabsTrigger value="alerts">Alerts</TabsTrigger></Feature>
                           <Feature name="inspectorMandates"><TabsTrigger value="mandates">Mandates</TabsTrigger></Feature>
                           <Feature name="aiMarketingStudio"><TabsTrigger value="marketing" id="marketing">Marketing & Innovation</TabsTrigger></Feature>
                      </TabsList>
                      
                      <Feature name="hiringApprovals">
                        <TabsContent value="approvals" className="mt-4">
                            <div className="space-y-4">
                                <Feature name="hiringApprovals">
                                    {(hiringRequests.length > 0) && (
                                        <Card className="bg-muted/30">
                                            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Briefcase/> Hiring Requests</CardTitle></CardHeader>
                                            <CardContent>
                                                <Table>
                                                    <TableHeader><TableRow><TableHead>Role</TableHead><TableHead>Location</TableHead><TableHead>Urgency</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                                                    <TableBody>
                                                        {hiringRequests.map(req => (
                                                            <TableRow key={req.id}>
                                                                <TableCell className="font-medium">{req.role}</TableCell>
                                                                <TableCell>{req.location}</TableCell>
                                                                <TableCell><Badge variant={req.urgency === 'High' ? 'destructive' : 'secondary'}>{req.urgency}</Badge></TableCell>
                                                                <TableCell className="text-right space-x-1">
                                                                    <Button size="sm" onClick={() => handleApproveRequest(req)}><Check className="mr-2 h-4 w-4" /> Approve</Button>
                                                                    <Button size="sm" variant="destructive" onClick={() => openRejectDialog(req)}><X className="mr-2 h-4 w-4"/> Reject</Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </CardContent>
                                        </Card>
                                    )}
                                </Feature>
                                <Feature name="purchaseOrderApprovals">
                                    {pendingPOs.length > 0 && (
                                        <Card className="bg-muted/30">
                                            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><ShoppingCart/> Purchase Orders</CardTitle></CardHeader>
                                            <CardContent>
                                                <Table>
                                                    <TableHeader><TableRow><TableHead>From</TableHead><TableHead>Subject</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                                                    <TableBody>
                                                        {pendingPOs.map(po => (
                                                            <TableRow key={po.id}>
                                                                <TableCell className="font-medium">{po.locationName}</TableCell>
                                                                <TableCell>{po.subject}</TableCell>
                                                                <TableCell className="text-right space-x-1">
                                                                    <Button size="sm" onClick={() => handlePOAction(po.id, 'approved')}><Check className="mr-2 h-4 w-4" /> Approve</Button>
                                                                    <Button size="sm" variant="destructive" onClick={() => handlePOAction(po.id, 'rejected')}><X className="mr-2 h-4 w-4"/> Reject</Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </CardContent>
                                        </Card>
                                    )}
                                </Feature>
                                {hiringRequests.length === 0 && pendingPOs.length === 0 && (
                                    <p className="text-muted-foreground text-center py-4">No pending approvals.</p>
                                )}
                            </div>
                        </TabsContent>
                      </Feature>

                      <Feature name="serviceAlerts">
                        <TabsContent value="alerts" className="mt-4">
                            <OwnerServiceAlertWidget locationId={selectedLocation?.name || ''} />
                        </TabsContent>
                      </Feature>

                      <Feature name="inspectorMandates">
                        <TabsContent value="mandates" className="mt-4">
                           <Card className="bg-muted/30">
                              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><FileText /> Mandated Tasks from Health Department</CardTitle></CardHeader>
                               <CardContent>
                                    <Table>
                                        <TableHeader><TableRow><TableHead>Task</TableHead><TableHead>Source</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                                        <TableBody>
                                            {inspectorTasks.map(task => (
                                                 <TableRow key={task.id}><TableCell>{task.description}</TableCell><TableCell>{task.source}</TableCell><TableCell className="text-right"><Button size="sm">Acknowledge</Button></TableCell></TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                               </CardContent>
                           </Card>
                       </TabsContent>
                      </Feature>
                      
                       <Feature name="aiMarketingStudio">
                          <TabsContent value="marketing" className="mt-4 space-y-6">
                              <Feature name="aiProactiveSuggestions">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="font-headline text-primary flex items-center gap-2"><Sparkles/> Proactive AI Suggestions</CardTitle>
                                        <CardDescription>Let the AI act as your local marketing expert, finding opportunities for you.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {opportunities.length === 0 ? <p className="text-sm text-muted-foreground text-center">No new local opportunities found right now.</p> : (
                                            opportunities.map(op => (
                                                <Card key={op.opportunityId} className="bg-muted/50">
                                                    <CardHeader className="pb-4"><CardTitle className="text-base">{op.eventName}</CardTitle></CardHeader>
                                                    <CardContent className="space-y-2">
                                                        <p className="text-sm font-semibold">Date: {format(op.eventDate, 'EEEE, MMMM dd')}</p>
                                                        <p className="text-sm"><span className="font-semibold">AI Insight:</span> {op.aiSuggestion}</p>
                                                    </CardContent>
                                                    <CardFooter className="gap-2">
                                                        <Button size="sm">Create Campaign</Button>
                                                        <Button size="sm" variant="ghost" onClick={() => handleDismissOpportunity(op.opportunityId)}>Dismiss</Button>
                                                    </CardFooter>
                                                </Card>
                                            ))
                                        )}
                                    </CardContent>
                                    <CardFooter>
                                        <Button variant="link" size="sm" asChild><Link href="/dashboard/owner/marketing-setup">Configure AI</Link></Button>
                                    </CardFooter>
                                </Card>
                              </Feature>
                              <Feature name="aiMenuInnovation">
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="font-headline flex items-center gap-2"><Lightbulb /> AI Menu Innovation Lab</CardTitle>
                                    <CardDescription>Brainstorm new menu items based on current food trends and your top-selling ingredients.</CardDescription>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                    <div className="grid gap-2">
                                      <Label htmlFor="top-seller">Top-Selling Ingredient or Flavor</Label>
                                      <Input id="top-seller" value={topSeller} onChange={e => setTopSeller(e.target.value)} placeholder="e.g., Yuzu" />
                                    </div>
                                    <Button onClick={handleGenerateIdeas} disabled={isGeneratingIdeas || !topSeller}>
                                      {isGeneratingIdeas ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                      Generate Ideas
                                    </Button>
                                    {marketingIdeas && (
                                      <div className="pt-4 space-y-4">
                                        <div className="grid md:grid-cols-2 gap-4">
                                          {marketingIdeas.menuIdeas.map((idea, i) => (
                                            <Card key={i}>
                                              <CardHeader><CardTitle className="text-base">{idea.name}</CardTitle><CardDescription>{idea.marketingAngle}</CardDescription></CardHeader>
                                              <CardContent><p className="text-sm">{idea.description}</p></CardContent>
                                            </Card>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              </Feature>
                              <Feature name="ghostShopperProgram">
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="font-headline flex items-center gap-2"><UserSearch /> Ghost Shopper Program</CardTitle>
                                    <CardDescription>Invite customers to provide anonymous, detailed feedback in exchange for a reward.</CardDescription>
                                  </CardHeader>
                                  <CardContent>
                                    <form onSubmit={handleInviteGhostShopper} className="space-y-4">
                                      <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                          <Label htmlFor="shopper-email">Customer Email</Label>
                                          <Input id="shopper-email" type="email" value={shopperEmail} onChange={e => setShopperEmail(e.target.value)} placeholder="customer@email.com" required/>
                                        </div>
                                        <div className="grid gap-2">
                                          <Label htmlFor="shopper-offer">Reward Offer</Label>
                                          <Input id="shopper-offer" value={shopperOffer} onChange={e => setShopperOffer(e.target.value)} required/>
                                        </div>
                                      </div>
                                      <Button type="submit" disabled={isGeneratingInvite && !!isInviteDialogOpen}>Generate Invite</Button>
                                    </form>
                                  </CardContent>
                                </Card>
                              </Feature>
                              <Feature name="companyAnnouncements">
                                 <Card>
                                  <CardHeader>
                                    <CardTitle className="font-headline flex items-center gap-2"><Megaphone /> Company Announcement</CardTitle>
                                    <CardDescription>Record and post a video message that will be displayed at the top of every employee's dashboard.</CardDescription>
                                  </CardHeader>
                                  <CardContent>
                                    <Dialog open={isAnnouncementDialogOpen} onOpenChange={setIsAnnouncementDialogOpen}>
                                      <DialogTrigger asChild><Button><Video className="mr-2 h-4 w-4"/>Post New Announcement</Button></DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>Post Company Announcement</DialogTitle>
                                          <DialogDescription>Record or upload a short video. It will appear on all dashboards until dismissed.</DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handlePostAnnouncement} className="py-4 space-y-4">
                                            <div className="grid gap-2"><Label htmlFor="announcement-title">Title</Label><Input id="announcement-title" value={announcementTitle} onChange={e => setAnnouncementTitle(e.target.value)} required/></div>
                                            <div className="grid gap-2"><Label htmlFor="announcement-video">Video File</Label><Input id="announcement-video" type="file" accept="video/*" onChange={e => setAnnouncementVideo(e.target.files ? e.target.files[0] : null)} required/></div>
                                            <DialogFooter><Button type="submit">Post Announcement</Button></DialogFooter>
                                        </form>
                                      </DialogContent>
                                    </Dialog>
                                  </CardContent>
                                </Card>
                              </Feature>
                          </TabsContent>
                      </Feature>
                  </Tabs>
             </CardContent>
         </Card>
       </Feature>

       <Feature name="strategicCommand">
         <Card>
             <CardHeader>
                  <CardTitle className="font-headline">Strategic Command & Administration</CardTitle>
                  <CardDescription>High-level tools for management, security, and system configuration.</CardDescription>
             </CardHeader>
             <CardContent>
                 <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
                     <Feature name="aiSentinel">
                        <AccordionItem value="item-1">
                             <AccordionTrigger>
                                <div className="flex items-center gap-3">
                                <Eye className="h-5 w-5" />
                                <div>
                                    <h4 className="font-semibold">AI Sentinel & Security</h4>
                                    <p className="text-sm text-muted-foreground">Configure AI monitoring and view autonomous agent logs.</p>
                                </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="p-6 bg-muted/30">
                                <div className="grid gap-6">
                                    <AIMonitoringSetup />
                                    <Card id="agent-activity-log">
                                        <CardHeader>
                                            <CardTitle>Agent Activity Log</CardTitle>
                                            <CardDescription>A real-time log of actions taken by the Sentinel Agent.</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Button onClick={handleRunAgent} disabled={isAgentRunning}>
                                                {isAgentRunning ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Bot className="mr-2 h-4 w-4"/>}
                                                Run Agent Cycle
                                            </Button>
                                            <div className="mt-4 space-y-3 h-48 overflow-y-auto border bg-background p-3 rounded-md">
                                                {agentActivity.length > 0 ? agentActivity.map(log => (
                                                    <div key={log.timestamp.toISOString()} className="text-sm">
                                                        <p><span className="font-semibold">Action:</span> {log.actionTaken}</p>
                                                        <p className="text-muted-foreground"><span className="font-semibold">Reason:</span> {log.reasoning}</p>
                                                        <p className="text-xs text-muted-foreground">{formatDistanceToNow(log.timestamp, { addSuffix: true })}</p>
                                                    </div>
                                                )) : <p className="text-sm text-muted-foreground text-center pt-4">No agent activity yet.</p>}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                     </Feature>
                     <Feature name="teamManagement">
                        <AccordionItem value="item-2">
                             <AccordionTrigger>
                                <div className="flex items-center gap-3">
                                    <Users className="h-5 w-5" />
                                    <div>
                                        <h4 className="font-semibold">Team & Locations</h4>
                                        <p className="text-sm text-muted-foreground">Manage your team members and business locations.</p>
                                    </div>
                                </div>
                            </AccordionTrigger>
                             <AccordionContent className="p-6 bg-muted/30">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Locations</CardTitle>
                                        <CardDescription>Add or manage your business locations. Each location gets a unique code for KDS pairing.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                         <Table>
                                            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Manager</TableHead><TableHead>KDS Code</TableHead></TableRow></TableHeader>
                                            <TableBody>
                                                {locations.map(loc => (
                                                     <TableRow key={loc.id}><TableCell>{loc.name}</TableCell><TableCell>{loc.manager}</TableCell><TableCell><Badge variant="outline">{loc.inspectionCode}</Badge></TableCell></TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                    <CardFooter>
                                        <Button onClick={() => setIsAddLocationDialogOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> Add Location</Button>
                                    </CardFooter>
                                </Card>
                            </AccordionContent>
                        </AccordionItem>
                     </Feature>
                     <Feature name="systemAdministration">
                        <AccordionItem value="item-3">
                            <AccordionTrigger>
                                <div className="flex items-center gap-3">
                                    <Settings className="h-5 w-5" />
                                    <div>
                                        <h4 className="font-semibold">System & Administration</h4>
                                        <p className="text-sm text-muted-foreground">Manage billing, branding, and global settings.</p>
                                    </div>
                                </div>
                            </AccordionTrigger>
                             <AccordionContent className="p-6 bg-muted/30">
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                     <Button asChild variant="outline" className="justify-start"><Link href="/dashboard/owner/team"><Users className="mr-2"/>Team & Permissions</Link></Button>
                                     <Button asChild variant="outline" className="justify-start"><Link href="/dashboard/owner/branding"><Package className="mr-2"/>Branding</Link></Button>
                                     <Button asChild variant="outline" className="justify-start"><Link href="/dashboard/owner/agent-rules"><Bot className="mr-2"/>AI Agent Rules</Link></Button>
                                     <Button asChild variant="outline" className="justify-start"><Link href="/dashboard/owner/documents"><FileText className="mr-2"/>Document Storage</Link></Button>
                                     <Button asChild variant="outline" className="justify-start"><Link href="/dashboard/owner/billing"><DollarSign className="mr-2"/>Billing</Link></Button>
                                     <Button asChild variant="outline" className="justify-start"><Link href="/dashboard/owner/features"><Sparkles className="mr-2"/>Feature Flags</Link></Button>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                     </Feature>
                 </Accordion>
             </CardContent>
         </Card>
       </Feature>
      
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject Hiring Request</DialogTitle><DialogDescription>Provide a reason for rejecting this request. The manager will be notified.</DialogDescription></DialogHeader>
          <div className="py-4"><Textarea placeholder="e.g., 'Hiring freeze is currently in effect.'" value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} /></div>
          <DialogFooter><Button variant="destructive" onClick={handleRejectRequest}>Confirm Rejection</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Generated Invitation</DialogTitle><DialogDescription>Review the AI-generated email. You can copy the content or send it directly (simulation).</DialogDescription></DialogHeader>
          <div className="py-4 space-y-4">
            {isGeneratingInvite ? (<div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin"/></div>) : inviteContent ? (
              <div className="space-y-4">
                <div className="grid gap-2"><Label>Subject</Label><Input readOnly value={inviteContent.subject}/></div>
                <div className="grid gap-2"><Label>Body</Label><Textarea readOnly value={inviteContent.body} rows={10}/></div>
              </div>
            ) : <p>Could not generate invite.</p>}
          </div>
          <DialogFooter><Button variant="secondary" onClick={() => setIsInviteDialogOpen(false)}>Close</Button><Button onClick={handleSendInvite} disabled={isGeneratingInvite}>Send Invite</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isAddLocationDialogOpen} onOpenChange={setIsAddLocationDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="font-headline">Add New Location</DialogTitle>
                <DialogDescription>Add a new business location to manage.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddLocation} className="space-y-4 py-4">
                <div className="grid gap-2">
                    <Label htmlFor="new-loc-name">Location Name</Label>
                    <Input id="new-loc-name" placeholder="e.g., Downtown Phoenix" value={newLocationData.name} onChange={e => setNewLocationData({...newLocationData, name: e.target.value})} required/>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="manager-name">Manager Name</Label>
                    <Input id="manager-name" placeholder="e.g., Alex Ray" value={newLocationData.managerName} onChange={e => setNewLocationData({...newLocationData, managerName: e.target.value})} required/>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="manager-email">Manager Email</Label>
                    <Input id="manager-email" type="email" placeholder="e.g., alex.ray@example.com" value={newLocationData.managerEmail} onChange={e => setNewLocationData({...newLocationData, managerEmail: e.target.value})} required/>
                </div>
                <DialogFooter>
                    <Button type="submit" className="w-full">Add Location</Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
