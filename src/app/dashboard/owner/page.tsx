
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DollarSign, ShieldCheck, TrendingUp, AlertTriangle, CheckCircle, XCircle, MapPin, UserCog, Megaphone, ClipboardPen, ShieldAlert, Sparkles, Loader2, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';
import { suggestTaskAssignment, type SuggestTaskAssignmentOutput } from '@/ai/flows/suggest-task-assignment-flow';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import PhotoUploader from '@/components/photo-uploader';
import { Label } from '@/components/ui/label';

// --- MOCK DATA ---
const teamMembers = [
  { name: "Alex Ray", role: "Manager" as const },
  { name: "Casey Lee", role: "Manager" as const },
  { name: "John Doe", role: "Employee" as const },
  { name: "Jane Smith", role: "Employee" as const },
];

const crucialAlerts = [
    { id: 1, location: "Downtown Cafe", description: "Main freezer unit is offline. Temperature rising rapidly." },
    { id: 2, location: "Uptown Bistro", description: "Guest reported seeing a rodent in the main dining area." },
    { id: 3, location: "Downtown Cafe", description: "POS system is down. Cannot process credit card payments." },
];

const initialHealthDeptTasks = [
    { id: 1, description: "Verify all employee food handler certifications are up to date.", source: "City Health Inspector", status: "Pending" as const },
    { id: 2, description: "Monthly deep clean and sanitization of all ice machines.", source: "State Regulation 5.11a", status: "Pending" as const },
    { id: 3, description: "Quarterly pest control inspection report.", source: "City Ordinance 23B", status: "Submitted" as const },
];

const initialRequests = [
  { id: 1, type: "Shift Change", description: "Manager proposed 45 shifts for the upcoming week.", details: "Mon-Fri, 9am-5pm", manager: "Alex Ray", location: "Downtown Cafe" },
  { id: 2, type: "Overtime", description: "John Doe requested 2 hours of overtime.", details: "Reason: Deep clean kitchen after busy weekend.", manager: "Alex Ray", location: "Downtown Cafe" },
  { id: 3, type: "Overtime", description: "Sam Smith requested 3 hours of overtime.", details: "Reason: Cover for sick colleague.", manager: "Casey Lee", location: "Uptown Bistro" },
];
// --- END MOCK DATA ---

export default function OwnerDashboard() {
    const { toast } = useToast();
    const [requests, setRequests] = useState(initialRequests);
    const [memo, setMemo] = useState("Finalize Q3 budget by Friday. Follow up with vendor about new coffee machine.");
    const [healthDeptTasks, setHealthDeptTasks] = useState(initialHealthDeptTasks);
    
    const [isAssigning, setIsAssigning] = useState(false);
    const [assignmentResult, setAssignmentResult] = useState<SuggestTaskAssignmentOutput | null>(null);
    const [selectedAlert, setSelectedAlert] = useState<string | null>(null);

    const handleRequest = (requestId: number, approved: boolean) => {
        const request = requests.find(r => r.id === requestId);
        if (!request) return;

        setRequests(requests.filter(r => r.id !== requestId));
        toast({
            title: `Request ${approved ? 'Approved' : 'Rejected'}`,
            description: `The "${request.description}" request has been ${approved ? 'approved' : 'rejected'}.`,
        });
    };

    const handleSuggestAssignment = async (issueDescription: string) => {
        setSelectedAlert(issueDescription);
        setAssignmentResult(null);
        setIsAssigning(true);
        try {
            const result = await suggestTaskAssignment({ issueDescription, teamMembers });
            setAssignmentResult(result);
        } catch (error) {
            console.error("Failed to get assignment suggestion:", error);
            toast({
                variant: 'destructive',
                title: 'AI Error',
                description: 'Could not generate an assignment suggestion.',
            });
            setIsAssigning(false); // Close dialog on error
        }
        // Keep dialog open on success, setIsLoading(false) is in the Dialog onOpenChange
    };

    const closeAssignmentDialog = () => {
        setIsAssigning(false);
        setAssignmentResult(null);
        setSelectedAlert(null);
    }
    
    const handleSubmitToHealthDept = (taskId: number) => {
        setHealthDeptTasks(tasks => tasks.map(task => 
            task.id === taskId ? { ...task, status: 'Submitted' } : task
        ));
        toast({
            title: "Submission Sent (Simulated)",
            description: "The compliance document has been submitted to the health department.",
        });
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
                                        <Button size="sm" variant="secondary" onClick={() => handleSuggestAssignment(alert.description)}>
                                            <Sparkles className="mr-2 h-4 w-4"/>
                                            AI Assign
                                        </Button>
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
                                rows={8}
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
                                        <div className="flex w-full items-center justify-between pr-4">
                                            <div className='text-left'>
                                                <p className="font-semibold">{task.description}</p>
                                                <p className="text-xs text-muted-foreground">Source: {task.source}</p>
                                            </div>
                                            <Badge variant={task.status === 'Submitted' ? 'default' : 'destructive'} className='whitespace-nowrap'>
                                                {task.status}
                                            </Badge>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className='p-4 bg-muted/50 rounded-md m-1 space-y-4'>
                                            {task.status === 'Pending' ? (
                                                <>
                                                    <div>
                                                        <Label className='text-xs text-muted-foreground'>Attach Proof of Completion</Label>
                                                        <div className='mt-2'>
                                                            <PhotoUploader />
                                                        </div>
                                                    </div>
                                                    <Button onClick={() => handleSubmitToHealthDept(task.id)}>
                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                        Submit to Health Dept. (Simulated)
                                                    </Button>
                                                </>
                                            ) : (
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

            </div>
        </TooltipProvider>
    );
}
