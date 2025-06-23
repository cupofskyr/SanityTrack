
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { DollarSign, ShieldCheck, TrendingUp, AlertTriangle, CheckCircle, XCircle, MapPin, UserCog, Megaphone, ClipboardPen, ShieldAlert, Sparkles, Loader2, Lightbulb, MessageSquare, Briefcase, Link as LinkIcon, Share2 } from 'lucide-react';
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

// --- MOCK DATA ---
const teamMembers = [
  { name: "Alex Ray", role: "Manager" as const, location: "Downtown Cafe" },
  { name: "Casey Lee", role: "Manager" as const, location: "Uptown Bistro" },
  { name: "John Doe", role: "Employee" as const, location: "Downtown Cafe" },
  { name: "Jane Smith", role: "Employee" as const, location: "Uptown Bistro" },
];
const managers = teamMembers.filter(m => m.role === 'Manager');

const crucialAlerts = [
    { id: 1, location: "Downtown Cafe", description: "Main freezer unit is offline. Temperature rising rapidly." },
    { id: 2, location: "Uptown Bistro", description: "Guest reported seeing a rodent in the main dining area." },
    { id: 3, location: "Downtown Cafe", description: "POS system is down. Cannot process credit card payments." },
    { id: 4, location: "Uptown Bistro", description: "Proposed weekly schedule has 2 employees in overtime.", type: 'overtime' },
];

type HealthTaskStatus = 'Pending' | 'Delegated' | 'PendingOwnerApproval' | 'Submitted';
type HealthTask = {
    id: number;
    description: string;
    source: string;
    status: HealthTaskStatus;
    delegatedTo?: string;
    attachment?: { url: string; name: string; };
};

const initialHealthDeptTasks: HealthTask[] = [
    { id: 1, description: "Verify all employee food handler certifications are up to date.", source: "City Health Inspector", status: "Pending" },
    { id: 2, description: "Monthly deep clean and sanitization of all ice machines.", source: "State Regulation 5.11a", status: "Delegated", delegatedTo: 'Casey Lee' },
    { id: 3, description: "Quarterly pest control inspection report.", source: "City Ordinance 23B", status: "Submitted" },
];

const initialRequests = [
  { id: 1, type: "Shift Change", description: "Manager proposed 45 shifts for the upcoming week.", details: "Mon-Fri, 9am-5pm", manager: "Alex Ray", location: "Downtown Cafe" },
  { id: 2, type: "Overtime", description: "John Doe requested 2 hours of overtime.", details: "Reason: Deep clean kitchen after busy weekend.", manager: "Alex Ray", location: "Downtown Cafe" },
  { id: 3, type: "Overtime", description: "Sam Smith requested 3 hours of overtime.", details: "Reason: Cover for sick colleague.", manager: "Casey Lee", location: "Uptown Bistro" },
];

const overtimeWatchlist = [
  { id: 1, name: "John Doe", location: "Downtown Cafe", hours: 38, limit: 40 },
  { id: 2, name: "Jane Smith", location: "Uptown Bistro", hours: 39, limit: 40 },
  { id: 3, name: "Casey Lee", location: "Uptown Bistro", hours: 35, limit: 40 },
];

const locations = [
    { id: 1, name: "Downtown Cafe", manager: "Alex Ray", inspectionCode: "DC-1A3B" },
    { id: 2, name: "Uptown Bistro", manager: "Casey Lee", inspectionCode: "UB-9Z8Y" }
];
// --- END MOCK DATA ---

export default function OwnerDashboard() {
    const { toast } = useToast();
    const [requests, setRequests] = useState(initialRequests);
    const [memo, setMemo] = useState("Finalize Q3 budget by Friday. Follow up with vendor about new coffee machine.");
    const [healthDeptTasks, setHealthDeptTasks] = useState<HealthTask[]>(initialHealthDeptTasks);
    
    const [isAssigning, setIsAssigning] = useState(false);
    const [assignmentResult, setAssignmentResult] = useState<SuggestTaskAssignmentOutput | null>(null);
    const [selectedAlert, setSelectedAlert] = useState<string | null>(null);

    const [isDelegateDialogOpen, setDelegateDialogOpen] = useState(false);
    const [isReviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [isContactManagerOpen, setContactManagerOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<HealthTask | null>(null);
    const [selectedManager, setSelectedManager] = useState('');
    
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

    const handleSendMessage = () => {
        toast({
            title: "Message Sent (Simulated)",
            description: "Your message has been sent to the manager."
        });
        setContactManagerOpen(false);
    };

    return (
        <TooltipProvider>
            <div className="space-y-6">
                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Company-Wide Revenue
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">$125,430.89</div>
                            <p className="text-xs text-muted-foreground">
                                +18.3% from last month
                            </p>
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
                 
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><MapPin/> My Locations</CardTitle>
                        <CardDescription>Provide the inspection code to a Health Dept. agent to grant them access.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        {locations.map(loc => (
                            <div key={loc.id} className="flex items-center justify-between rounded-lg border p-4">
                                <div>
                                    <p className="font-semibold">{loc.name}</p>
                                    <p className="text-sm text-muted-foreground">Manager: {loc.manager}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-muted-foreground">Inspection Code</p>
                                    <p className="font-mono text-sm font-semibold bg-muted px-2 py-1 rounded-md">{loc.inspectionCode}</p>
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
                            <CardTitle className="font-headline flex items-center gap-2"><TrendingUp /> Overtime Watchlist</CardTitle>
                            <CardDescription>
                                Employees approaching the weekly 40-hour overtime limit.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {overtimeWatchlist.map((employee) => (
                                <div key={employee.id}>
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="font-medium">{employee.name} <span className="text-xs text-muted-foreground">({employee.location})</span></p>
                                        <span className="text-sm text-muted-foreground">{employee.hours} / {employee.limit} hrs</span>
                                    </div>
                                    <Progress value={(employee.hours / employee.limit) * 100} className="h-2" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                    
                    <Card className="lg:col-span-2">
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
                            <Button variant="secondary" onClick={() => setReviewDialogOpen(false)}>Close</Button>
                            <Button onClick={handleApproveAndSubmit}>Approve & Submit</Button>
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
            </div>
        </TooltipProvider>
    );
}

