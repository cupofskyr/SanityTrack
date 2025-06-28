
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
import { Loader2, Sparkles, Briefcase, Check, X, Send, ShoppingCart, PlusCircle, Building, Activity, Bot, ShieldCheck, DollarSign, Smile, Users, Eye, Settings, Video, FileText, Handshake, Watch, ClipboardCopy, UserSearch, Megaphone, Lightbulb, TrendingUp, AlertTriangle, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import type { ToastPOSData } from '@/ai/schemas/toast-pos-schemas';
import OwnerServiceAlertWidget from '@/components/owner-service-alert-widget';
import { Input } from '@/components/ui/input';
import OnboardingInterview from '@/components/onboarding/onboarding-interview';
import type { MasterAgentOutput } from '@/ai/schemas/agent-schemas';
import type { GenerateMarketingIdeasOutput } from '@/ai/schemas/menu-trends-schemas';
import { formatDistanceToNow } from 'date-fns';
import AIMonitoringSetup from '@/components/ai-monitoring-setup';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';

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

const initialDelegatedTasks: DelegatedTask[] = [
    { id: 2, description: "Monthly deep clean and sanitization of all ice machines.", source: "State Regulation 5.11a", status: 'Pending' },
    { id: 3, description: "Clear blockage from back storage area hand-washing sink.", source: "Health Inspector Report (2024-07-01)", status: 'Pending' },
];

export default function OwnerDashboard() {
  const { toast } = useToast();

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

  useEffect(() => {
    const storedLocations = JSON.parse(localStorage.getItem('sanity-track-locations') || '[]');
    setLocations(storedLocations);
    if (storedLocations.length === 0) {
        setIsNewUser(true);
    } else {
        setIsNewUser(false);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLocation]);
  
  useEffect(() => {
    const checkStorage = () => {
        const storedRequests = localStorage.getItem('hiringRequests');
        if (storedRequests) setHiringRequests(JSON.parse(storedRequests));
        
        const storedPOs = JSON.parse(localStorage.getItem('pendingPurchaseOrders') || '[]');
        setPendingPOs(storedPOs);
    };

    checkStorage();
    const interval = setInterval(checkStorage, 2000); 

    return () => clearInterval(interval);
  }, []);
  
  const handleOnboardingComplete = () => {
        setIsNewUser(false);
        localStorage.setItem('sanity-track-locations', JSON.stringify([])); 
        toast({ title: "Setup Complete!", description: "Welcome to your new dashboard. Please add a location to begin." });
  };
    
  const handleAddLocation = (e: FormEvent) => {
      e.preventDefault();
      if (!newLocationData.name || !newLocationData.managerName || !newLocationData.managerEmail) {
          toast({ variant: 'destructive', title: 'Missing Information', description: 'Please fill out all required fields.' });
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
      toast({ title: 'Location Added', description: `${newLocationData.name} has been added.` });
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
      if (!requestToReject || !rejectionReason) {
          toast({ variant: 'destructive', title: 'Reason required', description: 'Please provide a reason for rejection.' });
          return;
      }

      const rejectedList = JSON.parse(localStorage.getItem('rejectedHiringRequests') || '[]');
      rejectedList.push({ ...requestToReject, ownerComment: rejectionReason });
      localStorage.setItem('rejectedHiringRequests', JSON.stringify(rejectedList));
      
      const updatedRequests = hiringRequests.filter(r => r.id !== requestToReject.id);
      setHiringRequests(updatedRequests);
      localStorage.setItem('hiringRequests', JSON.stringify(updatedRequests));

      toast({ title: 'Request Rejected', description: 'The manager has been notified.' });
      setIsRejectDialogOpen(false);
      setRejectionReason('');
      setRequestToReject(null);
  };

  const handleRunAgent = async () => {
    setIsAgentRunning(true);
    const simulatedState = {
        cameraObservations: ["Spill detected on floor near counter.", "Employee idle for 5 minutes at front counter."],
        stockLevels: [{ item: 'Coffee Cups', level: 'Critical' as const }],
        openTasks: [],
    };
    const simulatedRules = [
        { id: 'auto-spill-cleaner', name: 'Auto-Tasker for Spills', description: 'IF a camera detects a spill, THEN automatically create a high-priority cleaning task.', isEnabled: true, config: {} },
        { id: 'auto-restock-alerter', name: 'Proactive Restock Alerter', description: 'IF inventory of a critical item is low, THEN automatically email the manager.', isEnabled: true, config: {} },
        { id: 'auto-idle-tasker', name: 'Proactive Idle Tasker', description: 'IF a camera detects an employee is idle, THEN create a low-priority task to restock napkins.', isEnabled: true, config: {} },
    ];

    const result = await runMasterAgentCycleAction({ rules: simulatedRules, currentState: simulatedState });

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
    toast({
        title: `Purchase Order ${action}`,
        description: `The manager has been notified.`
    });
  };

  const handleCopyUrl = (url: string, id: number) => {
    navigator.clipboard.writeText(url);
    setCopiedUrlId(id);
    toast({ title: "URL Copied!", description: "You can now use this link to create a QR code." });
    setTimeout(() => setCopiedUrlId(null), 2000);
  };

  const handleGenerateIdeas = async () => {
    if (!topSeller) {
        toast({ variant: 'destructive', title: 'Missing Input', description: 'Please provide a top-selling ingredient.' });
        return;
    }
    setIsGeneratingIdeas(true);
    setMarketingIdeas(null);
    try {
        const result = await generateMarketingIdeasAction({
            topSeller,
            companyConcept: "Skyr bowls and shakes"
        });
        if (result.error || !result.data) throw new Error(result.error || "Failed to generate ideas.");
        setMarketingIdeas(result.data);
    } catch (e: any) {
        toast({ variant: 'destructive', title: 'AI Error', description: e.message });
    } finally {
        setIsGeneratingIdeas(false);
    }
  };

  const handleInviteGhostShopper = async (e: FormEvent) => {
    e.preventDefault();
    if (!shopperEmail || !shopperOffer || !selectedLocation) {
        toast({ variant: 'destructive', title: 'Missing Information' });
        return;
    }

    setIsGeneratingInvite(true);
    setInviteContent(null);
    setIsInviteDialogOpen(true);

    try {
        const result = await generateGhostShopperInviteAction({
            shopperEmail,
            offerDetails: shopperOffer,
            locationName: selectedLocation.name,
        });

        if (result.error || !result.data) throw new Error(result.error || 'Failed to generate invite');
        setInviteContent(result.data);
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'AI Error', description: error.message });
        setIsInviteDialogOpen(false);
    } finally {
        setIsGeneratingInvite(false);
    }
  };

  const handleSendInvite = () => {
    toast({ title: "Invite Sent!", description: `The ghost shopper invitation has been sent to ${shopperEmail}.` });
    setIsInviteDialogOpen(false);
    setShopperEmail('');
  };

    const handlePostAnnouncement = (e: FormEvent) => {
        e.preventDefault();
        if (!announcementTitle || !announcementVideo) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please provide a title and select a video file.' });
            return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
            const videoDataUrl = event.target?.result as string;
            localStorage.setItem('company-announcement', JSON.stringify({
                title: announcementTitle,
                videoUrl: videoDataUrl,
                postedAt: new Date().toISOString(),
            }));
            toast({ title: 'Announcement Posted!', description: 'Your message is now visible to all employees.' });
            setIsAnnouncementDialogOpen(false);
            setAnnouncementTitle('');
            setAnnouncementVideo(null);
        };
        reader.readAsDataURL(announcementVideo);
    };

    if (isNewUser) {
        return <OnboardingInterview onOnboardingComplete={handleOnboardingComplete} />;
    }

    if (locations.length === 0) {
        return (
             <div className="flex items-center justify-center p-4 md:p-8">
                <Card className="w-full max-w-lg text-center">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Welcome, Owner!</CardTitle>
                        <CardDescription>You haven't added any locations yet. Add your first business location to get started.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Dialog open={isAddLocationDialogOpen} onOpenChange={setIsAddLocationDialogOpen}>
                            <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" /> Add Your First Location</Button></DialogTrigger>
                             <DialogContent>
                                <DialogHeader><DialogTitle className="font-headline">Add New Location</DialogTitle></DialogHeader>
                                <form onSubmit={handleAddLocation} className="space-y-4 py-4">
                                     <div className="grid gap-2"><Label htmlFor="new-loc-name">Location Name</Label><Input id="new-loc-name" placeholder="e.g., Uptown Bistro" value={newLocationData.name} onChange={(e) => setNewLocationData(prev => ({...prev, name: e.target.value}))} required /></div>
                                     <div className="grid gap-2"><Label htmlFor="new-loc-manager">Manager Name</Label><Input id="new-loc-manager" placeholder="e.g., Casey Lee" value={newLocationData.managerName} onChange={(e) => setNewLocationData(prev => ({...prev, managerName: e.target.value}))} required /></div>
                                      <div className="grid gap-2"><Label htmlFor="new-loc-email">Manager Email</Label><Input id="new-loc-email" type="email" placeholder="casey@example.com" value={newLocationData.managerEmail} onChange={(e) => setNewLocationData(prev => ({...prev, managerEmail: e.target.value}))} required /></div>
                                     <DialogFooter><Button type="submit">Save Location</Button></DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>
            </div>
        )
    }

  return (
    <div className="space-y-6">
       <Card>
           <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="font-headline">Executive Vitals (Simulated Data)</CardTitle>
                        <CardDescription>A high-level overview of your enterprise's health.</CardDescription>
                    </div>
                     <Select value={selectedLocation?.name} onValueChange={(name) => setSelectedLocation(locations.find(l => l.name === name))}>
                        <SelectTrigger className="w-full md:w-1/4"><SelectValue placeholder="Select location..." /></SelectTrigger>
                        <SelectContent>{locations.map(loc => <SelectItem key={loc.id} value={loc.name}>{loc.name}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
           </CardHeader>
           <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Today's Sales</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader>
                        <CardContent>{isFetchingToast ? <Loader2 className="h-6 w-6 animate-spin" /> : toastData ? <div className="text-2xl font-bold">${toastData.liveSalesToday.toLocaleString()}</div> : <p className="text-xs text-muted-foreground">No data</p>}</CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Compliance</CardTitle><ShieldCheck className="h-4 w-4 text-muted-foreground" /></CardHeader>
                        <CardContent><div className="text-2xl font-bold">92.5%</div></CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Cust. Sat.</CardTitle><Smile className="h-4 w-4 text-muted-foreground" /></CardHeader>
                        <CardContent><div className="text-2xl font-bold">4.8/5</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Labor %</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader>
                        <CardContent><div className="text-2xl font-bold">28%</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Handwash/Hr</CardTitle><Handshake className="h-4 w-4 text-muted-foreground" /></CardHeader>
                        <CardContent><div className="text-2xl font-bold">12</div></CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Prep Time</CardTitle><Watch className="h-4 w-4 text-muted-foreground" /></CardHeader>
                        <CardContent><div className="text-2xl font-bold">55s</div></CardContent>
                    </Card>
                </div>
           </CardContent>
       </Card>

       <Card id="high-priority-approvals">
           <CardHeader>
                <CardTitle className="font-headline">Action & Approval Queue</CardTitle>
                <CardDescription>Your personal inbox for items requiring your immediate attention.</CardDescription>
           </CardHeader>
           <CardContent>
                <Tabs defaultValue="approvals">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="approvals">Approvals</TabsTrigger>
                        <TabsTrigger value="alerts">Alerts</TabsTrigger>
                        <TabsTrigger value="mandates">Mandates</TabsTrigger>
                        <TabsTrigger value="marketing" id="marketing">Marketing & Innovation</TabsTrigger>
                    </TabsList>
                    <TabsContent value="approvals" className="mt-4">
                        <div className="space-y-4">
                            {hiringRequests.length > 0 && (
                                <Card className="bg-muted/30">
                                    <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Briefcase/> Hiring Requests</CardTitle></CardHeader>
                                    <CardContent className="space-y-4">
                                        {hiringRequests.map(req => (
                                            <Card key={req.id}>
                                                <CardHeader><CardTitle className="text-base">Request: {req.role} at {req.location}</CardTitle><CardDescription>Submitted by {req.manager}</CardDescription></CardHeader>
                                                <CardContent>
                                                    <p className="text-sm"><strong>Shift:</strong> {req.shiftType} | <strong>Urgency:</strong> {req.urgency}</p>
                                                    <blockquote className="mt-2 border-l-2 pl-4 text-sm italic">"{req.justification}"</blockquote>
                                                </CardContent>
                                                <CardFooter className="gap-2">
                                                    <Button onClick={() => handleApproveRequest(req)} size="sm"><Check className="mr-2 h-4 w-4"/> Approve & Post Job</Button>
                                                    <Button variant="destructive" onClick={() => openRejectDialog(req)} size="sm"><X className="mr-2 h-4 w-4"/> Reject</Button>
                                                </CardFooter>
                                            </Card>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}
                            {pendingPOs.length > 0 && (
                                <Card className="bg-muted/30">
                                    <CardHeader><CardTitle className="text-lg flex items-center gap-2"><ShoppingCart /> Purchase Order Approval</CardTitle></CardHeader>
                                    <CardContent className="space-y-4">
                                        {pendingPOs.map(po => (
                                            <Card key={po.id}>
                                                <CardHeader>
                                                    <CardTitle className="text-base">{po.subject}</CardTitle>
                                                    <CardDescription>From: {po.locationName} (Manager: {po.submittedBy})</CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <Textarea readOnly value={po.list} rows={5} />
                                                </CardContent>
                                                <CardFooter className="gap-2">
                                                    <Button size="sm" onClick={() => handlePOAction(po.id, 'approved')}> Approve & Send</Button>
                                                    <Button size="sm" variant="destructive" onClick={() => handlePOAction(po.id, 'rejected')}> Reject</Button>
                                                </CardFooter>
                                            </Card>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}
                            {hiringRequests.length === 0 && pendingPOs.length === 0 && (
                                <p className="text-muted-foreground text-center py-4">No pending approvals.</p>
                            )}
                        </div>
                    </TabsContent>
                    <TabsContent value="alerts" className="mt-4">
                        <OwnerServiceAlertWidget locationId={selectedLocation?.name || ''} />
                    </TabsContent>
                     <TabsContent value="mandates" className="mt-4">
                        <Card className="bg-muted/30">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <ShieldCheck/> Inspector Mandated Tasks
                                </CardTitle>
                                <CardDescription>Tasks assigned by the Health Department that are pending completion by your managers.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {inspectorTasks.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Task</TableHead>
                                                <TableHead>Source</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                        {inspectorTasks.map(task => (
                                            <TableRow key={task.id}>
                                                <TableCell className="font-medium">{task.description}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{task.source}</TableCell>
                                                <TableCell>
                                                    <Badge variant={task.status === 'Pending' ? 'destructive' : 'default'}>
                                                        {task.status === 'Pending' ? 'Action Required' : 'Pending Approval'}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <p className="text-muted-foreground text-center py-4">No outstanding mandates from the Health Department.</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                     <TabsContent value="marketing" className="mt-4 space-y-6">
                        <Card>
                           <CardHeader className="flex-row items-center justify-between">
                               <div>
                                   <CardTitle className="font-headline flex items-center gap-2"><Sparkles className='text-primary'/> AI Menu Innovation Lab</CardTitle>
                                   <CardDescription>Leverage sales data and trends to brainstorm new menu items and marketing angles.</CardDescription>
                               </div>
                               <Button asChild variant="outline" size="sm">
                                   <Link href="/dashboard/owner/marketing-setup"><Settings className="mr-2 h-4 w-4"/>Configure AI</Link>
                               </Button>
                           </CardHeader>
                           <CardContent>
                               <div className="grid gap-2 mb-4 max-w-sm">
                                   <Label htmlFor="top-seller">Enter Your Top-Selling Ingredient</Label>
                                   <Input id="top-seller" value={topSeller} onChange={(e) => setTopSeller(e.target.value)} placeholder="e.g., Yuzu, Cold Brew, Acai"/>
                               </div>
                               <Button onClick={handleGenerateIdeas} disabled={isGeneratingIdeas}>
                                   {isGeneratingIdeas ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Lightbulb className="mr-2 h-4 w-4"/>}
                                   Generate Ideas
                               </Button>
                                {marketingIdeas && (
                                    <div className="mt-6 space-y-4">
                                        <div className="grid md:grid-cols-3 gap-4">
                                            {marketingIdeas.trendingIngredients.map((ing, i) => (
                                                <Card key={i}>
                                                    <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp/>{ing.name}</CardTitle></CardHeader>
                                                    <CardContent><p className="text-sm text-muted-foreground">{ing.reason}</p></CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                         <div className="grid md:grid-cols-2 gap-4">
                                             {marketingIdeas.menuIdeas.map((idea, i) => (
                                                <Card key={i}>
                                                    <CardHeader>
                                                        <CardTitle className="text-lg">{idea.name} <Badge variant="secondary">{idea.type}</Badge></CardTitle>
                                                        <CardDescription>{idea.description}</CardDescription>
                                                    </CardHeader>
                                                    <CardContent className="space-y-2">
                                                        <p className="text-sm"><strong className="font-medium">Ingredients:</strong> {idea.keyIngredients.join(', ')}</p>
                                                        <p className="text-sm"><strong className="font-medium">Marketing Angle:</strong> {idea.marketingAngle}</p>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}
                           </CardContent>
                        </Card>
                        <Card>
                               <CardHeader>
                                   <CardTitle className="font-headline flex items-center gap-2"><UserSearch /> Ghost Shopper Program</CardTitle>
                                   <CardDescription>
                                       Invite customers to act as "secret shoppers" in exchange for a reward. The AI will draft a professional invitation email for you to send.
                                   </CardDescription>
                               </CardHeader>
                               <CardContent>
                                   <form onSubmit={handleInviteGhostShopper} className="space-y-4">
                                       <div className="grid md:grid-cols-2 gap-4">
                                           <div className="grid gap-2">
                                               <Label htmlFor="shopper-email">Shopper's Email</Label>
                                               <Input id="shopper-email" type="email" placeholder="shopper@email.com" value={shopperEmail} onChange={(e) => setShopperEmail(e.target.value)} required />
                                           </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="shopper-offer">Reward Offer</Label>
                                                <Select value={shopperOffer} onValueChange={(value) => setShopperOffer(value)} required>
                                                    <SelectTrigger id="shopper-offer">
                                                        <SelectValue placeholder="Select a reward..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="$10 Gift Card for your next visit">
                                                            $10 Gift Card (Service Recovery Standard)
                                                        </SelectItem>
                                                        <SelectItem value="$25 Gift Card">
                                                            $25 Gift Card
                                                        </SelectItem>
                                                        <SelectItem value="Free Menu Item of your choice">
                                                            Free Menu Item
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                       </div>
                                       <Button type="submit" disabled={!shopperEmail || !shopperOffer || !selectedLocation}>
                                           <Sparkles className="mr-2 h-4 w-4" /> Generate Invitation
                                       </Button>
                                   </form>
                               </CardContent>
                        </Card>
                         <Card>
                               <CardHeader>
                                   <CardTitle className="font-headline flex items-center gap-2"><Megaphone /> Company Announcement</CardTitle>
                                   <CardDescription>Record and post a company-wide video message for all employees. It will appear at the top of their dashboard.</CardDescription>
                               </CardHeader>
                               <CardContent>
                                   <Dialog open={isAnnouncementDialogOpen} onOpenChange={setIsAnnouncementDialogOpen}>
                                       <DialogTrigger asChild><Button variant="outline"><Video className="mr-2"/>Post New Announcement</Button></DialogTrigger>
                                       <DialogContent>
                                           <DialogHeader>
                                               <DialogTitle>New Video Announcement</DialogTitle>
                                               <DialogDescription>Your message will be displayed to all employees immediately.</DialogDescription>
                                           </DialogHeader>
                                           <form onSubmit={handlePostAnnouncement}>
                                               <div className="grid gap-4 py-4">
                                                   <div className="grid gap-2">
                                                       <Label htmlFor="ann-title">Message Title</Label>
                                                       <Input id="ann-title" value={announcementTitle} onChange={e => setAnnouncementTitle(e.target.value)} placeholder="e.g., A Holiday Greeting" required />
                                                   </div>
                                                   <div className="grid gap-2">
                                                       <Label htmlFor="ann-video">Video File</Label>
                                                       <Input id="ann-video" type="file" accept="video/*" onChange={e => setAnnouncementVideo(e.target.files ? e.target.files[0] : null)} required />
                                                   </div>
                                               </div>
                                               <DialogFooter>
                                                   <Button type="submit">Post Message</Button>
                                               </DialogFooter>
                                           </form>
                                       </DialogContent>
                                   </Dialog>
                               </CardContent>
                           </Card>
                    </TabsContent>
                </Tabs>
           </CardContent>
       </Card>

       <Card>
           <CardHeader>
                <CardTitle className="font-headline">Strategic Command & Administration</CardTitle>
                <CardDescription>High-level tools for management, security, and system configuration.</CardDescription>
           </CardHeader>
           <CardContent>
               <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
                   <AccordionItem value="item-1">
                       <AccordionTrigger><div className="flex items-center gap-2"><Eye className="h-5 w-5"/> AI Sentinel & Security</div></AccordionTrigger>
                       <AccordionContent className="p-1 pt-4">
                           <AIMonitoringSetup />
                           <Card className="mt-6" id="agent-activity-log">
                               <CardHeader className="flex-row items-center justify-between">
                                   <div>
                                       <CardTitle className="font-headline flex items-center gap-2"><Bot /> Sentinel Agent Activity Log</CardTitle>
                                       <CardDescription>A live feed of actions taken by the autonomous AI agent.</CardDescription>
                                   </div>
                                    <Button onClick={handleRunAgent} disabled={isAgentRunning}>
                                       {isAgentRunning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Activity className="mr-2 h-4 w-4" />}
                                       Run Agent Cycle
                                   </Button>
                               </CardHeader>
                               <CardContent>
                                   {agentActivity.length > 0 ? (
                                       <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
                                           {agentActivity.map((log, index) => (
                                               <div key={index} className="flex gap-4">
                                                   <div className="flex flex-col items-center">
                                                       <div className="p-2 rounded-full bg-primary text-primary-foreground"><Bot className="h-5 w-5" /></div>
                                                       <div className="flex-1 w-px bg-border"></div>
                                                   </div>
                                                   <div className="pb-4">
                                                       <p className="text-xs text-muted-foreground">{formatDistanceToNow(log.timestamp, { addSuffix: true })}</p>
                                                       <p className="font-semibold">{log.actionTaken}</p>
                                                       <p className="text-sm text-muted-foreground italic">"{log.reasoning}"</p>
                                                   </div>
                                               </div>
                                           ))}
                                       </div>
                                   ) : (
                                       <div className="text-center text-sm text-muted-foreground p-8 border-dashed border-2 rounded-md">
                                           No agent activity recorded yet. Click "Run Agent Cycle" to have the AI check for tasks.
                                       </div>
                                   )}
                               </CardContent>
                           </Card>
                       </AccordionContent>
                   </AccordionItem>
                   <AccordionItem value="item-2">
                       <AccordionTrigger><div className="flex items-center gap-2"><Building className="h-5 w-5"/> Team & Locations</div></AccordionTrigger>
                       <AccordionContent className="p-4 space-y-2">
                           <p className="text-sm text-muted-foreground">Manage your organization's users, roles, and business locations.</p>
                            <div className="flex flex-wrap gap-2 pt-2">
                               <Button asChild variant="outline"><Link href="/dashboard/owner/team"><Users className="mr-2"/> Manage Team & Permissions</Link></Button>
                                <Dialog open={isAddLocationDialogOpen} onOpenChange={setIsAddLocationDialogOpen}>
                                    <DialogTrigger asChild><Button variant="outline"><PlusCircle className="mr-2 h-4 w-4" /> Add or Manage Locations</Button></DialogTrigger>
                                    <DialogContent className="max-w-2xl">
                                        <DialogHeader><DialogTitle className="font-headline">Manage Locations</DialogTitle><DialogDescription>Add new locations or get QR code links for guest reporting.</DialogDescription></DialogHeader>
                                        <div className='py-4 space-y-6'>
                                            {locations.length > 0 && (
                                                <div className='space-y-4'>
                                                    <Label>Existing Locations</Label>
                                                    <div className="space-y-3 rounded-md border p-3">
                                                        {locations.map(loc => {
                                                            const guestUrl = typeof window !== 'undefined' ? `${window.location.origin}/guest/report?location=${encodeURIComponent(loc.name)}` : '';
                                                            return (
                                                            <div key={loc.id} className="flex items-center justify-between">
                                                                <p className="font-medium">{loc.name}</p>
                                                                <div className="flex items-center gap-2">
                                                                    <Input readOnly value={guestUrl} className="text-xs h-8" />
                                                                    <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleCopyUrl(guestUrl, loc.id)}>
                                                                        {copiedUrlId === loc.id ? <Check className="h-4 w-4"/> : <ClipboardCopy className="h-4 w-4" />}
                                                                        <span className="sr-only">Copy URL</span>
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                            <Separator />
                                            <div>
                                                <Label className="font-semibold">Add a New Location</Label>
                                                <form onSubmit={handleAddLocation} className="space-y-4 pt-2">
                                                    <div className="grid gap-2"><Label htmlFor="new-loc-name">Location Name</Label><Input id="new-loc-name" placeholder="e.g., Uptown Bistro" value={newLocationData.name} onChange={(e) => setNewLocationData(prev => ({...prev, name: e.target.value}))} required /></div>
                                                    <div className="grid gap-2"><Label htmlFor="new-loc-manager">Manager Name</Label><Input id="new-loc-manager" placeholder="e.g., Casey Lee" value={newLocationData.managerName} onChange={(e) => setNewLocationData(prev => ({...prev, managerName: e.target.value}))} required /></div>
                                                    <div className="grid gap-2"><Label htmlFor="new-loc-email">Manager Email</Label><Input id="new-loc-email" type="email" placeholder="casey@example.com" value={newLocationData.managerEmail} onChange={(e) => setNewLocationData(prev => ({...prev, managerEmail: e.target.value}))} required /></div>
                                                    <DialogFooter><Button type="submit">Save New Location</Button></DialogFooter>
                                                </form>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                       </AccordionContent>
                   </AccordionItem>
                   <AccordionItem value="item-3">
                       <AccordionTrigger><div className="flex items-center gap-2"><Settings className="h-5 w-5"/> System & Administration</div></AccordionTrigger>
                       <AccordionContent className="p-4 space-y-2">
                           <p className="text-sm text-muted-foreground">Configure the core system settings for your organization.</p>
                           <div className="flex flex-wrap gap-2 pt-2">
                               <Button asChild variant="outline"><Link href="/dashboard/owner/agent-rules"><Bot className="mr-2"/> AI Agent Rules</Link></Button>
                               <Button asChild variant="outline"><Link href="/dashboard/owner/branding"><FileText className="mr-2"/> Branding</Link></Button>
                               <Button asChild variant="outline"><Link href="/dashboard/owner/billing"><DollarSign className="mr-2"/> Billing</Link></Button>
                           </div>
                       </AccordionContent>
                   </AccordionItem>
               </Accordion>
           </CardContent>
       </Card>
      
       <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Reject Hiring Request</DialogTitle>
                    <DialogDescription>Provide a brief reason for rejecting the request for a {requestToReject?.role}. This will be sent to the manager.</DialogDescription>
                </DialogHeader>
                <div className="py-4"><Textarea placeholder="e.g., We don't have the budget for a new hire at this time. Let's revisit in Q4." value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)}/></div>
                <DialogFooter><Button variant="ghost" onClick={() => setIsRejectDialogOpen(false)}>Cancel</Button><Button variant="destructive" onClick={handleRejectRequest}> Send Rejection</Button></DialogFooter>
            </DialogContent>
        </Dialog>

       <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogContent className="max-w-2xl">
              <DialogHeader>
                  <DialogTitle className="font-headline">Review Invitation Email</DialogTitle>
                  <DialogDescription>
                      The AI has drafted the following invitation. Review it, then send it to {shopperEmail}.
                  </DialogDescription>
              </DialogHeader>
              {isGeneratingInvite ? (
                  <div className="flex items-center justify-center p-8 space-x-2">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <p className="text-muted-foreground">AI is drafting the email...</p>
                  </div>
              ) : inviteContent ? (
                  <div className="py-4 space-y-4">
                      <div className="grid gap-2">
                          <Label>Subject</Label>
                          <Input readOnly value={inviteContent.subject} />
                      </div>
                      <div className="grid gap-2">
                          <Label>Body</Label>
                          <Textarea readOnly defaultValue={inviteContent.body} rows={12} />
                      </div>
                  </div>
              ) : (
                  <div className="py-4 text-center text-destructive">Failed to generate invite.</div>
              )}
              <DialogFooter>
                  <Button variant="secondary" onClick={() => setIsInviteDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSendInvite} disabled={isGeneratingInvite || !inviteContent}>
                      <Send className="mr-2 h-4 w-4" /> Send Email (Simulated)
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
}
