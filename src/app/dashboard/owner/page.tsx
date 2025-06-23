
"use client";

import { useState, useEffect, type FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { DollarSign, ShieldCheck, TrendingUp, AlertTriangle, CheckCircle, XCircle, MapPin, UserCog, Megaphone, ClipboardPen, ShieldAlert, Sparkles, Loader2, Lightbulb, MessageSquare, Briefcase, Share2, Rss, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';
import { suggestTaskAssignment, type SuggestTaskAssignmentOutput } from '@/ai/flows/suggest-task-assignment-flow';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import PhotoUploader from '@/components/photo-uploader';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { fetchToastData, type ToastPOSData } from '@/ai/flows/fetch-toast-data-flow';
import LiveReviews from '@/components/live-reviews';
import { DialogTrigger } from '@/components/ui/dialog';

type TeamMember = { name: string; role: "Manager" | "Employee"; location: string };
type Location = { id: number; name: string; manager: string; inspectionCode: string; toastApiKey?: string; };
type HealthTaskStatus = 'Pending' | 'Delegated' | 'PendingOwnerApproval' | 'Submitted';
type HealthTask = { id: number; description: string; source: string; status: HealthTaskStatus; delegatedTo?: string; attachment?: { url: string; name: string; }; };

const initialHealthDeptTasks: HealthTask[] = [
    { id: 1, description: "Verify all employee food handler certifications are up to date.", source: "City Health Inspector", status: "Pending" },
    { id: 4, description: "Quarterly pest control inspection report.", source: "City Ordinance 23B", status: "Submitted" },
];

export default function OwnerDashboard() {
    const { toast } = useToast();
    
    // --- STATE MANAGEMENT ---
    const [locations, setLocations] = useState<Location[]>([]);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [requests, setRequests] = useState<any[]>([]);
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

    // Onboarding Form State
    const [newLocationName, setNewLocationName] = useState('');
    const [newToastKey, setNewToastKey] = useState('');
    const [newManagerName, setNewManagerName] = useState('');
    const [newManagerEmail, setNewManagerEmail] = useState('');
    
    // Data fetching state
    const [toastData, setToastData] = useState<ToastPOSData | null>(null);
    const [isFetchingToast, setIsFetchingToast] = useState(false);

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

    const handleRequest = (requestId: number, approved: boolean) => {
        const request = requests.find(r => r.id === requestId);
        if (!request) return;

        setRequests(requests.filter(r => r.id !== requestId));
        toast({
            title: `Request ${approved ? 'Approved' : 'Rejected'}`,
            description: `The "${request.description}" request has been ${approved ? 'approved' : 'rejected'}.`,
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


    return (
        <TooltipProvider>
            <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Location Revenue (from Toast)
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                             {isFetchingToast ? <Loader2 className="h-6 w-6 animate-spin"/> : toastData ? (
                                <>
                                    <div className="text-2xl font-bold">${toastData.totalRevenue.toLocaleString()}</div>
                                    <p className="text-xs text-muted-foreground">
                                        +{toastData.changeFromLastMonth}% from last month
                                    </p>
                                </>
                             ) : <p className="text-sm text-muted-foreground">No POS data.</p>
                            }
                        </CardContent>
                    </Card>
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
                </div>

                <LiveReviews location={locations[0]?.name} />
                 
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


                <div className="grid gap-6 lg:grid-cols-2">
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
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><AlertTriangle className="text-accent"/> Pending Manager Approvals</CardTitle>
                        <CardDescription>
                            Review and approve or reject requests from your team managers.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {requests.length > 0 ? (
                            requests.map((request) => (
                                <Tooltip key={request.id}>
                                    <TooltipTrigger asChild>
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors cursor-default">
                                            <div className="mb-4 sm:mb-0">
                                                <div className="flex items-center gap-3">
                                                    <Badge variant={request.type === 'Overtime' ? 'secondary' : 'default'}>{request.type}</Badge>
                                                    <p className="font-semibold">{request.description}</p>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1 pl-1">{request.details}</p>
                                            </div>
                                            <div className="flex gap-2 self-end sm:self-center">
                                                <Button size="sm" onClick={() => handleRequest(request.id, true)}>
                                                    <CheckCircle className="mr-2 h-4 w-4"/> Approve
                                                </Button>
                                                <Button size="sm" variant="destructive" onClick={() => handleRequest(request.id, false)}>
                                                    <XCircle className="mr-2 h-4 w-4"/> Reject
                                                </Button>
                                            </div>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <div className="grid gap-2 text-sm">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-semibold">Location:</span>
                                                <span>{request.location}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <UserCog className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-semibold">Manager:</span>
                                                <span>{request.manager}</span>
                                            </div>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">No pending approvals.</p>
                        )}
                    </CardContent>
                </Card>

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

                {/* AI Assignment Dialog */}
                <Dialog open={isAssigning} onOpenChange={(open) => !open && closeAssignmentDialog()}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="font-headline flex items-center gap-2"><Sparkles className="text-primary"/> AI Assignment Suggestion</DialogTitle>
                            <DialogDescription>
                                For the issue: "{selectedAlert}"
                            </DialogDescription>
                        </DialogHeader>
                            {!assignmentResult ? (
                                <div className="flex items-center justify-center p-8 space-x-2">
                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                    <p className="text-muted-foreground">AI is thinking...</p>
                                </div>
                            ) : (
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
                            )}
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
            </div>
        </TooltipProvider>
    );
}

    