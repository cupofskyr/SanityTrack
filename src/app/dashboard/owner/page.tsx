
"use client";

import { useState, useEffect, type FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { DollarSign, ShieldCheck, TrendingUp, AlertTriangle, CheckCircle, XCircle, MapPin, UserCog, Megaphone, ClipboardPen, ShieldAlert, Sparkles, Loader2, Lightbulb, MessageSquare, Briefcase, Share2, Rss, PlusCircle, Boxes, CalendarClock, CalendarIcon, ListTodo, LinkIcon, UserPlus, Clock, Send, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';
import { suggestTaskAssignment, type SuggestTaskAssignmentOutput } from '@/ai/flows/suggest-task-assignment-flow';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import PhotoUploader from '@/components/photo-uploader';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { fetchToastData, type ToastPOSData } from '@/ai/flows/fetch-toast-data-flow';
import LiveReviews from '@/components/live-reviews';
import { generateDailyBriefing, type GenerateDailyBriefingOutput } from '@/ai/flows/generate-daily-briefing-flow';
import { format } from 'date-fns';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { postJob, type JobPostingInput } from '@/ai/flows/post-job-flow';


type TeamMember = { name: string; role: "Manager" | "Employee"; location: string };
type Location = { id: number; name: string; manager: string; inspectionCode: string; toastApiKey?: string; };
type HealthTaskStatus = 'Pending' | 'Delegated' | 'PendingOwnerApproval' | 'Submitted';
type HealthTask = { id: number; description: string; source: string; status: HealthTaskStatus; delegatedTo?: string; attachment?: { url: string; name: string; }; };
type Meeting = {
    id: number;
    title: string;
    date: Date;
    time: string;
    attendee: string;
    description: string;
    meetLink?: string;
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


const initialHealthDeptTasks: HealthTask[] = [
    { id: 1, description: "Verify all employee food handler certifications are up to date.", source: "City Health Inspector", status: "Pending" },
    { id: 4, description: "Quarterly pest control inspection report.", source: "City Ordinance 23B", status: "Submitted" },
];

const initialHiringRequests: HiringRequest[] = [
    { id: 1, manager: 'Alex Ray', location: 'Downtown Cafe', role: 'Line Cook', urgency: 'Immediate', shiftType: 'Full-time', justification: 'Our current cook is going on extended leave, and we need coverage to maintain service quality.' },
    { id: 2, manager: 'Casey Lee', location: 'Uptown Smoothies', role: 'Barista', urgency: 'Within 2 Weeks', shiftType: 'Part-time', justification: 'Increased foot traffic in the mornings is causing long wait times. A part-time barista will improve customer satisfaction.' },
];

export default function OwnerDashboard() {
    const { toast } = useToast();
    
    // --- STATE MANAGEMENT ---
    const [locations, setLocations] = useState<Location[]>([]);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [hiringRequests, setHiringRequests] = useState<HiringRequest[]>(initialHiringRequests);
    const [memo, setMemo] = useState("Finalize Q3 budget by Friday. Follow up with vendor about new coffee machine.");
    const [healthDeptTasks, setHealthDeptTasks] = useState<HealthTask[]>(initialHealthDeptTasks);
    const [crucialAlerts, setCrucialAlerts] = useState<any[]>([]);
    
    // AI State
    const [isAssigning, setIsAssigning] = useState(false);
    const [assignmentResult, setAssignmentResult] = useState<SuggestTaskAssignmentOutput | null>(null);
    const [selectedAlert, setSelectedAlert] = useState<string | null>(null);

    // Dialog State
    const [isDelegateDialogOpen, setDelegateDialogOpen] = useState(false);
    const [isReviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [isContactManagerOpen, setContactManagerOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<HealthTask | null>(null);
    const [selectedManager, setSelectedManager] = useState('');
    const [isShareCodeDialogOpen, setShareCodeDialogOpen] = useState(false);
    const [locationToShare, setLocationToShare] = useState<Location | null>(null);
    const [inspectorEmail, setInspectorEmail] = useState('');
    const [isAddLocationDialogOpen, setIsAddLocationDialogOpen] = useState(false);
    const [newLocationData, setNewLocationData] = useState({
        name: '',
        toastKey: '',
        managerName: '',
        managerEmail: '',
    });
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [requestToReject, setRequestToReject] = useState<HiringRequest | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    // Onboarding Form State
    const [newLocationName, setNewLocationName] = useState('');
    const [newToastKey, setNewToastKey] = useState('');
    const [newManagerName, setNewManagerName] = useState('');
    const [newManagerEmail, setNewManagerEmail] = useState('');
    
    // Data fetching state
    const [toastData, setToastData] = useState<ToastPOSData | null>(null);
    const [isFetchingToast, setIsFetchingToast] = useState(false);

    // Daily briefing state
    const [isBriefingDialogOpen, setIsBriefingDialogOpen] = useState(false);
    const [dailyBriefing, setDailyBriefing] = useState<GenerateDailyBriefingOutput | null>(null);
    const [isGeneratingBriefing, setIsGeneratingBriefing] = useState(true);

    // Meeting state
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [meetingDetails, setMeetingDetails] = useState({ title: '', date: new Date(), time: '', attendee: '', description: '' });

    const managers = teamMembers.filter(m => m.role === 'Manager');
    
    useEffect(() => {
        if (locations.length > 0 && locations[0].name) {
            setIsFetchingToast(true);
            fetchToastData({ location: locations[0].name })
                .then(data => setToastData(data))
                .catch(err => {
                    console.error("Failed to fetch Toast data", err);
                    toast({ variant: 'destructive', title: 'Could not load POS data.' });
                })
                .finally(() => setIsFetchingToast(false));
        }
    }, [locations, toast]);

    useEffect(() => {
        const getBriefing = async () => {
            if (locations.length === 0) return;

            const today = format(new Date(), 'yyyy-MM-dd');
            const lastBriefingDate = localStorage.getItem('lastOwnerBriefingShown');

            if (lastBriefingDate === today) {
                setIsGeneratingBriefing(false);
                return; // Already shown today
            }

            setIsGeneratingBriefing(true);
            try {
                const briefing = await generateDailyBriefing();
                setDailyBriefing(briefing);
                setIsBriefingDialogOpen(true);
                localStorage.setItem('lastOwnerBriefingShown', today);
            } catch (error) {
                console.error("Failed to generate daily briefing:", error);
                toast({
                    variant: "destructive",
                    title: "AI Daily Briefing Failed",
                    description: "Could not generate a daily message for the team.",
                });
            } finally {
                setIsGeneratingBriefing(false);
            }
        };
        
        getBriefing();
    }, [locations.length, toast]);

    useEffect(() => {
        const pendingMemo = localStorage.getItem('ai-memo-suggestion');
        if (pendingMemo) {
            setMemo(prev => `${prev}\n\n- AI Camera Note: ${pendingMemo}`);
            localStorage.removeItem('ai-memo-suggestion');
            toast({
                title: "AI Suggestion Added",
                description: "The note from the AI Camera has been added to your memo board."
            });
        }
    }, [toast]);

    const handlePostBriefing = () => {
        toast({
            title: "Briefing Posted!",
            description: "Your daily message is now visible to all employees."
        });
        setIsBriefingDialogOpen(false);
        // In a real app, this would save the briefing to a database.
    };

    const handleSetupLocation = (e: FormEvent) => {
        e.preventDefault();
        if (!newLocationName || !newManagerName || !newManagerEmail) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please fill out all required fields.' });
            return;
        }

        const newLocation: Location = {
            id: 1,
            name: newLocationName,
            manager: newManagerName,
            inspectionCode: `${newLocationName.substring(0,2).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
            toastApiKey: newToastKey,
        };
        const newManager: TeamMember = {
            name: newManagerName,
            role: "Manager",
            location: newLocationName,
        };

        setLocations([newLocation]);
        setTeamMembers([newManager]);

        toast({
            title: 'Location Setup Complete!',
            description: `${newLocationName} is now configured and the manager has been invited.`,
        });

        // Simulate new tasks/alerts appearing after setup
        setHealthDeptTasks(prev => [
            ...prev,
            { id: 2, description: `Monthly deep clean and sanitization of all ice machines for ${newLocationName}.`, source: "State Regulation 5.11a", status: "Delegated", delegatedTo: newManagerName },
            { id: 3, description: `Clear blockage from back storage area hand-washing sink at ${newLocationName}.`, source: "Health Inspector Report (2024-07-01)", status: "PendingOwnerApproval", delegatedTo: newManagerName, attachment: { url: "https://placehold.co/600x400.png", name: "sink-fixed.png"} },
        ]);
        setCrucialAlerts([
            { id: 1, location: newLocationName, description: "Main freezer unit is offline. Temperature rising rapidly." },
            { id: 2, location: newLocationName, description: "POS system is down. Cannot process credit card payments." },
            { id: 3, location: newLocationName, type: 'overtime', description: "John Doe has requested 2 hours of overtime for deep cleaning." }
        ]);
    };

    const handleAddLocation = (e: FormEvent) => {
        e.preventDefault();
        if (!newLocationData.name || !newLocationData.managerName || !newLocationData.managerEmail) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please fill out all required fields for the new location.' });
            return;
        }

        const newLocationId = locations.length > 0 ? Math.max(...locations.map(l => l.id)) + 1 : 1;
        const newLocation: Location = {
            id: newLocationId,
            name: newLocationData.name,
            manager: newLocationData.managerName,
            inspectionCode: `${newLocationData.name.substring(0, 2).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
            toastApiKey: newLocationData.toastKey,
        };
        const newManager: TeamMember = {
            name: newLocationData.managerName,
            role: "Manager",
            location: newLocationData.name,
        };

        setLocations([...locations, newLocation]);
        setTeamMembers([...teamMembers, newManager]);

        toast({
            title: 'Location Added!',
            description: `${newLocation.name} is now configured and its manager has been invited.`,
        });

        // Reset form and close dialog
        setNewLocationData({ name: '', toastKey: '', managerName: '', managerEmail: '' });
        setIsAddLocationDialogOpen(false);
    };

    if (locations.length === 0) {
        return (
            <div className="flex items-center justify-center p-4 md:p-8">
                <Card className="w-full max-w-2xl">
                    <CardHeader>
                        <CardTitle className="font-headline text-primary flex items-center gap-2"><Sparkles /> Welcome! Let's Set Up Your First Location.</CardTitle>
                        <CardDescription>
                            Provide some basic information to get your dashboard up and running. You can add more locations later.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSetupLocation} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="location-name">Location Name</Label>
                                <Input id="location-name" placeholder="e.g., Downtown Cafe" value={newLocationName} onChange={e => setNewLocationName(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="toast-key">Toast POS API Key (Optional)</Label>
                                <Input id="toast-key" placeholder="Enter your API key to sync sales data" value={newToastKey} onChange={e => setNewToastKey(e.target.value)} />
                                <p className="text-xs text-muted-foreground">This is a simulation. You can enter any value.</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="manager-name">Manager's Full Name</Label>
                                    <Input id="manager-name" placeholder="Alex Ray" value={newManagerName} onChange={e => setNewManagerName(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="manager-email">Manager's Email (for Invite)</Label>
                                    <Input id="manager-email" type="email" placeholder="alex@example.com" value={newManagerEmail} onChange={e => setNewManagerEmail(e.target.value)} required/>
                                </div>
                            </div>
                            <Button type="submit" className="w-full">Save & Create Dashboard</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    const handleApproveRequest = async (request: HiringRequest) => {
        setHiringRequests(prev => prev.filter(r => r.id !== request.id));
        toast({
            title: "Posting Job...",
            description: `AI is now posting the ${request.role} position.`
        });

        try {
            const jobInput: JobPostingInput = {
                role: request.role,
                location: request.location,
                shiftType: request.shiftType,
            };
            const result = await postJob(jobInput);
            toast({
                title: "Job Posted Successfully!",
                description: `Confirmation ID: ${result.confirmationId}`,
            });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'AI Posting Failed', description: 'Could not post the job listing.' });
            // Re-add the request to the list if posting fails
            setHiringRequests(prev => [...prev, request].sort((a,b) => a.id - b.id));
        }
    };

    const handleOpenRejectDialog = (request: HiringRequest) => {
        setRequestToReject(request);
        setIsRejectDialogOpen(true);
    };

    const handleConfirmRejection = () => {
        if (!requestToReject || !rejectionReason.trim()) {
            toast({
                variant: 'destructive',
                title: 'Reason Required',
                description: 'Please provide a comment for the manager.',
            });
            return;
        }

        // Simulate sending the rejection back to the manager via localStorage
        const rejectedRequest = { ...requestToReject, ownerComment: rejectionReason };
        const storedRejected = localStorage.getItem('rejectedHiringRequests');
        const rejectedList = storedRejected ? JSON.parse(storedRejected) : [];
        rejectedList.push(rejectedRequest);
        localStorage.setItem('rejectedHiringRequests', JSON.stringify(rejectedList));

        // Update owner's UI
        setHiringRequests(prev => prev.filter(r => r.id !== requestToReject.id));

        toast({
            title: 'Request Rejected',
            description: 'The manager has been notified with your comment.',
            variant: 'secondary',
        });

        // Cleanup state
        setIsRejectDialogOpen(false);
        setRejectionReason('');
        setRequestToReject(null);
    };

    const handleManualPost = (requestId: number) => {
        const request = hiringRequests.find(r => r.id === requestId);
        if (!request) return;

        setHiringRequests(hiringRequests.filter(r => r.id !== requestId));
        toast({
            title: `Request Fulfilled`,
            description: `You have marked the hiring request for a ${request.role} as manually posted.`,
        });
    };

    const handleSuggestAssignment = async (issueDescription: string, location: string) => {
        setSelectedAlert(issueDescription);
        setAssignmentResult(null);
        setIsAssigning(true);
        try {
            const teamForLocation = teamMembers.filter(tm => tm.location === location);
            const result = await suggestTaskAssignment({ issueDescription, teamMembers: teamForLocation });
            setAssignmentResult(result);
        } catch (error) {
            console.error("Failed to get assignment suggestion:", error);
            toast({
                variant: 'destructive',
                title: 'AI Error',
                description: 'Could not generate an assignment suggestion.',
            });
        } finally {
            setIsAssigning(false);
        }
    };

    const closeAssignmentDialog = () => {
        setIsAssigning(false);
        setAssignmentResult(null);
        setSelectedAlert(null);
    }
    
    const handleOpenDelegateDialog = (task: HealthTask) => {
        setSelectedTask(task);
        setDelegateDialogOpen(true);
    };

    const handleDelegateTask = () => {
        if (!selectedTask || !selectedManager) return;
        setHealthDeptTasks(tasks => tasks.map(t => 
            t.id === selectedTask.id ? { ...t, status: 'Delegated', delegatedTo: selectedManager } : t
        ));
        toast({
            title: 'Task Delegated',
            description: `"${selectedTask.description}" has been delegated to ${selectedManager}.`,
        });
        setDelegateDialogOpen(false);
        setSelectedManager('');
        setSelectedTask(null);
    };

    const handleOpenReviewDialog = (task: HealthTask) => {
        setSelectedTask(task);
        setReviewDialogOpen(true);
    };

    const handleApproveAndSubmit = () => {
        if (!selectedTask) return;
        setHealthDeptTasks(tasks => tasks.map(task => 
            task.id === selectedTask.id ? { ...task, status: 'Submitted' } : task
        ));
        toast({
            title: "Submission Approved & Sent",
            description: "The compliance document has been submitted to the health department.",
        });
        setReviewDialogOpen(false);
        setSelectedTask(null);
    };
    
    const handleRejectSubmission = () => {
        if (!selectedTask) return;
        setHealthDeptTasks(tasks => tasks.map(task => 
            task.id === selectedTask.id ? { ...task, status: 'Delegated', attachment: undefined } : t
        ));
        toast({
            variant: "destructive",
            title: "Submission Rejected",
            description: "The task has been sent back to the manager for resubmission.",
        });
        setReviewDialogOpen(false);
        setSelectedTask(null);
    };

    const handleSendMessage = () => {
        toast({
            title: "Message Sent (Simulated)",
            description: "Your message has been sent to the manager."
        });
        setContactManagerOpen(false);
    };

    const handleOpenShareDialog = (location: Location) => {
        setLocationToShare(location);
        setInspectorEmail('');
        setShareCodeDialogOpen(true);
    };

    const handleSendCode = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inspectorEmail.trim()) {
            toast({ variant: 'destructive', title: 'Email Required', description: "Please enter the inspector's email address." });
            return;
        }
        toast({ title: "Code Sent!", description: `The inspection code for ${locationToShare?.name} has been sent to ${inspectorEmail}.` });
        setShareCodeDialogOpen(false);
    };

    const handleScheduleMeeting = (e: React.FormEvent) => {
        e.preventDefault();
        if (!meetingDetails.title || !meetingDetails.date || !meetingDetails.time || !meetingDetails.attendee) {
            toast({ variant: "destructive", title: "Missing Information", description: "Please fill out all meeting details." });
            return;
        }
        const newMeeting: Meeting = {
            id: Date.now(),
            ...meetingDetails,
            meetLink: 'https://meet.google.com/lookup/dmo-cnic-xyz',
        };
        setMeetings(prev => [newMeeting, ...prev]);
        toast({
            title: "Meeting Scheduled (Simulated)",
            description: `A Google Calendar invite for "${meetingDetails.title}" has been sent to ${meetingDetails.attendee}.`,
        });
        // Reset form
        setMeetingDetails({ title: '', date: new Date(), time: '', attendee: '', description: '' });
    };


    return (
        <TooltipProvider>
            <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Live Sales for {locations[0]?.name}
                                    </CardTitle>
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                     {isFetchingToast ? <Loader2 className="h-6 w-6 animate-spin"/> : toastData ? (
                                        <div className="space-y-2">
                                            <div>
                                                <p className="text-xs text-muted-foreground">Today's Sales</p>
                                                <p className="text-2xl font-bold">${toastData.liveSalesToday.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">This Month</p>
                                                <p className="text-lg font-semibold">${toastData.salesThisMonth.toLocaleString()}</p>
                                            </div>
                                        </div>
                                     ) : (
                                        <div className="text-center pt-4">
                                            <p className="text-sm text-muted-foreground">Toast POS not connected.</p>
                                        </div>
                                     )}
                                </CardContent>
                            </Card>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Displays real-time sales data from your Toast POS integration.</p>
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Aggregate Compliance
                                </CardTitle>
                                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                <div className="text-2xl font-bold">94.1%</div>
                                <p className="text-xs text-muted-foreground">
                                    +1.5% from last month
                                </p>
                                </CardContent>
                            </Card>
                        </TooltipTrigger>
                        <TooltipContent><p>Shows the average compliance score across all your locations.</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Overall Customer Sat.</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                <div className="text-2xl font-bold">4.7/5 Stars</div>
                                <p className="text-xs text-muted-foreground">
                                    Across all locations
                                </p>
                                </CardContent>
                            </Card>
                        </TooltipTrigger>
                        <TooltipContent><p>Aggregates customer satisfaction ratings from Google and Yelp.</p></TooltipContent>
                    </Tooltip>
                </div>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="w-full">
                            <LiveReviews location={locations[0]?.name} />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent><p>Fetch and summarize recent customer reviews from Google or Yelp.</p></TooltipContent>
                </Tooltip>

                 <Tooltip>
                     <TooltipTrigger asChild>
                         <Card>
                            <CardHeader>
                                <CardTitle className="font-headline flex items-center gap-2"><UserPlus /> Hiring Requests</CardTitle>
                                <CardDescription>Review and approve hiring requests from your managers. Approved requests will be posted to the job board via AI.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Alert className="mb-4">
                                    <Briefcase className="h-4 w-4" />
                                    <AlertTitle>Job Board Integration</AlertTitle>
                                    <AlertDescription>
                                        The "Post via AI" button simulates posting to Indeed. In a production app, this could be configured to connect to your preferred job board API (e.g., Indeed, Workable, LinkedIn).
                                    </AlertDescription>
                                </Alert>
                                {hiringRequests.length > 0 ? (
                                    <div className="space-y-4">
                                        {hiringRequests.map(req => (
                                            <div key={req.id} className="flex flex-col sm:flex-row items-start justify-between rounded-lg border p-4 gap-4">
                                                <div className="space-y-2 flex-grow">
                                                    <div>
                                                        <p className="font-semibold">{req.role} <span className="font-normal text-muted-foreground">at {req.location}</span></p>
                                                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-1">
                                                            <span><Badge variant="outline">{req.shiftType}</Badge></span>
                                                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Urgency: {req.urgency}</span>
                                                            <span className="flex items-center gap-1"><UserCog className="h-3 w-3" /> From: {req.manager}</span>
                                                        </div>
                                                    </div>
                                                    <blockquote className="text-sm text-muted-foreground italic border-l-2 pl-3 mt-2">
                                                        "{req.justification}"
                                                    </blockquote>
                                                </div>
                                                <div className="flex gap-2 self-end sm:self-center shrink-0">
                                                    <Button size="sm" onClick={() => handleApproveRequest(req)}><CheckCircle className="mr-2 h-4 w-4" /> Approve & Post via AI</Button>
                                                    <Button size="sm" variant="outline" onClick={() => handleManualPost(req.id)}><ThumbsUp className="mr-2 h-4 w-4" /> Manually Posted</Button>
                                                    <Button size="sm" variant="destructive" onClick={() => handleOpenRejectDialog(req)}><XCircle className="mr-2 h-4 w-4" /> Reject</Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                     <div className="text-center text-sm text-muted-foreground p-8">No pending hiring requests.</div>
                                )}
                            </CardContent>
                        </Card>
                    </TooltipTrigger>
                    <TooltipContent><p>Approve or reject hiring requests submitted by your managers.</p></TooltipContent>
                 </Tooltip>


                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><CalendarClock /> Schedule Internal Meeting</CardTitle>
                        <CardDescription>Prototype for Google Calendar integration. Schedule a meeting and a simulated invite will be sent.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <form onSubmit={handleScheduleMeeting} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="meeting-title">Meeting Title</Label>
                                <Input id="meeting-title" placeholder="Q3 Planning Session" value={meetingDetails.title} onChange={(e) => setMeetingDetails({...meetingDetails, title: e.target.value})} required/>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="grid gap-2">
                                    <Label>Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn("justify-start text-left font-normal", !meetingDetails.date && "text-muted-foreground")}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {meetingDetails.date ? format(meetingDetails.date, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={meetingDetails.date}
                                                onSelect={(date) => setMeetingDetails({...meetingDetails, date: date || new Date()})}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="meeting-time">Time</Label>
                                    <Input id="meeting-time" type="time" value={meetingDetails.time} onChange={(e) => setMeetingDetails({...meetingDetails, time: e.target.value})} required/>
                                </div>
                                 <div className="grid gap-2">
                                    <Label htmlFor="meeting-attendee">Attendee</Label>
                                    <Select value={meetingDetails.attendee} onValueChange={(val) => setMeetingDetails({...meetingDetails, attendee: val})} required>
                                        <SelectTrigger id="meeting-attendee">
                                            <SelectValue placeholder="Select team member" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {teamMembers.map(member => (
                                                <SelectItem key={member.name} value={member.name}>{member.name} ({member.role})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="meeting-description">Description / Agenda (Optional)</Label>
                                <Textarea id="meeting-description" placeholder="Discuss Q3 goals, review new health protocols..." value={meetingDetails.description} onChange={(e) => setMeetingDetails({...meetingDetails, description: e.target.value})} />
                            </div>
                            <Button type="submit">Schedule Meeting</Button>
                         </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><ListTodo/> Upcoming Meetings</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Date & Time</TableHead>
                                    <TableHead>Attendee</TableHead>
                                    <TableHead className="text-right">Meeting Link</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {meetings.length > 0 ? (
                                    meetings.sort((a,b) => a.date.getTime() - b.date.getTime()).map((meeting) => (
                                    <TableRow key={meeting.id}>
                                        <TableCell className="font-medium">{meeting.title}</TableCell>
                                        <TableCell>{format(meeting.date, 'PPP')} at {meeting.time}</TableCell>
                                        <TableCell>{meeting.attendee}</TableCell>
                                        <TableCell className="text-right">
                                            {meeting.meetLink && (
                                                <Button variant="ghost" size="icon" asChild>
                                                    <a href={meeting.meetLink} target="_blank" rel="noopener noreferrer">
                                                        <LinkIcon className="h-4 w-4" />
                                                        <span className="sr-only">Open meeting link</span>
                                                    </a>
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24">
                                        No meetings scheduled yet.
                                    </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                 
                 <Tooltip>
                     <TooltipTrigger asChild>
                         <Card>
                            <CardHeader className="flex flex-row items-start justify-between">
                                <div>
                                    <CardTitle className="font-headline flex items-center gap-2"><MapPin/> My Locations</CardTitle>
                                    <CardDescription>Manage your business locations and share access with health inspectors.</CardDescription>
                                </div>
                                <Dialog open={isAddLocationDialogOpen} onOpenChange={setIsAddLocationDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline"><PlusCircle className="mr-2 h-4 w-4"/> Add New Location</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle className="font-headline">Add a New Location</DialogTitle>
                                            <DialogDescription>
                                                Configure a new location and invite its manager.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleAddLocation} className="space-y-4 py-4">
                                             <div className="space-y-2">
                                                <Label htmlFor="add-location-name">Location Name</Label>
                                                <Input id="add-location-name" placeholder="e.g., Uptown Smoothies" value={newLocationData.name} onChange={e => setNewLocationData({...newLocationData, name: e.target.value})} required />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="add-toast-key">Toast POS API Key (Optional)</Label>
                                                <Input id="add-toast-key" placeholder="Enter API key" value={newLocationData.toastKey} onChange={e => setNewLocationData({...newLocationData, toastKey: e.target.value})} />
                                            </div>
                                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="add-manager-name">Manager's Full Name</Label>
                                                    <Input id="add-manager-name" placeholder="Casey Lee" value={newLocationData.managerName} onChange={e => setNewLocationData({...newLocationData, managerName: e.target.value})} required />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="add-manager-email">Manager's Email (for Invite)</Label>
                                                    <Input id="add-manager-email" type="email" placeholder="casey@example.com" value={newLocationData.managerEmail} onChange={e => setNewLocationData({...newLocationData, managerEmail: e.target.value})} required/>
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button type="button" variant="secondary" onClick={() => setIsAddLocationDialogOpen(false)}>Cancel</Button>
                                                <Button type="submit">Save Location</Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2">
                                {locations.map(loc => (
                                    <div key={loc.id} className="flex items-center justify-between rounded-lg border p-4">
                                        <div>
                                            <p className="font-semibold">{loc.name}</p>
                                            <p className="text-sm text-muted-foreground">Manager: {loc.manager}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-right">
                                                <p className="text-xs text-muted-foreground">Inspection Code</p>
                                                <p className="font-mono text-sm font-semibold bg-muted px-2 py-1 rounded-md">{loc.inspectionCode}</p>
                                            </div>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenShareDialog(loc)}>
                                                        <Share2 className="h-4 w-4" />
                                                        <span className="sr-only">Share Code</span>
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Share Code via Email</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                     </TooltipTrigger>
                     <TooltipContent><p>Manage your business locations and share access codes with inspectors.</p></TooltipContent>
                 </Tooltip>


                <div className="grid gap-6 lg:grid-cols-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="font-headline flex items-center gap-2 text-accent"><Megaphone /> Crucial Alerts</CardTitle>
                                    <CardDescription>High-priority issues from all locations that require immediate owner-level attention.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {crucialAlerts.map(alert => (
                                        <Alert key={alert.id} variant="destructive" className="bg-accent/10 border-accent/50">
                                            <AlertTriangle className="h-4 w-4 !text-accent" />
                                            <AlertTitle className="font-bold flex justify-between items-center">
                                                <span>{alert.location}</span>
                                                {alert.type === 'overtime' ? (
                                                    <Button size="sm" variant="secondary" onClick={() => setContactManagerOpen(true)}>
                                                        <MessageSquare className="mr-2 h-4 w-4"/>
                                                        Contact Manager
                                                    </Button>
                                                ) : (
                                                    <Button size="sm" variant="secondary" onClick={() => handleSuggestAssignment(alert.description, alert.location)}>
                                                        <Sparkles className="mr-2 h-4 w-4"/>
                                                        AI Assign
                                                    </Button>
                                                )}
                                            </AlertTitle>
                                            <AlertDescription>
                                                {alert.description}
                                            </AlertDescription>
                                        </Alert>
                                    ))}
                                </CardContent>
                            </Card>
                        </TooltipTrigger>
                        <TooltipContent><p>A feed of high-priority issues that require your immediate attention.</p></TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Card>
                                 <CardHeader>
                                    <CardTitle className="font-headline flex items-center gap-2"><ClipboardPen /> Owner's Memo Board</CardTitle>
                                    <CardDescription>Your private notepad for reminders and high-level strategy.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Textarea 
                                        value={memo}
                                        onChange={(e) => setMemo(e.target.value)}
                                        placeholder="Jot down your notes here..."
                                        rows={5}
                                        className="resize-none"
                                    />
                                </CardContent>
                            </Card>
                        </TooltipTrigger>
                        <TooltipContent><p>Your private notepad for reminders and high-level strategy.</p></TooltipContent>
                    </Tooltip>
                </div>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline flex items-center gap-2"><ShieldAlert /> Mandatory Health Dept. Tasks</CardTitle>
                                <CardDescription>Review, complete, and submit required tasks from the Health Department.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Accordion type="single" collapsible className="w-full">
                                    {healthDeptTasks.map(task => (
                                        <AccordionItem value={`task-${task.id}`} key={task.id}>
                                            <AccordionTrigger className="hover:no-underline text-left">
                                                <div className="flex w-full items-center justify-between pr-4 gap-4">
                                                    <div className='text-left'>
                                                        <p className="font-semibold">{task.description}</p>
                                                        <p className="text-xs text-muted-foreground">Source: {task.source}</p>
                                                    </div>
                                                    <Badge variant={task.status === 'Submitted' ? 'default' : task.status === 'Pending' ? 'destructive' : 'secondary'} className='whitespace-nowrap shrink-0'>
                                                        {task.status === 'PendingOwnerApproval' ? 'Pending Your Approval' : task.status}
                                                    </Badge>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className='p-4 bg-muted/50 rounded-md m-1 space-y-4'>
                                                    {task.status === 'Pending' && (
                                                        <div className='flex flex-col sm:flex-row gap-2'>
                                                             <Button onClick={() => handleOpenDelegateDialog(task)}>
                                                                <Briefcase className="mr-2 h-4 w-4" />
                                                                Delegate to Manager
                                                            </Button>
                                                        </div>
                                                    )}
                                                    {task.status === 'Delegated' && (
                                                        <p className='text-sm text-muted-foreground italic'>This task has been delegated to {task.delegatedTo} and is pending their action.</p>
                                                    )}
                                                     {task.status === 'PendingOwnerApproval' && (
                                                        <div className='flex items-center gap-4'>
                                                             <p className='text-sm text-muted-foreground'>Manager {task.delegatedTo} has submitted proof for your review.</p>
                                                            <Button onClick={() => handleOpenReviewDialog(task)}>
                                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                                Review & Approve
                                                            </Button>
                                                        </div>
                                                    )}
                                                    {task.status === 'Submitted' && (
                                                        <p className='text-sm text-muted-foreground italic'>This task has already been submitted.</p>
                                                    )}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </CardContent>
                        </Card>
                    </TooltipTrigger>
                    <TooltipContent><p>Review and delegate mandatory tasks from the health department.</p></TooltipContent>
                </Tooltip>
                
                {/* AI Assignment Dialog */}
                <Dialog open={!!selectedAlert} onOpenChange={(open) => !open && closeAssignmentDialog()}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="font-headline flex items-center gap-2"><Sparkles className="text-primary"/> AI Assignment Suggestion</DialogTitle>
                            <DialogDescription>
                                For the issue: "{selectedAlert}"
                            </DialogDescription>
                        </DialogHeader>
                            {!assignmentResult && isAssigning ? (
                                <div className="flex items-center justify-center p-8 space-x-2">
                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                    <p className="text-muted-foreground">AI is thinking...</p>
                                </div>
                            ) : assignmentResult ? (
                                <div className="py-4 space-y-4">
                                     <Alert>
                                        <UserCog className="h-4 w-4"/>
                                        <AlertTitle>Suggested Assignee: {assignmentResult.suggestedAssignee}</AlertTitle>
                                    </Alert>
                                    <Alert variant="default" className="bg-primary/5 border-primary/20">
                                        <Lightbulb className="h-4 w-4 !text-primary"/>
                                        <AlertTitle className="text-primary">Reasoning</AlertTitle>
                                        <AlertDescription>
                                            {assignmentResult.reasoning}
                                        </AlertDescription>
                                    </Alert>
                                </div>
                            ) : null}
                        <DialogFooter>
                            <Button variant="secondary" onClick={closeAssignmentDialog}>Close</Button>
                            <Button disabled={!assignmentResult}>Assign & Notify (Simulated)</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delegate Task Dialog */}
                <Dialog open={isDelegateDialogOpen} onOpenChange={setDelegateDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className='font-headline'>Delegate Task</DialogTitle>
                            <DialogDescription>Assign this mandatory task to a manager to complete.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Task</Label>
                                <p className='text-sm text-muted-foreground border p-2 rounded-md bg-muted/50'>{selectedTask?.description}</p>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="manager-select">Assign to Manager</Label>
                                <Select onValueChange={setSelectedManager}>
                                    <SelectTrigger id="manager-select">
                                        <SelectValue placeholder="Select a manager" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {managers.map(m => <SelectItem key={m.name} value={m.name}>{m.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="secondary" onClick={() => setDelegateDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleDelegateTask} disabled={!selectedManager}>Delegate Task</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Review Submission Dialog */}
                 <Dialog open={isReviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className='font-headline'>Review Manager's Submission</DialogTitle>
                            <DialogDescription>Review the attached proof for "{selectedTask?.description}" before submitting to the health department.</DialogDescription>
                        </DialogHeader>
                        <div className='py-4'>
                            <PhotoUploader readOnly initialPreview={selectedTask?.attachment} />
                        </div>
                        <DialogFooter>
                            <Button variant="secondary" onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
                            <Button variant="destructive" onClick={handleRejectSubmission}>
                                <XCircle className="mr-2 h-4 w-4"/> Reject & Request Resubmission
                            </Button>
                            <Button onClick={handleApproveAndSubmit}>
                                <CheckCircle className="mr-2 h-4 w-4"/> Approve & Submit
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                 {/* Contact Manager Dialog */}
                 <Dialog open={isContactManagerOpen} onOpenChange={setContactManagerOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className='font-headline'>Contact Manager about Overtime</DialogTitle>
                            <DialogDescription>Send a message to the responsible manager. AI can help draft a professional message.</DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-2">
                            <Label htmlFor="message">Your Message</Label>
                             <Textarea
                                id="message"
                                placeholder="e.g., I see the new schedule has two employees in overtime. Can we explore alternatives to manage costs?"
                                rows={4}
                            />
                            <p className="text-xs text-muted-foreground">
                                <span className='font-bold'>AI Tip:</span> You could ask the AI to "draft a polite but firm email to a manager about avoiding unnecessary overtime."
                            </p>
                        </div>
                        <DialogFooter>
                            <Button variant="secondary" onClick={() => setContactManagerOpen(false)}>Cancel</Button>
                            <Button onClick={handleSendMessage}>Send Message (Simulated)</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                
                {/* Share Code Dialog */}
                <Dialog open={isShareCodeDialogOpen} onOpenChange={setShareCodeDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className='font-headline'>Share Code with Health Inspector</DialogTitle>
                            <DialogDescription>
                                Enter the inspector's email address to send them the inspection code for "{locationToShare?.name}".
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSendCode}>
                            <div className="py-4 space-y-2">
                                <Label htmlFor="inspector-email">Inspector's Email</Label>
                                <Input
                                    id="inspector-email"
                                    type="email"
                                    placeholder="inspector@example.gov"
                                    value={inspectorEmail}
                                    onChange={(e) => setInspectorEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <DialogFooter>
                                <Button variant="secondary" type="button" onClick={() => setShareCodeDialogOpen(false)}>Cancel</Button>
                                <Button type="submit">Send Code</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* AI Briefing Dialog */}
                <Dialog open={isBriefingDialogOpen} onOpenChange={setIsBriefingDialogOpen}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="font-headline flex items-center gap-2">
                                <Sparkles className="text-primary h-5 w-5" />
                                AI Daily Briefing Suggestion
                            </DialogTitle>
                            <DialogDescription>
                                Here's a suggested daily briefing to share with your team. You can edit it, post it to their dashboard, or dismiss it.
                            </DialogDescription>
                        </DialogHeader>
                        {isGeneratingBriefing ? (
                            <div className="flex items-center justify-center p-8 space-x-2">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                <p className="text-muted-foreground">AI is preparing your daily briefing...</p>
                            </div>
                        ) : dailyBriefing ? (
                            <div className="py-4 space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="briefing-title">Title</Label>
                                    <Input id="briefing-title" value={dailyBriefing.title} onChange={(e) => setDailyBriefing(prev => prev ? {...prev, title: e.target.value} : null)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="briefing-message">Message</Label>
                                    <Textarea id="briefing-message" value={dailyBriefing.message} onChange={(e) => setDailyBriefing(prev => prev ? {...prev, message: e.target.value} : null)} rows={4} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="briefing-tasks">Focus Tasks (one per line)</Label>
                                    <Textarea id="briefing-tasks" value={dailyBriefing.suggestedTasks.join('\n')} onChange={(e) => setDailyBriefing(prev => prev ? {...prev, suggestedTasks: e.target.value.split('\n').filter(task => task.trim() !== '')} : null)} rows={3} />
                                </div>
                            </div>
                        ) : (
                            <p className="text-destructive text-center py-8">Could not load a briefing.</p>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsBriefingDialogOpen(false)}>Dismiss</Button>
                            <Button onClick={handlePostBriefing} disabled={isGeneratingBriefing || !dailyBriefing}>
                                Post to Employee Dashboard
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <AlertDialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Reject Hiring Request</AlertDialogTitle>
                            <AlertDialogDescription>
                                Please provide a reason for rejecting this request. This will be shared with the manager.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="py-4">
                             <Textarea
                                placeholder="e.g., Let's hold off on this for now. Please call me to discuss an alternative solution."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                rows={4}
                            />
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setRejectionReason('')}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleConfirmRejection}>Confirm Rejection</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

            </div>
        </TooltipProvider>
    );
}
