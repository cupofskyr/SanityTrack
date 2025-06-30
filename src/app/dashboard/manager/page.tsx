
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
import { Users, AlertTriangle, Sparkles, Flag, Phone, Wrench, PlusCircle, ExternalLink, ListTodo, Zap, Loader2, ShieldAlert, CheckCircle, MessageSquare, Megaphone, CalendarClock, CalendarIcon, LinkIcon, UtensilsCrossed, UserPlus, Clock, Send, Languages, Printer, Info, XCircle, AlertCircle, MailWarning, HelpCircle, Utensils, Sigma, Thermometer, Tag, BarChart } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import PhotoUploader from '@/components/photo-uploader';
import StaffMealManager from '@/components/staff-meal-manager';
import { format, differenceInMinutes, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { analyzeIssueAction, generateDailyBriefingAction, translateTextAction, generateWarningLetterAction, explainTaskImportanceAction } from '@/app/actions';
import type { GenerateDailyBriefingOutput } from '@/ai/schemas/daily-briefing-schemas';
import type { GenerateWarningLetterOutput } from '@/ai/schemas/warning-letter-schemas';
import type { AnalyzeIssueOutput } from '@/ai/schemas/issue-analysis-schemas';
import ComplianceChart from '@/components/compliance-chart';


const teamMembers = [
    { name: "John Doe", tasksCompleted: 8, tasksPending: 2, progress: 80 },
    { name: "Jane Smith", tasksCompleted: 5, tasksPending: 5, progress: 50 },
    { name: "Sam Wilson", tasksCompleted: 10, tasksPending: 0, progress: 100 },
];

const initialContacts = [
    { id: 1, name: "Joe's Plumbing", type: "Plumber", phone: "555-123-4567" },
    { id: 2, name: "Sparky Electric", type: "Electrician", phone: "555-987-6543" },
];

const initialTempData = {
    'Walk-in Cooler': 38,
    'Prep Cooler 1': 40,
    'Freezer': -2,
    'Holding Cabinet': 145,
};

const complianceData = [
  { month: "Jan", score: 92 },
  { month: "Feb", score: 95 },
  { month: "Mar", score: 88 },
  { month: "Apr", score: 91 },
  { month: "May", score: 96 },
  { month: "Jun", score: 94 },
];


type TempData = typeof initialTempData;

type Contact = { id: number; name: string; type: string; phone: string; };
type ManagedTask = { id: number; description: string; frequency: string; assignee: string; };
type LoggedIssue = { id: number; description: string; reportedBy: string; } & AnalyzeIssueOutput;
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

    const [highPriorityIssues, setHighPriorityIssues] = useState<LoggedIssue[]>([]);
    const [standardPriorityIssues, setStandardPriorityIssues] = useState<LoggedIssue[]>([
        { id: 3, description: "Lightbulb flickering in the dry storage room.", reportedBy: 'AI Analyzer', category: 'Electrical', isEmergency: false, suggestedContact: 'Electrician', urgency: 'Low', suggestedAction: 'Schedule a maintenance check for the flickering lightbulb.' }
    ]);
    
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const issueForm = useForm<z.infer<typeof issueAnalyzerSchema>>({
        resolver: zodResolver(issueAnalyzerSchema),
        defaultValues: { description: "" },
    });

    const [delegatedTasks, setDelegatedTasks] = useState<DelegatedTask[]>(initialDelegatedTasks);

    const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
    const [currentIssueForNotes, setCurrentIssueForNotes] = useState<LoggedIssue | null>(null);
    const [resolutionNotes, setResolutionNotes] = useState("");

    const [isBriefingDialogOpen, setIsBriefingDialogOpen] = useState(false);
    const [dailyBriefing, setDailyBriefing] = useState<GenerateDailyBriefingOutput | null>(null);
    const [isGeneratingBriefing, setIsGeneratingBriefing] = useState(true);
    
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
    
    const [tempData, setTempData] = useState<TempData>(initialTempData);

    const [isLabelPrintOpen, setIsLabelPrintOpen] = useState(false);
    const [labelItem, setLabelItem] = useState('');
    const [labelQuantity, setLabelQuantity] = useState('');

    useEffect(() => {
        // Simulate real-time temperature fluctuations
        const interval = setInterval(() => {
            setTempData(prevData => {
                const newCoolerTemp = prevData['Walk-in Cooler'] > 41 ? 45 : prevData['Walk-in Cooler'] + (Math.random() > 0.8 ? 1 : -0.2);
                return {
                    ...prevData,
                    'Walk-in Cooler': parseFloat(newCoolerTemp.toFixed(1)),
                    'Prep Cooler 1': parseFloat((prevData['Prep Cooler 1'] + (Math.random() - 0.5)).toFixed(1)),
                }
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const storedRejected = localStorage.getItem('rejectedHiringRequests');
        if (storedRejected) {
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
                setIsGeneratingBriefing(false); 
                return;
            }

            setIsGeneratingBriefing(true);
            try {
                const {data, error} = await generateDailyBriefingAction();
                if (error || !data) throw new Error(error || 'Failed to generate briefing');
                setDailyBriefing(data);
                setIsBriefingDialogOpen(true);
                localStorage.setItem('lastManagerBriefingShown', today);
            } catch (error) {
                console.error("Failed to generate daily briefing:", error);
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
            if (error || !data) throw new Error(error || "Failed to analyze issue.");

            const newIssue: LoggedIssue = {
                id: Date.now(),
                description: values.description,
                reportedBy: 'AI Analyzer',
                ...data,
            };

            if (data.isEmergency) {
                setHighPriorityIssues(prev => [newIssue, ...prev]);
                 toast({ variant: "destructive", title: "🚨 Emergency Detected!" })
            } else {
                setStandardPriorityIssues(prev => [newIssue, ...prev]);
                toast({ title: "Issue Logged" });
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
            toast({ variant: "destructive", title: "Missing Information" });
            return;
        }
        const newId = contacts.length > 0 ? Math.max(...contacts.map(c => c.id)) + 1 : 1;
        setContacts([...contacts, { ...newContact, id: newId }]);
        setNewContact({ name: '', type: '', phone: '' });
        setIsAddContactOpen(false);
        toast({ title: "Contact Added" });
    };
    
    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!taskDescription || !taskFrequency || !taskAssignee) {
            toast({ variant: "destructive", title: "Missing Information" });
            return;
        }
        const newTask: ManagedTask = {
            id: managedTasks.length > 0 ? Math.max(...managedTasks.map(t => t.id)) + 1 : 1,
            description: taskDescription,
            frequency: taskFrequency,
            assignee: taskAssignee,
        };
        setManagedTasks([newTask, ...managedTasks]);
        setTaskDescription('');
        setTaskFrequency('');
        setTaskAssignee('');
        toast({ title: "Task Created" })
    };

    const handleOpenNotesDialog = (issue: LoggedIssue) => {
        setCurrentIssueForNotes(issue);
        setIsNotesDialogOpen(true);
    };

    const handleSaveNotes = () => {
        setIsNotesDialogOpen(false);
    };

    const handleRequestNewHire = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newHireRequest.role || !newHireRequest.shiftType || !newHireRequest.urgency || !newHireRequest.justification) {
            toast({ variant: "destructive", title: "Missing Information" });
            return;
        }
        
        const currentRequests = JSON.parse(localStorage.getItem('hiringRequests') || '[]');
        const newRequestWithId = { ...newHireRequest, id: Date.now(), manager: 'Demo Manager', location: 'Downtown' };
        currentRequests.push(newRequestWithId);
        localStorage.setItem('hiringRequests', JSON.stringify(currentRequests));

        toast({ title: "Request Sent to Owner" });
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
            if (error || !data) throw new Error(error || 'Failed to translate');
            setTranslations(prev => ({ ...prev, [taskId]: data.translatedText }));
        } catch (error) {
            console.error(error);
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
            if (error || !data) throw new Error(error || "Could not get an explanation.");
            setExplanation(data.explanation);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'AI Error', description: error.message });
        } finally {
            setIsGeneratingExplanation(false);
        }
    };
    
    const handleDismissRejection = (requestId: number) => {
        const updatedRejected = rejectedRequests.filter(req => req.id !== requestId);
        setRejectedRequests(updatedRejected);
        localStorage.setItem('rejectedHiringRequests', JSON.stringify(updatedRejected));
    };

    const handlePrint = () => window.print();

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
            if (error || !data) throw new Error(error || "Failed to generate warning.");
            setWarningContent(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsGeneratingWarning(false);
        }
    };
    
    const handleSendWarning = () => {
        setIsWarningDialogOpen(false);
        toast({ title: "Warning Sent (Simulated)" });
    };

    const handlePrintLabel = (e: React.FormEvent) => {
        e.preventDefault();
        if (!labelItem || !labelQuantity) return;
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head><title>Print Label</title>
                    <style>
                        @page { size: 3in 2in; margin: 0.1in; }
                        body { font-family: sans-serif; text-align: center; }
                        .label { border: 2px solid black; padding: 0.2in; width: 2.6in; height: 1.6in; }
                        .item-name { font-size: 16pt; font-weight: bold; }
                        .date { font-size: 12pt; margin-top: 0.2in; }
                    </style>
                    </head>
                    <body>
                        <div class="label">
                            <div class="item-name">${labelItem}</div>
                            <div class="date">Received: ${format(new Date(), 'MM/dd/yy')}</div>
                            <div class="date">Use By: ${format(addDays(new Date(), 7), 'MM/dd/yy')}</div>
                        </div>
                        <script>window.onload = function() { window.print(); window.close(); }</script>
                    </body>
                </html>
            `);
            printWindow.document.close();
            setIsLabelPrintOpen(false);
            setLabelItem('');
            setLabelQuantity('');
        }
    };

    return (
        <TooltipProvider>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Thermometer/> Live Temperature Monitoring (Simulated)</CardTitle>
                    <CardDescription>Real-time data from your connected equipment. Alerts are triggered for out-of-range temperatures.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    {Object.entries(tempData).map(([name, temp]) => {
                        const isAlert = name.includes('Cooler') && temp > 41 || name.includes('Freezer') && temp > 0;
                        return (
                             <Card key={name} className={cn(isAlert && "bg-destructive/10 border-destructive")}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{name}</CardTitle>
                                    {isAlert && <AlertTriangle className="h-4 w-4 text-destructive"/>}
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{temp}°F</div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </CardContent>
            </Card>

            <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Tag/> Food Labeling</CardTitle>
                    <CardDescription>Generate and print "Use By" labels for received inventory items to ensure proper rotation and safety.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Dialog open={isLabelPrintOpen} onOpenChange={setIsLabelPrintOpen}>
                        <DialogTrigger asChild>
                            <Button><Tag className="mr-2 h-4 w-4"/> Print New Label</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle className="font-headline">Print Food Label</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handlePrintLabel} className="space-y-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="label-item">Item Name</Label>
                                    <Input id="label-item" value={labelItem} onChange={e => setLabelItem(e.target.value)} placeholder="e.g., Sliced Turkey" required />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="label-qty">Quantity</Label>
                                    <Input id="label-qty" value={labelQuantity} onChange={e => setLabelQuantity(e.target.value)} placeholder="e.g., 2 lbs" required />
                                </div>
                                <DialogFooter>
                                    <Button type="submit">Print Label</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                    <Alert className="mt-4">
                        <Info className="h-4 w-4"/>
                        <AlertTitle>Printer Required</AlertTitle>
                        <AlertDescription>This feature will open your browser's print dialog. A compatible label printer is required for physical labels.</AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
            
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><BarChart /> Compliance Overview</CardTitle>
                    <CardDescription>Monthly compliance scores based on completed tasks and resolved issues.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ComplianceChart data={complianceData} />
                </CardContent>
            </Card>

            <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Printer /> Monthly Reporting</CardTitle>
                    <CardDescription>Generate a printable report of this month's activities.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-full"><Printer className="mr-2 h-4 w-4" /> Generate Report</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                                <DialogHeader>
                                <DialogTitle className="font-headline text-2xl">Monthly Activity Report</DialogTitle>
                                <DialogDescription>Summary for {format(new Date(), 'MMMM yyyy')}</DialogDescription>
                                </DialogHeader>
                                <div className="py-4 space-y-6 max-h-[70vh] overflow-y-auto pr-4">
                                    <Card>
                                        <CardHeader><CardTitle className="text-lg">Team Performance</CardTitle></CardHeader>
                                        <CardContent>
                                            <Table>
                                            <TableHeader><TableRow><TableHead>Member</TableHead><TableHead>Tasks Completed</TableHead><TableHead>Completion Rate</TableHead></TableRow></TableHeader>
                                            <TableBody>{teamMembers.map(member => (<TableRow key={member.name}><TableCell>{member.name}</TableCell><TableCell>{member.tasksCompleted}/{member.tasksCompleted + member.tasksPending}</TableCell><TableCell><Progress value={member.progress} className="h-2" /></TableCell></TableRow>))}</TableBody>
                                            </Table>
                                        </CardContent>
                                    </Card>
                                     <Card>
                                        <CardHeader><CardTitle className="text-lg">Issues Logged</CardTitle></CardHeader>
                                        <CardContent>
                                           <p className="text-sm text-muted-foreground">This report would include summaries of high and standard priority issues logged during the month.</p>
                                        </CardContent>
                                    </Card>
                                </div>
                                <DialogFooter className="sm:justify-between items-center gap-4 mt-4">
                                <Alert className="text-left max-w-md"><AlertCircle className="h-4 w-4" /><AlertTitle>For Your Records</AlertTitle><AlertDescription>In a production app, this report could be automatically generated and emailed to you and the owner monthly.</AlertDescription></Alert>
                                <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Print Report</Button>
                                </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>


             {rejectedRequests.length > 0 && (
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><Info /> Request Updates from Owner</CardTitle>
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
                                <AlertDescription><p className="font-semibold mt-2">Owner's Comment:</p><p className="italic">"{req.ownerComment}"</p></AlertDescription>
                            </Alert>
                        ))}
                    </CardContent>
                </Card>
            )}

            <Tooltip><TooltipTrigger asChild><Card className="lg:col-span-3"><CardHeader><CardTitle className="font-headline flex items-center gap-2"><Users /> Team Overview</CardTitle></CardHeader><CardContent className="space-y-4">{teamMembers.map(member => (<div key={member.name}><div className="flex justify-between items-center mb-1"><span className="font-medium">{member.name}</span><span className="text-sm text-muted-foreground">{member.tasksCompleted} / {member.tasksCompleted + member.tasksPending} tasks</span></div><Progress value={member.progress} className="h-2" /></div>))}</CardContent></Card></TooltipTrigger><TooltipContent><p>Track task completion and performance for each team member.</p></TooltipContent></Tooltip>

            <Tooltip><TooltipTrigger asChild>
                    <Card className="lg:col-span-3" id="time-clock-feed">
                        <CardHeader><CardTitle className="font-headline flex items-center gap-2"><Clock /> Live Time Clock Feed</CardTitle></CardHeader>
                        <CardContent><Table><TableHeader><TableRow><TableHead>Employee</TableHead><TableHead>Event</TableHead><TableHead>Time</TableHead><TableHead className="hidden md:table-cell">Deviation</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {timeClockLogs.length > 0 ? timeClockLogs.map(log => {
                                        const deviation = calculateDeviation(log);
                                        return (
                                            <TableRow key={log.id} className={cn(deviation.isLate && "bg-destructive/10")}>
                                                <TableCell className="font-medium">{log.employeeName}</TableCell>
                                                <TableCell><Badge variant={log.type === 'in' ? 'default' : 'secondary'}>Clocked {log.type === 'in' ? 'In' : 'Out'}</Badge></TableCell>
                                                <TableCell>{format(new Date(log.timestamp), 'p')}</TableCell>
                                                <TableCell className={cn("hidden md:table-cell", deviation.isLate && "font-semibold text-destructive")}>{deviation.text}</TableCell>
                                                <TableCell className="text-right space-x-1"><Button size="sm" variant="outline"><Phone className="mr-2 h-4 w-4" /> Call</Button>
                                                    {deviation.isLate && (<Button size="sm" variant="destructive" onClick={() => handleGenerateWarning(log, deviation.details)}><MailWarning className="mr-2 h-4 w-4" /> AI Warning</Button>)}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    }) : ( <TableRow><TableCell colSpan={5} className="h-24 text-center">No clock events recorded yet.</TableCell></TableRow>)}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TooltipTrigger><TooltipContent><p>See real-time clock-in/out events and identify tardiness.</p></TooltipContent></Tooltip>
        </div>
        </TooltipProvider>
    );
}
