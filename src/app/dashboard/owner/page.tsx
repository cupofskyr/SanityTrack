
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
    // Check if user is new from sessionStorage, set by AuthContext
    const newUserFlag = sessionStorage.getItem('isNewUser');
    if (newUserFlag === 'true') {
        setIsNewUser(true);
        // Important: remove the flag after checking it to prevent re-triggering
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
    };

    checkStorage();
    const interval = setInterval(checkStorage, 2000); 

    return () => clearInterval(interval);
  }, []);
  
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

  return (
    <div className="space-y-6">
       <Feature name="executiveVitals">
         <Card>
            <CardHeader>
                <div className="flex items-center justify-between"><CardTitle className="font-headline">Executive Vitals (Simulated Data)</CardTitle></div>
            </CardHeader>
             <CardContent>
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                    <Card><CardHeader><CardTitle className="text-sm font-medium">Today's Sales</CardTitle><DollarSign /></CardHeader><CardContent>{isFetchingToast ? <Loader2/> : toastData ? <div>${toastData.liveSalesToday.toLocaleString()}</div> : <p>No data</p>}</CardContent></Card>
                    <Card><CardHeader><CardTitle className="text-sm font-medium">Compliance</CardTitle><ShieldCheck/></CardHeader><CardContent><div>92.5%</div></CardContent></Card>
                    <Card><CardHeader><CardTitle className="text-sm font-medium">Cust. Sat.</CardTitle><Smile/></CardHeader><CardContent><div>4.8/5</div></CardContent></Card>
                    <Card><CardHeader><CardTitle className="text-sm font-medium">Labor %</CardTitle><Users/></CardHeader><CardContent><div>28%</div></CardContent></Card>
                    <Card><CardHeader><CardTitle className="text-sm font-medium">Handwash/Hr</CardTitle><Handshake/></CardHeader><CardContent><div>12</div></CardContent></Card>
                    <Card><CardHeader><CardTitle className="text-sm font-medium">Prep Time</CardTitle><Watch/></CardHeader><CardContent><div>55s</div></CardContent></Card>
                </div>
             </CardContent>
         </Card>
       </Feature>
    </div>
  );
}
