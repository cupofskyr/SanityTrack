
'use client';

import { useState, useEffect, FormEvent } from 'react';
import Image from 'next/image';
import {
  fetchToastDataAction,
  summarizeReviewsAction,
  postJobAction,
  runMasterAgentCycleAction,
} from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, Rss, BarChart2, Briefcase, Check, X, Send, Package, ShoppingCart, PlusCircle, Building, User, Phone, Megaphone, Activity, Bot, ShieldCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import type { ToastPOSData } from '@/ai/flows/fetch-toast-data-flow';
import type { SummarizeReviewsOutput } from '@/ai/schemas/review-summary-schemas';
import OwnerServiceAlertWidget from '@/components/owner-service-alert-widget';
import { Input } from '@/components/ui/input';
import type { GenerateDailyBriefingOutput } from '@/ai/schemas/daily-briefing-schemas';
import OnboardingInterview from '@/components/onboarding/onboarding-interview';
import type { MasterAgentOutput } from '@/ai/schemas/agent-schemas';
import { format, formatDistanceToNow } from 'date-fns';
import VirtualSecurityCameraManager from '@/components/virtual-security-camera-manager';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

type AgentActivityLog = MasterAgentOutput & {
  timestamp: Date;
};

type QaAuditLog = {
    id: number;
    location: string;
    item: string;
    score: number;
    timestamp: string;
};

type PurchaseOrder = {
    id: string;
    locationName: string;
    submittedBy: string;
    subject: string;
    list: string;
};

export default function OwnerDashboard() {
  const { toast } = useToast();

  const [isNewUser, setIsNewUser] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  
  const [selectedLocation, setSelectedLocation] = useState<Location | undefined>(undefined);
  const [toastData, setToastData] = useState<ToastPOSData | null>(null);
  const [isFetchingToast, setIsFetchingToast] = useState(false);

  const [reviewSummary, setReviewSummary] = useState<SummarizeReviewsOutput | null>(null);
  const [isFetchingReviews, setIsFetchingReviews] = useState(false);

  const [hiringRequests, setHiringRequests] = useState<HiringRequest[]>([]);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [requestToReject, setRequestToReject] = useState<HiringRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  const [isAddLocationDialogOpen, setIsAddLocationDialogOpen] = useState(false);
  const [newLocationData, setNewLocationData] = useState({ name: '', managerName: '', managerEmail: ''});

  const [dailyBriefing, setDailyBriefing] = useState<GenerateDailyBriefingOutput | null>(null);
  const [isBriefingDialogOpen, setIsBriefingDialogOpen] = useState(false);
  
  const [agentActivity, setAgentActivity] = useState<AgentActivityLog[]>([]);
  const [isAgentRunning, setIsAgentRunning] = useState(false);

  const [qaAuditLog, setQaAuditLog] = useState<QaAuditLog[]>([]);
  
  const [pendingPOs, setPendingPOs] = useState<PurchaseOrder[]>([]);

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
        setReviewSummary(null);
    }
  }, [selectedLocation]);
  
  useEffect(() => {
    const checkStorage = () => {
        const storedRequests = localStorage.getItem('hiringRequests');
        if (storedRequests) setHiringRequests(JSON.parse(storedRequests));
        
        const storedQaLog = JSON.parse(localStorage.getItem('qa-audit-log') || '[]');
        setQaAuditLog(storedQaLog);
        
        const storedPOs = JSON.parse(localStorage.getItem('pendingPurchaseOrders') || '[]');
        setPendingPOs(storedPOs);
    };

    checkStorage();
    const interval = setInterval(checkStorage, 2000); // Poll for updates

    return () => clearInterval(interval);
  }, []);
  
  const handleOnboardingComplete = () => {
        setIsNewUser(false);
        localStorage.setItem('sanity-track-locations', JSON.stringify([])); 
        toast({ title: "Setup Complete!", description: "Welcome to your new dashboard. Please add a location to begin." });
  };
    
  const handlePostBriefing = () => {
      toast({
          title: "Briefing Posted!",
          description: "Your daily message is now visible to all employees."
      });
      setIsBriefingDialogOpen(false);
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
          // Use a fixed code for the demo to make KDS pairing easier
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
  
  const handleFetchReviews = async (source: 'Google' | 'Yelp') => {
      if (!selectedLocation) return;
      setIsFetchingReviews(true);
      setReviewSummary(null);
      const result = await summarizeReviewsAction({ source, location: selectedLocation.name });
      if (result.data) {
          setReviewSummary(result.data);
          toast({ title: `${source} Reviews Loaded` });
      } else {
          toast({ variant: 'destructive', title: 'Review Fetch Error', description: result.error });
      }
      setIsFetchingReviews(false);
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
        cameraObservations: ["Spill detected on floor near counter."],
        stockLevels: [{ item: 'Coffee Cups', level: 'Critical' as const }],
        openTasks: [],
    };
    const simulatedRules = [
        { id: 'auto-spill-cleaner', name: 'Auto-Tasker for Spills', description: '...', isEnabled: true },
        { id: 'auto-restock-alerter', name: 'Proactive Restock Alerter', description: '...', isEnabled: true },
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
            <CardHeader className="flex-row items-start justify-between">
                <div>
                    <CardTitle className="font-headline">Location Overview</CardTitle>
                    <CardDescription>Select a location to view its live sales and customer feedback.</CardDescription>
                </div>
                <Dialog open={isAddLocationDialogOpen} onOpenChange={setIsAddLocationDialogOpen}>
                    <DialogTrigger asChild><Button variant="outline" size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Add Location</Button></DialogTrigger>
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
            </CardHeader>
            <CardContent>
                 <Select value={selectedLocation?.name} onValueChange={(name) => setSelectedLocation(locations.find(l => l.name === name))}>
                    <SelectTrigger className="w-full md:w-1/3"><SelectValue placeholder="Select location..." /></SelectTrigger>
                    <SelectContent>{locations.map(loc => <SelectItem key={loc.id} value={loc.name}>{loc.name}</SelectItem>)}</SelectContent>
                </Select>
                 {selectedLocation && (
                    <div className="mt-4 p-4 border rounded-lg bg-muted/50 text-sm">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="font-semibold flex items-center gap-2"><Building className="h-4 w-4 text-muted-foreground" /> Name:</div><div>{selectedLocation.name}</div>
                            <div className="font-semibold flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /> Manager:</div><div>{selectedLocation.manager}</div>
                            <div className="font-semibold flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> Health Dept Code:</div><div className="font-mono text-xs p-1 bg-background rounded-md">{selectedLocation.inspectionCode}</div>
                        </div>
                    </div>
                 )}
            </CardContent>
             <CardFooter>
                 <Dialog open={isBriefingDialogOpen} onOpenChange={setIsBriefingDialogOpen}>
                    <DialogTrigger asChild><Button variant="outline"><Megaphone className="mr-2 h-4 w-4"/> Post Daily Briefing</Button></DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="font-headline">Post Daily Briefing</DialogTitle>
                            <DialogDescription>This message will appear on the dashboard for all employees.</DialogDescription>
                        </DialogHeader>
                        {dailyBriefing ? (
                            <div className="py-4 space-y-2">
                                <Label>AI Suggested Message:</Label>
                                <p className="font-semibold">{dailyBriefing.title}</p>
                                <p className="text-sm text-muted-foreground">{dailyBriefing.message}</p>
                            </div>
                        ) : <Loader2 className="animate-spin" />}
                         <DialogFooter><Button onClick={handlePostBriefing}>Post Message</Button></DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardFooter>
        </Card>

        {selectedLocation && <OwnerServiceAlertWidget locationId={selectedLocation.name} />}
        
        <VirtualSecurityCameraManager />

        <Card>
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
        
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><ShieldCheck /> QA Sentinel Audit Log</CardTitle>
                <CardDescription>A log of all automated Quality Assurance alerts triggered by the AI.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow><TableHead>Location</TableHead><TableHead>Item</TableHead><TableHead>Score</TableHead><TableHead>Timestamp</TableHead></TableRow>
                    </TableHeader>
                    <TableBody>
                        {qaAuditLog.length > 0 ? qaAuditLog.map(log => (
                            <TableRow key={log.id}>
                                <TableCell>{log.location}</TableCell>
                                <TableCell>{log.item}</TableCell>
                                <TableCell><Badge variant={log.score < 7 ? "destructive" : "secondary"}>{log.score}/10</Badge></TableCell>
                                <TableCell>{formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}</TableCell>
                            </TableRow>
                        )) : (
                            <TableRow><TableCell colSpan={4} className="h-24 text-center">No QA alerts have been triggered yet.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><BarChart2 /> Live Sales Data (Simulated)</CardTitle>
                    <CardDescription>Real-time sales figures for {selectedLocation?.name} powered by Toast POS integration.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isFetchingToast ? <Loader2 className="h-6 w-6 animate-spin" /> : toastData ? (
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div><p className="text-sm text-muted-foreground">Today's Sales</p><p className="text-3xl font-bold">${toastData.liveSalesToday.toLocaleString()}</p></div>
                             <div><p className="text-sm text-muted-foreground">Month-to-Date Sales</p><p className="text-3xl font-bold">${toastData.salesThisMonth.toLocaleString()}</p></div>
                        </div>
                    ) : ( <p className="text-muted-foreground">Could not load sales data.</p> )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Package /> POS Connection</CardTitle>
                    <CardDescription>Connect to your POS provider to unlock live inventory and sales analytics.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                     <Alert>
                        <AlertTitle>Connect to your POS</AlertTitle>
                        <AlertDescription>Enable live inventory tracking, real-time sales data, and predictive ordering by connecting your POS system.</AlertDescription>
                    </Alert>
                    <div className="flex gap-4 w-full">
                        <Button variant="outline" className="w-full">Connect to Toast</Button>
                        <Button variant="outline" className="w-full">Connect to Square</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><Rss /> Customer Feedback for {selectedLocation?.name}</CardTitle>
                <CardDescription>Fetch and summarize recent reviews from Google or Yelp.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="flex gap-4 mb-6">
                    <Button onClick={() => handleFetchReviews('Google')} disabled={isFetchingReviews}>{isFetchingReviews && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Fetch Google Reviews</Button>
                    <Button onClick={() => handleFetchReviews('Yelp')} disabled={isFetchingReviews} variant="outline">{isFetchingReviews && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Fetch Yelp Reviews</Button>
                </div>
                 {reviewSummary && (
                     <div>
                        <Alert className="mb-4"><AlertTitle className="font-semibold">AI Summary</AlertTitle><AlertDescription>{reviewSummary.summary}</AlertDescription></Alert>
                        <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                            {reviewSummary.reviews.map((review, index) => (
                                <div key={index} className="p-3 border rounded-lg bg-muted/50">
                                    <div className="flex justify-between items-start">
                                        <p className="font-semibold">{review.author}</p>
                                        <div className="flex items-center gap-1">
                                            <Badge variant="outline" className="mr-2">{review.source}</Badge>
                                            {Array.from({ length: 5 }).map((_, i) => (<Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-accent' : 'text-muted-foreground/30'}`} fill="currentColor"/>))}
                                        </div>
                                    </div>
                                    <blockquote className="text-sm italic border-l-2 pl-3 mt-1">"{review.comment}"</blockquote>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>

        {pendingPOs.length > 0 && (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><ShoppingCart /> Purchase Order Approval</CardTitle>
                    <CardDescription>Your managers have submitted the following purchase orders for your approval.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {pendingPOs.map(po => (
                        <Card key={po.id} className="bg-muted/30">
                            <CardHeader>
                                <CardTitle className="text-lg">{po.subject}</CardTitle>
                                <CardDescription>From: {po.locationName} (Manager: {po.submittedBy})</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Textarea readOnly value={po.list} rows={5} />
                            </CardContent>
                            <CardFooter className="gap-2">
                                <Button onClick={() => handlePOAction(po.id, 'approved')}><Check className="mr-2 h-4 w-4"/> Approve & Send</Button>
                                <Button variant="destructive" onClick={() => handlePOAction(po.id, 'rejected')}><X className="mr-2 h-4 w-4"/> Reject</Button>
                            </CardFooter>
                        </Card>
                    ))}
                </CardContent>
            </Card>
        )}

      <Card>
        <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Briefcase /> Hiring Requests</CardTitle>
            <CardDescription>Review, approve, or reject new hire requests submitted by your managers.</CardDescription>
        </CardHeader>
        <CardContent>
            {hiringRequests.length > 0 ? (
                <div className="space-y-4">
                    {hiringRequests.map(req => (
                        <Card key={req.id} className="bg-muted/30">
                            <CardHeader><CardTitle className="text-lg">Request: {req.role} at {req.location}</CardTitle><CardDescription>Submitted by {req.manager}</CardDescription></CardHeader>
                            <CardContent>
                                <p className="text-sm"><strong>Shift:</strong> {req.shiftType} | <strong>Urgency:</strong> {req.urgency}</p>
                                <blockquote className="mt-2 border-l-2 pl-4 text-sm italic">"{req.justification}"</blockquote>
                            </CardContent>
                            <CardFooter className="gap-2">
                                <Button onClick={() => handleApproveRequest(req)}><Check className="mr-2 h-4 w-4"/> Approve & Post Job</Button>
                                <Button variant="destructive" onClick={() => openRejectDialog(req)}><X className="mr-2 h-4 w-4"/> Reject</Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (<p className="text-muted-foreground text-center py-4">No pending hiring requests.</p>)}
        </CardContent>
      </Card>

       <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Reject Hiring Request</DialogTitle>
                    <DialogDescription>Provide a brief reason for rejecting the request for a {requestToReject?.role}. This will be sent to the manager.</DialogDescription>
                </DialogHeader>
                <div className="py-4"><Textarea placeholder="e.g., We don't have the budget for a new hire at this time. Let's revisit in Q4." value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)}/></div>
                <DialogFooter><Button variant="ghost" onClick={() => setIsRejectDialogOpen(false)}>Cancel</Button><Button variant="destructive" onClick={handleRejectRequest}><Send className="mr-2 h-4 w-4"/>Send Rejection</Button></DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}
