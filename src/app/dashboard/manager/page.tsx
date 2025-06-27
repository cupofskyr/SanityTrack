
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Users, AlertTriangle, Sparkles, Flag, Phone, Wrench, PlusCircle, ExternalLink, ListTodo, Zap, Loader2, ShieldAlert, CheckCircle, MessageSquare, Megaphone, CalendarClock, CalendarIcon, LinkIcon, UtensilsCrossed, UserPlus, Clock, Send, Languages, Printer, Info, XCircle, AlertCircle, MailWarning, HelpCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import PhotoUploader from '@/components/photo-uploader';
import StaffMealManager from '@/components/staff-meal-manager';
import { format, differenceInMinutes } from 'date-fns';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { analyzeIssueAction, generateDailyBriefingAction, translateTextAction, generateWarningLetterAction, explainTaskImportanceAction } from '@/app/actions';
import type { GenerateDailyBriefingOutput } from '@/ai/schemas/daily-briefing-schemas';
import type { GenerateWarningLetterOutput } from '@/ai/schemas/warning-letter-schemas';

const teamMembers = [
    { name: "John Doe", tasksCompleted: 8, tasksPending: 2, progress: 80 },
    { name: "Jane Smith", tasksCompleted: 5, tasksPending: 5, progress: 50 },
    { name: "Sam Wilson", tasksCompleted: 10, tasksPending: 0, progress: 100 },
];

const initialContacts = [
    { id: 1, name: "Joe's Plumbing", type: "Plumber", phone: "555-123-4567" },
    { id: 2, name: "Sparky Electric", type: "Electrician", phone: "555-987-6543" },
];

type Contact = { id: number; name: string; type: string; phone: string; };
type ManagedTask = { id: number; description: string; frequency: string; assignee: string; };
type HighPriorityIssue = { id: number; description: string; reportedBy: string; category: string; contactType: string; resolutionNotes?: string; };
type DelegatedTask = {
    id: number;
    description: string;
    source: string;
    status: 'Pending' | 'PendingOwnerApproval';
    attachmentUrl?: string;
};
type Meeting = {
    id: number;
    title: string;
    date: Date;
    time: string;
    attendee: string;
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
type RejectedRequest = HiringRequest & { ownerComment: string; };
type TimeClockLog = {
    id: number;
    employeeName: string;
    location: string;
    type: 'in' | 'out';
    timestamp: string;
    shiftStart?: string;
    shiftEnd?: string;
};


const issueAnalyzerSchema = z.object({
  description: z.string().min(10, "Please provide a detailed description."),
});

// Mock data for delegated tasks. In a real app, this would come from a database.
const initialDelegatedTasks: DelegatedTask[] = [
    { id: 2, description: "Monthly deep clean and sanitization of all ice machines.", source: "State Regulation 5.11a", status: 'Pending' },
    { id: 3, description: "Clear blockage from back storage area hand-washing sink.", source: "Health Inspector Report (2024-07-01)", status: 'Pending' },

];

const staffMealLogs = [
    { id: 1, employee: "John Doe", date: "2024-07-26", items: "Turkey Sandwich, Apple", itemsCount: 2 },
    { id: 2, employee: "Jane Smith", date: "2024-07-26", items: "Chicken Salad", itemsCount: 1 },
    { id: 3, employee: "John Doe", date: "2024-07-25", items: "Smoothie, Protein Bar", itemsCount: 2 },
    { id: 4, employee: "Sam Wilson", date: "2024-07-25", items: "Leftover Pizza", itemsCount: 1 },
];

export default function ManagerDashboard() {
    const { toast } = useToast();
    const [contacts, setContacts] = useState<Contact[]>(initialContacts);
    const [isAddContactOpen, setIsAddContactOpen] = useState(false);
    const [newContact, setNewContact] = useState({ name: '', type: '', phone: '' });

    const [managedTasks, setManagedTasks] = useState<ManagedTask[]>([
        { id: 1, description: "Weekly stock inventory", frequency: "Weekly", assignee: "Jane Smith" },
        { id: 2, description: "Monthly deep clean of walk-in freezer", frequency: "Monthly", assignee: "Sam Wilson" },
    ]);
    const [taskDescription, setTaskDescription] = useState('');
    const [taskFrequency, setTaskFrequency] = useState('');
    const [taskAssignee, setTaskAssignee] = useState('');

    const [highPriorityIssues, setHighPriorityIssues] = useState<HighPriorityIssue[]>([
        { id: 1, description: "Major leak in the kitchen storage area.", reportedBy: "Jane Smith", category: "Plumbing", contactType: "Plumber" },
        { id: 2, description: "Freezer unit temperature is above safety limits.", reportedBy: "System Alert", category: "Electrical", contactType: "Electrician" },
    ]);
    
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const issueForm = useForm<z.infer<typeof issueAnalyzerSchema>>({
        resolver: zodResolver(issueAnalyzerSchema),
        defaultValues: { description: "" },
    });

    const [delegatedTasks, setDelegatedTasks] = useState<DelegatedTask[]>(initialDelegatedTasks);

    const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
    const [currentIssueForNotes, setCurrentIssueForNotes] = useState<HighPriorityIssue | null>(null);
    const [resolutionNotes, setResolutionNotes] = useState("");

    const [isBriefingDialogOpen, setIsBriefingDialogOpen] = useState(false);
    const [dailyBriefing, setDailyBriefing] = useState<GenerateDailyBriefingOutput | null>(null);
    const [isGeneratingBriefing, setIsGeneratingBriefing] = useState(true);

    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [meetingDetails, setMeetingDetails] = useState({ title: '', date: new Date(), time: '', attendee: '', description: '' });
    
    const [isMealInsightDialogOpen, setIsMealInsightDialogOpen] = useState(false);
    const [aiMealInsight, setAiMealInsight] = useState<{title: string, description: string, employeeName: string} | null>(null);

    const [newHireRequest, setNewHireRequest] = useState<{role: string; shiftType: 'Full-time' | 'Part-time' | 'Contract' | ''; urgency: string; justification: string;}>({ role: '', shiftType: '', urgency: '', justification: '' });

    const [translations, setTranslations] = useState<Record<number, string>>({});
    const [translatingId, setTranslatingId] = useState<number | null>(null);
    
    const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
    
    const [rejectedRequests, setRejectedRequests] = useState<RejectedRequest[]>([]);
    
    const [timeClockLogs, setTimeClockLogs] = useState<TimeClockLog[]>([]);

    const [isWarningDialogOpen, setIsWarningDialogOpen] = useState(false);
    const [warningContent, setWarningContent] = useState<GenerateWarningLetterOutput | null>(null);
    const [isGeneratingWarning, setIsGeneratingWarning] = useState(false);
    const [selectedLogForWarning, setSelectedLogForWarning] = useState<TimeClockLog | null>(null);

    const [isExplanationDialogOpen, setIsExplanationDialogOpen] = useState(false);
    const [explanation, setExplanation] = useState('');
    const [isGeneratingExplanation, setIsGeneratingExplanation] = useState(false);

    useEffect(() => {
        const storedRejected = localStorage.getItem('rejectedHiringRequests');
        if (storedRejected) {
            // A real app would filter these for the current manager
            setRejectedRequests(JSON.parse(storedRejected));
        }
        
        const logs = JSON.parse(localStorage.getItem('timeClockLogs') || '[]');
        setTimeClockLogs(logs.sort((a:TimeClockLog, b:TimeClockLog) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));

    }, []);


    useEffect(() => {
        const getBriefing = async () => {
            const today = format(new Date(), 'yyyy-MM-dd');
            const lastBriefingDate = localStorage.getItem('lastManagerBriefingShown');

            if (lastBriefingDate === today) {
                setIsGeneratingBriefing(false); // Ensure loading state is correct
                return; // Already shown today
            }

            setIsGeneratingBriefing(true);
            try {
                const {data, error} = await generateDailyBriefingAction();
                if (error || !data) {
                    throw new Error(error || 'Failed to generate briefing');
                }
                setDailyBriefing(data);
                setIsBriefingDialogOpen(true);
                localStorage.setItem('lastManagerBriefingShown', today); // Set that it was shown
            } catch (error) {
                console.error("Failed to generate daily briefing:", error);
                toast({
                    variant: "destructive",
                    title: "AI Daily Briefing Failed",
                    description: "Could not generate a daily message. You can proceed without it.",
                });
            } finally {
                setIsGeneratingBriefing(false);
            }
        };
        
        getBriefing();
    }, [toast]);

    useEffect(() => {
        const pendingIssue = localStorage.getItem('ai-issue-suggestion');
        if (pendingIssue) {
            issueForm.setValue('description', pendingIssue);
            localStorage.removeItem('ai-issue-suggestion');
            toast({
                title: "AI Suggestion Loaded",
                description: "The issue description from the AI Camera has been pre-filled for you."
            });
            document.getElementById('ai-issue-analyzer-card')?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [toast, issueForm]);

    const handlePostBriefing = () => {
        toast({
            title: "Briefing Posted!",
            description: "Your daily message is now visible to all employees."
        });
        setIsBriefingDialogOpen(false);
        // In a real app, this would save the briefing to a database.
    };

    const handleManagerSubmitForApproval = (taskId: number) => {
        setDelegatedTasks(tasks => tasks.map(task => 
            task.id === taskId 
            ? { ...task, status: 'PendingOwnerApproval', attachmentUrl: 'https://placehold.co/600x400.png' } 
            : task
        ));
        toast({
            title: "Submission Sent for Review",
            description: "Your completed task has been sent to the owner for final approval.",
        });
    };

    async function handleAnalyzeIssue(values: z.infer<typeof issueAnalyzerSchema>) {
        setIsAnalyzing(true);
        try {
            const {data, error} = await analyzeIssueAction({ description: values.description });
            if (error || !data) {
                 throw new Error(error || "Failed to analyze issue.");
            }

            toast({
                title: "AI Analysis Complete",
                description: `Category: ${data.category}, Emergency: ${data.isEmergency ? 'Yes' : 'No'}`
            });
            if (data.isEmergency) {
                const newIssue: HighPriorityIssue = {
                    id: Date.now(),
                    description: values.description,
                    reportedBy: 'AI Analyzer',
                    category: data.category,
                    contactType: data.suggestedContact
                };
                setHighPriorityIssues(prev => [newIssue, ...prev]);
                 toast({
                    variant: "destructive",
                    title: "🚨 Emergency Detected!",
                    description: "A new high-priority issue has been added to your list.",
                })
            }
            issueForm.reset();
        } catch (error) {
            toast({ variant: "destructive", title: "AI Error", description: "Failed to analyze issue."});
            console.error(error);
        } finally {
            setIsAnalyzing(false);
        }
    }


    const findContact = (type: string) => contacts.find(c => c.type === type);

    const handleAddContact = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newContact.name || !newContact.type || !newContact.phone) {
            toast({
                variant: "destructive",
                title: "Missing Information",
                description: "Please fill out all contact fields.",
            });
            return;
        }
        const newId = contacts.length > 0 ? Math.max(...contacts.map(c => c.id)) + 1 : 1;
        setContacts([...contacts, { ...newContact, id: newId }]);
        setNewContact({ name: '', type: '', phone: '' });
        setIsAddContactOpen(false);
        toast({
            title: "Contact Added",
            description: "The new service contact has been saved.",
        });
    };
    
    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!taskDescription || !taskFrequency || !taskAssignee) {
            toast({
                variant: "destructive",
                title: "Missing Information",
                description: "Please fill out all task fields.",
            });
            return;
        }
        const newTask: ManagedTask = {
            id: managedTasks.length > 0 ? Math.max(...managedTasks.map(t => t.id)) + 1 : 1,
            description: taskDescription,
            frequency: taskFrequency,
            assignee: taskAssignee,
        };
        setManagedTasks([newTask, ...managedTasks]);
        // Reset form
        setTaskDescription('');
        setTaskFrequency('');
        setTaskAssignee('');
        toast({
            title: "Task Created",
            description: `${taskDescription} has been assigned to ${taskAssignee}.`
        })
    };

    const handleOpenNotesDialog = (issue: HighPriorityIssue) => {
        setCurrentIssueForNotes(issue);
        setResolutionNotes(issue.resolutionNotes || "");
        setIsNotesDialogOpen(true);
    };

    const handleSaveNotes = () => {
        if (!currentIssueForNotes) return;
        setHighPriorityIssues(prev => prev.map(issue => 
            issue.id === currentIssueForNotes.id 
            ? { ...issue, resolutionNotes } 
            : issue
        ));
        toast({
            title: "Resolution Notes Saved",
            description: "The notes have been saved and are visible to the Health Department.",
        });
        setIsNotesDialogOpen(false);
        setCurrentIssueForNotes(null);
        setResolutionNotes("");
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

    const handleAiMealAnalysis = () => {
        // Simulate getting an insight for a specific employee
        setAiMealInsight({
            title: "AI Insight on John Doe's Meal Log",
            description: "John Doe has consistently taken the maximum number of items (2) this week. Consider a friendly reminder about the policy if this trend continues.",
            employeeName: "John Doe"
        });
        setIsMealInsightDialogOpen(true);
    };

    const handleSendMealInsight = () => {
        if (!aiMealInsight) return;
        // Use localStorage to simulate sending the message
        localStorage.setItem('employee-direct-message', JSON.stringify({
            title: "A note on your meal log",
            description: aiMealInsight.description
        }));
        toast({
            title: "Message Sent",
            description: `A message has been sent to ${aiMealInsight.employeeName}'s dashboard.`
        });
        setIsMealInsightDialogOpen(false);
        setAiMealInsight(null);
    };

    const handleRequestNewHire = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newHireRequest.role || !newHireRequest.shiftType || !newHireRequest.urgency || !newHireRequest.justification) {
            toast({ variant: "destructive", title: "Missing Information", description: "Please fill out all fields for the hiring request, including the justification." });
            return;
        }
        
        // In a real app, this would send to a backend. Here, we use localStorage.
        const currentRequests = JSON.parse(localStorage.getItem('hiringRequests') || '[]');
        const newRequestWithId = { ...newHireRequest, id: Date.now(), manager: 'Demo Manager', location: 'Downtown' }; // Add some mock context
        currentRequests.push(newRequestWithId);
        localStorage.setItem('hiringRequests', JSON.stringify(currentRequests));

        toast({
            title: "Request Sent to Owner",
            description: `Your request to hire a ${newHireRequest.role} has been sent for approval.`
        });
        setNewHireRequest({ role: '', shiftType: '', urgency: '', justification: '' });
    };

    const handleTranslate = async (taskId: number, text: string) => {
        if (translations[taskId]) {
            const newTranslations = { ...translations };
            delete newTranslations[taskId];
            setTranslations(newTranslations);
            return;
        }
        setTranslatingId(taskId);
        try {
            const {data, error} = await translateTextAction({ text, targetLanguage: 'Spanish' });
            if (error || !data) {
                throw new Error(error || 'Failed to translate');
            }
            setTranslations(prev => ({ ...prev, [taskId]: data.translatedText }));
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Translation Failed', description: 'Could not translate the task.' });
        } finally {
            setTranslatingId(null);
        }
    };

    const handleAskWhy = async (task: DelegatedTask) => {
        setExplanation('');
        setIsExplanationDialogOpen(true);
        setIsGeneratingExplanation(true);
        try {
            const {data, error} = await explainTaskImportanceAction({ taskTitle: task.description, taskDescription: `This is a mandatory task from: ${task.source}` });
            if (error || !data) {
                throw new Error(error || "Could not get an explanation.");
            }
            setExplanation(data.explanation);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'AI Error', description: error.message });
            setExplanation('Could not load an explanation for this task.');
        } finally {
            setIsGeneratingExplanation(false);
        }
    };
    
    const handleDismissRejection = (requestId: number) => {
        const updatedRejected = rejectedRequests.filter(req => req.id !== requestId);
        setRejectedRequests(updatedRejected);
        localStorage.setItem('rejectedHiringRequests', JSON.stringify(updatedRejected));
        toast({
            title: "Notification Dismissed",
            description: "The rejected hiring request has been cleared from your dashboard.",
        });
    };

    const handlePrint = () => {
        window.print();
    };

    const calculateDeviation = (log: TimeClockLog) => {
        const gracePeriodMinutes = 5;
        const clockTime = new Date(log.timestamp);
        const scheduleTime = log.type === 'in' ? log.shiftStart : log.shiftEnd;

        if (!scheduleTime) return { text: 'N/A', isLate: false, details: '' };

        const [hours, minutes] = scheduleTime.split(':').map(Number);
        const shiftTime = new Date(clockTime);
        shiftTime.setHours(hours, minutes, 0, 0);

        const diffMins = differenceInMinutes(clockTime, shiftTime);

        if (log.type === 'in' && diffMins > gracePeriodMinutes) {
            return { text: `Late by ${diffMins} min`, isLate: true, details: `was ${diffMins} minutes late for their shift on ${format(clockTime, 'PPP')}` };
        }
        if (log.type === 'out' && diffMins < -gracePeriodMinutes) {
            return { text: `Early by ${Math.abs(diffMins)} min`, isLate: true, details: `clocked out ${Math.abs(diffMins)} minutes early from their shift on ${format(clockTime, 'PPP')}` };
        }
        return { text: 'On Time', isLate: false, details: '' };
    };
    
    const handleGenerateWarning = async (log: TimeClockLog, details: string) => {
        setSelectedLogForWarning(log);
        setIsWarningDialogOpen(true);
        setIsGeneratingWarning(true);
        setWarningContent(null);
        try {
            const {data, error} = await generateWarningLetterAction({
                employeeName: log.employeeName,
                latenessDetails: details,
            });
            if (error || !data) {
                throw new Error(error || "Failed to generate warning.");
            }
            setWarningContent(data);
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'AI Error',
                description: 'Could not generate the warning letter.',
            });
        } finally {
            setIsGeneratingWarning(false);
        }
    };
    
    const handleSendWarning = () => {
        setIsWarningDialogOpen(false);
        toast({
            title: "Warning Sent (Simulated)",
            description: `A formal warning has been emailed to ${selectedLogForWarning?.employeeName}.`
        });
        setSelectedLogForWarning(null);
        setWarningContent(null);
    };

    return (
        <TooltipProvider>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2"><Printer /> Monthly Reporting</CardTitle>
                            <CardDescription>Generate a printable report of this month's activities to share with the owner or for your records.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button><Printer className="mr-2 h-4 w-4" /> Generate Monthly Report</Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl">
                                     <DialogHeader>
                                        <DialogTitle className="font-headline text-2xl">Monthly Activity Report</DialogTitle>
                                        <DialogDescription>
                                          Summary for {format(new Date(), 'MMMM yyyy')}
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="py-4 space-y-6">
                                        <Card>
                                            <CardHeader><CardTitle className="text-lg">Team Performance</CardTitle></CardHeader>
                                            <CardContent>
                                                <Table>
                                                <TableHeader><TableRow><TableHead>Member</TableHead><TableHead>Tasks Completed</TableHead><TableHead>Completion Rate</TableHead></TableRow></TableHeader>
                                                <TableBody>
                                                    {teamMembers.map(member => (
                                                    <TableRow key={member.name}>
                                                        <TableCell>{member.name}</TableCell>
                                                        <TableCell>{member.tasksCompleted}/{member.tasksCompleted + member.tasksPending}</TableCell>
                                                        <TableCell><Progress value={member.progress} className="h-2" /></TableCell>
                                                    </TableRow>
                                                    ))}
                                                </TableBody>
                                                </Table>
                                            </CardContent>
                                        </Card>
                                         <Card>
                                            <CardHeader><CardTitle className="text-lg">High-Priority Issues Handled</CardTitle></CardHeader>
                                            <CardContent>
                                                <Table>
                                                    <TableHeader><TableRow><TableHead>Issue</TableHead><TableHead>Category</TableHead><TableHead>Resolution Notes</TableHead></TableRow></TableHeader>
                                                    <TableBody>
                                                        {highPriorityIssues.length > 0 ? highPriorityIssues.map(issue => (
                                                        <TableRow key={issue.id}>
                                                            <TableCell>{issue.description}</TableCell>
                                                            <TableCell><Badge variant="outline">{issue.category}</Badge></TableCell>
                                                            <TableCell className="text-xs text-muted-foreground">{issue.resolutionNotes || 'N/A'}</TableCell>
                                                        </TableRow>
                                                        )) : <TableRow><TableCell colSpan={3} className="text-center">No high-priority issues recorded this month.</TableCell></TableRow>}
                                                    </TableBody>
                                                </Table>
                                            </CardContent>
                                        </Card>
                                      </div>
                                       <DialogFooter className="sm:justify-between items-center gap-4">
                                        <Alert className="text-left max-w-md">
                                          <AlertCircle className="h-4 w-4" />
                                          <AlertTitle>For Your Records</AlertTitle>
                                          <AlertDescription>
                                            In a production app, this report could be automatically generated and emailed to you and the owner monthly.
                                          </AlertDescription>
                                        </Alert>
                                        <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Print Report</Button>
                                      </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>
                </TooltipTrigger>
                <TooltipContent><p>Generate a printable report of this month's activities to share with the owner.</p></TooltipContent>
            </Tooltip>

             {rejectedRequests.length > 0 && (
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><Info /> Request Updates from Owner</CardTitle>
                        <CardDescription>The owner has responded to the following hiring requests. You can dismiss these notifications.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {rejectedRequests.map(req => (
                            <Alert key={req.id} variant="destructive">
                                <AlertTitle className="flex justify-between items-center">
                                    <span>Request for {req.role} was rejected</span>
                                     <Button size="sm" variant="ghost" className="h-7" onClick={() => handleDismissRejection(req.id)}>
                                        <XCircle className="mr-2 h-4 w-4" /> Dismiss
                                    </Button>
                                </AlertTitle>
                                <AlertDescription>
                                    <p className="font-semibold mt-2">Owner's Comment:</p>
                                    <p className="italic">"{req.ownerComment}"</p>
                                </AlertDescription>
                            </Alert>
                        ))}
                    </CardContent>
                </Card>
            )}

            <Tooltip>
                <TooltipTrigger asChild>
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2"><Users /> Team Overview</CardTitle>
                            <CardDescription>Track the performance and task completion of your team members.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {teamMembers.map(member => (
                                <div key={member.name}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-medium">{member.name}</span>
                                        <span className="text-sm text-muted-foreground">{member.tasksCompleted} / {member.tasksCompleted + member.tasksPending} tasks</span>
                                    </div>
                                    <Progress value={member.progress} className="h-2" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TooltipTrigger>
                <TooltipContent><p>Track task completion and performance for each team member.</p></TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Card className="lg:col-span-3">
                        <CardHeader>
                             <CardTitle className="font-headline flex items-center gap-2"><Clock /> Live Time Clock Feed</CardTitle>
                            <CardDescription>Recent clock-in and clock-out events from your team. Deviations are highlighted.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Event</TableHead>
                                        <TableHead>Time</TableHead>
                                        <TableHead>Deviation</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {timeClockLogs.length > 0 ? timeClockLogs.map(log => {
                                        const deviation = calculateDeviation(log);
                                        return (
                                            <TableRow key={log.id} className={cn(deviation.isLate && "bg-destructive/10")}>
                                                <TableCell className="font-medium">{log.employeeName}</TableCell>
                                                <TableCell>
                                                    <Badge variant={log.type === 'in' ? 'default' : 'secondary'}>
                                                        Clocked {log.type === 'in' ? 'In' : 'Out'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{format(new Date(log.timestamp), 'p')}</TableCell>
                                                <TableCell className={cn(deviation.isLate && "font-semibold text-destructive")}>
                                                    {deviation.text}
                                                </TableCell>
                                                <TableCell className="text-right space-x-1">
                                                    <Button size="sm" variant="outline"><Phone className="mr-2 h-4 w-4" /> Call</Button>
                                                    {deviation.isLate && (
                                                        <Button size="sm" variant="destructive" onClick={() => handleGenerateWarning(log, deviation.details)}>
                                                            <MailWarning className="mr-2 h-4 w-4" /> AI Warning
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    }) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center">No clock events recorded yet.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TooltipTrigger>
                <TooltipContent>
                    <p>See real-time clock-in/out events and identify tardiness.</p>
                </TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2"><UserPlus /> Request New Hire</CardTitle>
                            <CardDescription>Submit a request to the owner to post a job application for a new team member.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleRequestNewHire} className="grid gap-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="grid gap-2 md:col-span-2">
                                        <Label htmlFor="hire-role">Role</Label>
                                        <Input id="hire-role" placeholder="e.g., Line Cook, Barista" value={newHireRequest.role} onChange={(e) => setNewHireRequest({...newHireRequest, role: e.target.value})} required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="hire-shift">Shift Type</Label>
                                        <Select value={newHireRequest.shiftType} onValueChange={(val) => setNewHireRequest({...newHireRequest, shiftType: val as any})} required>
                                            <SelectTrigger id="hire-shift"><SelectValue placeholder="Select type" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Full-time">Full-time</SelectItem>
                                                <SelectItem value="Part-time">Part-time</SelectItem>
                                                <SelectItem value="Contract">Contract</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="hire-urgency">Urgency</Label>
                                        <Select value={newHireRequest.urgency} onValueChange={(val) => setNewHireRequest({...newHireRequest, urgency: val})} required>
                                            <SelectTrigger id="hire-urgency"><SelectValue placeholder="Select urgency" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Immediate">Immediate</SelectItem>
                                                <SelectItem value="Within 2 Weeks">Within 2 Weeks</SelectItem>
                                                <SelectItem value="Within 1 Month">Within 1 Month</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="hire-justification">Justification</Label>
                                    <Textarea
                                        id="hire-justification"
                                        placeholder="e.g., We are entering our busy season and need another person on the line to keep up with demand during peak hours."
                                        value={newHireRequest.justification}
                                        onChange={(e) => setNewHireRequest({ ...newHireRequest, justification: e.target.value })}
                                        required
                                        rows={3}
                                    />
                                </div>
                                <Button type="submit" className="w-full md:w-auto">
                                    <Send className="mr-2 h-4 w-4" />
                                    Send Request to Owner
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TooltipTrigger>
                <TooltipContent><p>Submit a request to the owner to open a new job position.</p></TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2"><ShieldAlert /> Delegated Health Dept. Tasks</CardTitle>
                            <CardDescription>These are mandatory tasks assigned to you by the owner. Complete them and submit for final approval.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {delegatedTasks.length > 0 ? (
                                <Accordion type="single" collapsible className="w-full">
                                    {delegatedTasks.map(task => (
                                        <AccordionItem value={`task-${task.id}`} key={task.id}>
                                            <AccordionTrigger className="hover:no-underline text-left">
                                                <div className="flex w-full items-start justify-between pr-4 gap-4">
                                                    <div className='text-left'>
                                                        <p className="font-semibold">{translations[task.id] || task.description}</p>
                                                        <p className="text-xs text-muted-foreground">Source: {task.source}</p>
                                                    </div>
                                                    <Badge variant={task.status === 'Pending' ? 'destructive' : 'default'} className='whitespace-nowrap mt-1'>
                                                        {task.status === 'Pending' ? 'Action Required' : 'Pending Approval'}
                                                    </Badge>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className='p-4 bg-muted/50 rounded-md m-1 space-y-4'>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        {task.status === 'Pending' && (
                                                                <div className='flex items-end gap-2'>
                                                                    <div>
                                                                        <Label className='text-xs text-muted-foreground'>Attach Proof of Completion</Label>
                                                                        <div className='mt-2'>
                                                                            <PhotoUploader />
                                                                        </div>
                                                                    </div>
                                                                    <Button onClick={() => handleManagerSubmitForApproval(task.id)}>
                                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                                        Submit for Owner Approval
                                                                    </Button>
                                                                </div>
                                                        )}
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleTranslate(task.id, task.description)}
                                                            disabled={translatingId === task.id}
                                                        >
                                                            {translatingId === task.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Languages className="mr-2 h-4 w-4" />}
                                                            {translatingId === task.id ? 'Translating...' : translations[task.id] ? 'Show Original' : 'Translate'}
                                                        </Button>
                                                         <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleAskWhy(task)}
                                                        >
                                                            <HelpCircle className="mr-2 h-4 w-4 text-primary" />
                                                            Why is this important?
                                                        </Button>
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            ) : (
                                <div className="text-center text-sm text-muted-foreground p-4">You have no delegated tasks from the owner.</div>
                            )}
                        </CardContent>
                    </Card>
                </TooltipTrigger>
                <TooltipContent><p>Complete mandatory tasks assigned by the owner.</p></TooltipContent>
            </Tooltip>
            
            <Tooltip>
                <TooltipTrigger asChild>
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2"><PlusCircle /> Create & Assign Manual Task</CardTitle>
                            <CardDescription>
                                Define new one-time or recurring tasks and assign them to a specific team member. For shift-based tasks, use the Equipment page.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleAddTask} className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="task-description">Task Description</Label>
                                    <Input id="task-description" placeholder="e.g., Sanitize all kitchen surfaces" value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} required />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="frequency">Frequency</Label>
                                        <Select value={taskFrequency} onValueChange={setTaskFrequency} required>
                                            <SelectTrigger id="frequency">
                                                <SelectValue placeholder="Select frequency" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="One-time">One-time</SelectItem>
                                                <SelectItem value="Daily">Daily</SelectItem>
                                                <SelectItem value="Weekly">Weekly</SelectItem>
                                                <SelectItem value="Monthly">Monthly</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="assignee">Assign To</Label>
                                        <Select value={taskAssignee} onValueChange={setTaskAssignee} required>
                                            <SelectTrigger id="assignee">
                                                <SelectValue placeholder="Select employee" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {teamMembers.map(member => (
                                                    <SelectItem key={member.name} value={member.name}>{member.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-end">
                                        <Button type="submit" className="w-full">Add & Assign Task</Button>
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </TooltipTrigger>
                <TooltipContent><p>Assign one-time or recurring tasks to your team.</p></TooltipContent>
            </Tooltip>

            <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><ListTodo /> Manually Assigned Tasks</CardTitle>
                    <CardDescription>
                       A list of all one-time or manually-assigned recurring tasks. The AI-generated Master Task List for shifts is on the Equipment page.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Task</TableHead>
                                <TableHead>Assignee</TableHead>
                                <TableHead>Frequency</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {managedTasks.length > 0 ? (
                                managedTasks.map((task) => (
                                <TableRow key={task.id}>
                                    <TableCell className="font-medium">{task.description}</TableCell>
                                    <TableCell>{task.assignee}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{task.frequency}</Badge>
                                    </TableCell>
                                </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                <TableCell colSpan={3} className="text-center h-24">
                                    No tasks created yet. Use the form above to create tasks manually.
                                </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2"><UtensilsCrossed /> Staff Meal Log</CardTitle>
                            <CardDescription>
                                Review meals logged by employees. The policy allows for 2 items per shift.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Items Logged</TableHead>
                                        <TableHead className="text-right">Item Count</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {staffMealLogs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="font-medium">{log.employee}</TableCell>
                                        <TableCell>{log.date}</TableCell>
                                        <TableCell>{log.items}</TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant={log.itemsCount >= 2 ? "destructive" : "outline"}>{log.itemsCount}</Badge>
                                        </TableCell>
                                    </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                        <CardFooter>
                            <Dialog open={isMealInsightDialogOpen} onOpenChange={setIsMealInsightDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" onClick={handleAiMealAnalysis}>
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        Get AI Insight on Meal Logs
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle className="font-headline flex items-center gap-2">
                                            <Sparkles className="text-primary h-5 w-5" />
                                            AI Meal Log Insight
                                        </DialogTitle>
                                    </DialogHeader>
                                    {aiMealInsight ? (
                                        <div className="py-4 space-y-4">
                                            <Alert>
                                                <AlertTitle>{aiMealInsight.title}</AlertTitle>
                                                <AlertDescription>{aiMealInsight.description}</AlertDescription>
                                            </Alert>
                                        </div>
                                    ) : (
                                        <div className="py-4 text-center text-muted-foreground">Click the button to get an AI insight.</div>
                                    )}
                                    <DialogFooter>
                                        <Button type="button" variant="secondary" onClick={() => setIsMealInsightDialogOpen(false)}>Close</Button>
                                        <Button onClick={handleSendMealInsight} disabled={!aiMealInsight}>
                                            <Send className="mr-2 h-4 w-4" />
                                            Send Reminder to Employee
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardFooter>
                    </Card>
                </TooltipTrigger>
                <TooltipContent><p>Review employee meal logs and identify policy violations.</p></TooltipContent>
            </Tooltip>

            <StaffMealManager />
            <Tooltip>
                <TooltipTrigger asChild>
                    <Card className="lg:col-span-3 border-primary bg-primary/5" id="ai-issue-analyzer-card">
                         <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2"><Zap className="text-primary"/> AI Issue Analyzer</CardTitle>
                            <CardDescription>Enter a reported issue to have the AI categorize it. Emergencies will be added to the High-Priority list below.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...issueForm}>
                                <form onSubmit={issueForm.handleSubmit(handleAnalyzeIssue)} className="space-y-4">
                                    <FormField
                                        control={issueForm.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>New Issue Description</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="e.g., There's a large pool of water forming under the main sink..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" disabled={isAnalyzing}>
                                        {isAnalyzing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Analyze with AI
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </TooltipTrigger>
                <TooltipContent><p>Use AI to categorize issues and identify emergencies.</p></TooltipContent>
            </Tooltip>
            
            <Tooltip>
                <TooltipTrigger asChild>
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2"><AlertTriangle className="text-accent"/> High-Priority Issues</CardTitle>
                            <CardDescription>Critical issues identified by the AI that require immediate attention.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {highPriorityIssues.length > 0 ? (
                                highPriorityIssues.map(issue => {
                                    const contact = findContact(issue.contactType);
                                    return (
                                        <Alert key={issue.id} variant="destructive" className="bg-accent/10 border-accent text-accent [&>svg]:text-accent">
                                            <Flag className="h-4 w-4" />
                                            <AlertTitle className="font-bold">{issue.description}</AlertTitle>
                                            <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                               <div>
                                                    <p>Reported by: {issue.reportedBy}</p>
                                                    <div className="font-semibold">AI Category: <Badge variant="outline" className="text-accent border-accent">{issue.category}</Badge></div>
                                               </div>
                                               <div className="mt-2 sm:mt-0 flex gap-2">
                                                    {contact ? (
                                                         <Button size="sm" asChild>
                                                            <a href={`tel:${contact.phone}`}>
                                                                <Phone className="mr-2 h-4 w-4" /> Call {contact.name}
                                                            </a>
                                                         </Button>
                                                    ) : (
                                                        <Button size="sm" asChild>
                                                            <Link href={`https://www.thumbtack.com/s/${issue.contactType.toLowerCase().replace(' ', '-')}/near-me/`} target="_blank">
                                                                <ExternalLink className="mr-2 h-4 w-4" /> Find
                                                            </Link>
                                                        </Button>
                                                    )}
                                                     <Button size="sm" variant="secondary" onClick={() => handleOpenNotesDialog(issue)}>
                                                        <MessageSquare className="mr-2 h-4 w-4" />
                                                        {issue.resolutionNotes ? 'Edit Notes' : 'Add Notes'}
                                                    </Button>
                                               </div>
                                            </AlertDescription>
                                        </Alert>
                                    )
                                })
                            ) : (
                                <div className="text-center text-sm text-muted-foreground p-4">No high-priority issues detected. Use the analyzer above.</div>
                            )}
                        </CardContent>
                    </Card>
                </TooltipTrigger>
                <TooltipContent><p>A list of critical issues that require immediate action.</p></TooltipContent>
            </Tooltip>
            
            <Tooltip>
                <TooltipTrigger asChild>
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2"><Wrench /> Service Contacts</CardTitle>
                            <CardDescription>Your list of trusted service professionals.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Dialog open={isAddContactOpen} onOpenChange={setIsAddContactOpen}>
                                <DialogTrigger asChild>
                                    <Button className="w-full mb-4" variant="outline">
                                        <PlusCircle className="mr-2 h-4 w-4"/> Add Contact
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle className="font-headline">Add New Service Contact</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleAddContact}>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="contact-name">Contact Name</Label>
                                                <Input id="contact-name" value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})} placeholder="e.g., Joe's Plumbing" required />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="contact-type">Service Type</Label>
                                                <Select value={newContact.type} onValueChange={value => setNewContact({...newContact, type: value})} required>
                                                    <SelectTrigger id="contact-type">
                                                        <SelectValue placeholder="Select service type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Plumber">Plumber</SelectItem>
                                                        <SelectItem value="Electrician">Electrician</SelectItem>
                                                        <SelectItem value="Pest Control">Pest Control</SelectItem>
                                                        <SelectItem value="HVAC">HVAC</SelectItem>
                                                        <SelectItem value="General Maintenance">General Maintenance</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="contact-phone">Phone Number</Label>
                                                <Input id="contact-phone" value={newContact.phone} onChange={e => setNewContact({...newContact, phone: e.target.value})} placeholder="e.g., 555-123-4567" required />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit">Save Contact</Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                            <div className="space-y-2">
                                {contacts.length > 0 ? contacts.map(c => (
                                     <div key={c.id} className="flex items-center justify-between rounded-md border p-3">
                                        <div>
                                            <p className="font-semibold">{c.name}</p>
                                            <p className="text-sm text-muted-foreground">{c.type}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" asChild>
                                           <a href={`tel:${c.phone}`} aria-label={`Call ${c.name}`}>
                                               <Phone className="h-4 w-4" />
                                           </a>
                                        </Button>
                                    </div>
                                )) : (
                                    <p className="text-sm text-center text-muted-foreground p-4">No contacts added yet.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TooltipTrigger>
                <TooltipContent><p>Your list of trusted plumbers, electricians, and other professionals.</p></TooltipContent>
            </Tooltip>

            <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="font-headline">Add/Edit Resolution Notes</DialogTitle>
                        <DialogDescription>
                            Describe the steps taken to resolve the issue: "{currentIssueForNotes?.description}"
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="e.g., Called Joe's Plumbing, they arrived at 2 PM and replaced the main valve. The area has been cleaned and sanitized."
                            value={resolutionNotes}
                            onChange={(e) => setResolutionNotes(e.target.value)}
                            rows={5}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsNotesDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveNotes}>Save Notes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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

            <Dialog open={isWarningDialogOpen} onOpenChange={setIsWarningDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="font-headline flex items-center gap-2">
                            <MailWarning className="text-primary h-5 w-5" />
                            AI-Generated Warning
                        </DialogTitle>
                        <DialogDescription>
                            Review the AI-generated email for {selectedLogForWarning?.employeeName} before sending.
                        </DialogDescription>
                    </DialogHeader>
                    {isGeneratingWarning ? (
                        <div className="flex items-center justify-center p-8 space-x-2">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            <p className="text-muted-foreground">AI is drafting the warning...</p>
                        </div>
                    ) : warningContent ? (
                        <div className="py-4 space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="warning-subject">Email Subject</Label>
                                <Input id="warning-subject" value={warningContent.subject} readOnly />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="warning-body">Email Body</Label>
                                <Textarea id="warning-body" defaultValue={warningContent.body} rows={10} />
                            </div>
                        </div>
                    ) : (
                        <p className="text-destructive text-center py-8">Could not generate a warning letter.</p>
                    )}
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setIsWarningDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSendWarning} disabled={isGeneratingWarning || !warningContent}>
                            Send Email (Simulated)
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isExplanationDialogOpen} onOpenChange={setIsExplanationDialogOpen}>
                <DialogContent>
                     <DialogHeader>
                        <DialogTitle className="font-headline flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary"/>
                            AI Task Explanation
                        </DialogTitle>
                        <DialogDescription>
                            Here's why this task is important for our team's success.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {isGeneratingExplanation ? (
                            <div className="flex items-center justify-center p-8 space-x-2">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                <p className="text-muted-foreground">AI is preparing the explanation...</p>
                            </div>
                        ) : (
                            <p className="text-sm text-foreground">{explanation}</p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

        </div>
        </TooltipProvider>
    );
}
