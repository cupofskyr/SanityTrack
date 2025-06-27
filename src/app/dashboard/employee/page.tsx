
"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import PhotoUploader from "@/components/photo-uploader";
import { CheckCircle, AlertTriangle, ListTodo, PlusCircle, CalendarDays, Clock, AlertCircle, Star, Timer, Megaphone, Sparkles, Loader2, User, Phone, Mail, UtensilsCrossed, Languages, ArrowRightLeft, ShieldCheck, BookOpen, FileText } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { analyzePhotoIssueAction, translateTextAction, compareFoodQualityAction } from '@/app/actions';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";
import EmployeeServiceAlertWidget from "@/components/employee-service-alert-widget";
import type { CompareFoodQualityOutput } from "@/ai/schemas/food-quality-schemas";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

const initialTasks = [
  { id: 1, name: "Clean kitchen floor", area: "Kitchen", priority: "High", status: "Pending", type: 'regular' },
  { id: 2, name: "Restock restroom supplies", area: "Restroom", priority: "Medium", status: "Pending", type: 'regular' },
  { id: 3, name: "Sanitize all door handles", area: "All Areas", priority: "High", status: "In Progress", type: 'regular' },
  { id: 4, name: "Mandatory Team Meeting: Q3 Planning", area: "Main Office", priority: "High", status: "Pending", type: 'regular' }
];

const initialQaTasks = [
    // This will be populated by localStorage now
];

type Task = { id: number; name: string; area: string; priority: string; status: string; type: 'regular' };
type QaTask = { id: number; description: string; source: string; status: 'Pending'; itemToAudit?: string; standardImageUrl?: string; type: 'qa' };

const initialCompletedTasks: ( (Task | QaTask) & {completedAt: string})[] = [
  { id: 5, name: "Empty trash bins", area: "All Areas", priority: "Low", status: "Approved", completedAt: "2024-05-20 09:00", type: 'regular' },
  { id: 6, name: "Wipe down dining tables", area: "Dining Area", priority: "Medium", status: "Approved", completedAt: "2024-05-20 08:30", type: 'regular' },
];

const initialIssues = [
  { id: 1, description: "Leaky faucet in men's restroom", status: "Reported" },
  { id: 2, description: "Dining area light flickering", status: "Maintenance Notified" },
];

const initialInventory = [
    { id: 1, name: 'Coffee Cups (sleeves)', par: 100, currentCount: 75 },
    { id: 2, name: 'Milk (gallons)', par: 10, currentCount: 4 },
    { id: 3, name: 'Napkins (packs)', par: 20, currentCount: 18 },
];

const initialBriefing = {
    title: "Let's Make it a Great Tuesday!",
    message: "Great work yesterday everyone! Let's keep the energy high today. Our focus is on guest experience, so let's make sure every customer leaves with a smile.",
    tasks: [ "Double-check all tables for cleanliness before seating new guests.", "Give a friendly greeting to everyone who walks in." ]
};

type Shift = { id: string; date: string; startTime: string; endTime: string; assignedTo?: string; status?: 'scheduled' | 'offered'; };

// Simulation data for this employee
const employeeName = "John Doe";
const employeeLocation = "Downtown";
const employeeShift = { start: "09:00", end: "17:00" };

// Mock for QA Sentinel
const goldenStandards = [{ name: "Classic Burger", imageUrl: "https://storage.googleapis.com/gen-ai-recipes/golden-burger.jpg" }];

export default function EmployeeDashboard() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [qaTasks, setQaTasks] = useState<QaTask[]>(initialQaTasks);
  const [completedTasks, setCompletedTasks] = useState(initialCompletedTasks);
  const [issues, setIssues] = useState(initialIssues);
  const [inventory, setInventory] = useState(initialInventory);
  
  const [newIssueDescription, setNewIssueDescription] = useState("");
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [unavailableDays, setUnavailableDays] = useState<Date[] | undefined>([]);
  const { toast } = useToast();

  const [isClockedIn, setIsClockedIn] = useState(false);
  const [lastClockIn, setLastClockIn] = useState<Date | null>(null);

  const [isOvertimeDialogOpen, setIsOvertimeDialogOpen] = useState(false);
  const [overtimeReason, setOvertimeReason] = useState("");
  const [overtimeHours, setOvertimeHours] = useState("");

  const [photoForAnalysis, setPhotoForAnalysis] = useState<string | null>(null);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  
  const [directMessage, setDirectMessage] = useState<{title: string, description: string} | null>(null);

  const [briefing, setBriefing] = useState(initialBriefing);
  const [translatedBriefing, setTranslatedBriefing] = useState<{title: string, message: string} | null>(null);
  const [isTranslatingBriefing, setIsTranslatingBriefing] = useState(false);
  
  const [allShifts, setAllShifts] = useState<Shift[]>([]);
  const [isTaskDialogsOpen, setIsTaskDialogsOpen] = useState<Record<number, boolean>>({});

  const [isQaTaskDialogOpen, setIsQaTaskDialogOpen] = useState(false);
  const [currentQaTask, setCurrentQaTask] = useState<QaTask | null>(null);
  const [qaAuditPhoto, setQaAuditPhoto] = useState<string | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  
  const allCurrentTasks = [...qaTasks, ...tasks];

  useEffect(() => {
    // This effect simulates fetching the schedule from a shared source (localStorage)
    const publishedScheduleJSON = localStorage.getItem('published-schedule');
    if (publishedScheduleJSON) setAllShifts(JSON.parse(publishedScheduleJSON));

    // Poll for new QA tasks
    const qaTaskInterval = setInterval(() => {
      const storedQaTask = localStorage.getItem('qa-employee-task');
      if (storedQaTask) {
        const newTask = JSON.parse(storedQaTask);
        setQaTasks(prev => {
          if (!prev.some(t => t.id === newTask.id)) {
            toast({ variant: "destructive", title: "New QA Task Assigned", description: "A high-priority QA task has been added to your list." });
            return [...prev, { ...newTask, itemToAudit: 'Classic Burger', type: 'qa' }];
          }
          return prev;
        });
      }
    }, 2000);

    return () => clearInterval(qaTaskInterval);
  }, [toast]);

  useEffect(() => {
    const pendingIssue = localStorage.getItem('ai-issue-suggestion');
    if (pendingIssue) {
        setNewIssueDescription(pendingIssue);
        setIsReportDialogOpen(true);
        localStorage.removeItem('ai-issue-suggestion');
        toast({ title: "AI Suggestion Loaded", description: "The issue description from the AI Camera has been pre-filled for you." });
    }

    const message = localStorage.getItem('employee-direct-message');
    if (message) {
        const parsedMessage = JSON.parse(message);
        setDirectMessage(parsedMessage);
    }
  }, [toast]);

  const handleClockIn = () => {
    setIsClockedIn(true);
    setLastClockIn(new Date());
    const newLog = { id: Date.now(), employeeName, location: employeeLocation, type: 'in' as const, timestamp: new Date().toISOString(), shiftStart: employeeShift.start };
    const logs = JSON.parse(localStorage.getItem('timeClockLogs') || '[]');
    logs.push(newLog);
    localStorage.setItem('timeClockLogs', JSON.stringify(logs));
    toast({ title: "Clocked In", description: `You clocked in at ${new Date().toLocaleTimeString()}. Welcome!` });
  };

  const handleClockOut = () => {
    setIsClockedIn(false);
     const newLog = { id: Date.now(), employeeName, location: employeeLocation, type: 'out' as const, timestamp: new Date().toISOString(), shiftEnd: employeeShift.end };
    const logs = JSON.parse(localStorage.getItem('timeClockLogs') || '[]');
    logs.push(newLog);
    localStorage.setItem('timeClockLogs', JSON.stringify(logs));
    toast({ title: "Clocked Out", description: `You clocked out at ${new Date().toLocaleTimeString()}. Have a great day!` });
  };
  
  const handleCompleteTask = (taskToComplete: Task) => {
    setTasks(tasks.filter((task) => task.id !== taskToComplete.id));
    const newCompletedTask = { ...taskToComplete, status: 'Pending Review', completedAt: format(new Date(), "yyyy-MM-dd HH:mm") };
    setCompletedTasks([newCompletedTask, ...completedTasks]);
    toast({ title: 'Task Submitted for Review', description: `Your completion for "${taskToComplete.name}" has been sent to the manager for approval.` });
    setIsTaskDialogsOpen(prev => ({...prev, [taskToComplete.id]: false}));
  };

  const handleReportIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIssueDescription.trim()) {
      toast({ variant: "destructive", title: "Missing Information", description: "Please provide a description for the issue." });
      return;
    }
    const newIssue = { id: Date.now(), description: newIssueDescription, status: "Reported" };
    setIssues([newIssue, ...issues]);
    setNewIssueDescription("");
    setPhotoForAnalysis(null);
    setIsReportDialogOpen(false);
    toast({ title: "Issue Reported", description: "The new issue has been reported to the manager." });
  };

  const handleAnalyzePhoto = async () => {
      if (!photoForAnalysis) return;
      setIsAnalyzingPhoto(true);
      try {
        const { data, error } = await analyzePhotoIssueAction({ photoDataUri: photoForAnalysis });
        if (error || !data) throw new Error(error || 'Failed to analyze photo.');
        setNewIssueDescription(data.suggestion);
        toast({ title: "AI Analysis Complete", description: "The issue description has been pre-filled." });
      } catch (error) {
        toast({ variant: 'destructive', title: 'AI Analysis Failed', description: 'Could not analyze the photo.' });
      } finally {
        setIsAnalyzingPhoto(false);
      }
    };
    
  const handleCountChange = (id: number, value: string) => {
    const count = parseInt(value, 10);
    setInventory(
        inventory.map(item =>
            item.id === id ? { ...item, currentCount: isNaN(count) ? 0 : count } : item
        )
    );
  };

  const handleTranslateBriefing = async () => {
    if (translatedBriefing) {
        setTranslatedBriefing(null);
        return;
    }
    setIsTranslatingBriefing(true);
    try {
        const [titleRes, messageRes] = await Promise.all([
            translateTextAction({ text: briefing.title, targetLanguage: 'Spanish' }),
            translateTextAction({ text: briefing.message, targetLanguage: 'Spanish' })
        ]);
        if (titleRes.error || !titleRes.data || messageRes.error || !messageRes.data) throw new Error(titleRes.error || messageRes.error || 'Failed to translate');
        setTranslatedBriefing({ title: titleRes.data.translatedText, message: messageRes.data.translatedText });
        toast({ title: "Briefing Translated", description: "The manager's message has been translated to Spanish." });
    } catch (error) {
        toast({ variant: 'destructive', title: 'Translation Failed', description: 'Could not translate the message.' });
    } finally {
        setIsTranslatingBriefing(false);
    }
  };
  
  const handleOfferShift = (shiftId: string) => {
    const updatedShifts = allShifts.map(s => s.id === shiftId ? { ...s, status: 'offered' as const } : s);
    localStorage.setItem('published-schedule', JSON.stringify(updatedShifts));
    setAllShifts(updatedShifts);
    toast({ title: "Shift Offered", description: "Your shift is now available for others to claim." });
  };

  const handleClaimShift = (shiftId: string) => {
    const updatedShifts = allShifts.map(s => s.id === shiftId ? { ...s, assignedTo: employeeName, status: 'scheduled' as const } : s);
    localStorage.setItem('published-schedule', JSON.stringify(updatedShifts));
    setAllShifts(updatedShifts);
    toast({ title: "Shift Claimed!", description: "The shift has been added to your schedule." });
  };

  const handleOpenQaDialog = (task: QaTask) => {
    setCurrentQaTask(task);
    setIsQaTaskDialogOpen(true);
  };

  const handleQaAudit = async () => {
    if (!currentQaTask || !qaAuditPhoto) return;
    const standard = goldenStandards.find(s => s.name === currentQaTask.itemToAudit);
    if (!standard) {
        toast({ variant: "destructive", title: "Error", description: "Could not find golden standard for this item." });
        return;
    }
    setIsAuditing(true);
    try {
        const { data } = await compareFoodQualityAction({ standardImageUri: standard.imageUrl, actualImageUri: qaAuditPhoto, itemName: standard.name });
        if (data && data.score >= 7) {
            toast({ title: "QA Check Passed!", description: `Score: ${data.score}/10. Great job!` });
            setQaTasks(prev => prev.filter(t => t.id !== currentQaTask.id));
            localStorage.removeItem('qa-employee-task');
            setIsQaTaskDialogOpen(false);
        } else {
             toast({ variant: "destructive", title: "QA Check Failed", description: `Score: ${data?.score}/10. A manager has been notified.` });
             // In a real app, this would trigger the alert flow. Here we just update the task.
             setQaTasks(prev => prev.map(t => t.id === currentQaTask.id ? {...t, description: `[FAILED] ${t.description}`} : t));
             setIsQaTaskDialogOpen(false);
        }
    } catch (error) {
        toast({ variant: 'destructive', title: 'Audit Failed', description: 'Could not complete the QA audit.' });
    } finally {
        setIsAuditing(false);
        setQaAuditPhoto(null);
        setCurrentQaTask(null);
    }
  };

  const mySchedule = allShifts.filter(shift => shift.assignedTo === employeeName);
  const availableShifts = allShifts.filter(shift => shift.status === 'offered' && shift.assignedTo !== employeeName);
  const parseDate = (dateString: string) => { const [year, month, day] = dateString.split('-').map(Number); return new Date(year, month - 1, day); };

  return (
    <TooltipProvider>
    <div className="space-y-6">
       {directMessage && (
            <Alert variant="destructive" className="bg-accent/10 border-accent/50 text-accent [&>svg]:text-accent">
                <Megaphone className="h-4 w-4" /><AlertTitle>{directMessage.title}</AlertTitle>
                <AlertDescription className="flex justify-between items-center">{directMessage.description}<Button variant="ghost" size="sm" onClick={() => { setDirectMessage(null); localStorage.removeItem('employee-direct-message'); }}>Dismiss</Button></AlertDescription>
            </Alert>
        )}
       <EmployeeServiceAlertWidget />
      
       {/* Tier 1: Immediate Action */}
       <Card className="lg:col-span-3">
        <CardHeader><CardTitle className="font-headline flex items-center gap-2"><ListTodo /> My Mission for Today</CardTitle><CardDescription>Tasks assigned to you for your current shift. Complete these to maintain our standards.</CardDescription></CardHeader>
        <CardContent><Table><TableHeader><TableRow><TableHead>Task</TableHead><TableHead>Area / Source</TableHead><TableHead>Priority</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
        <TableBody>
            {allCurrentTasks.length > 0 ? allCurrentTasks.map((task) => (
            <TableRow key={task.id}>
                <TableCell className="font-medium">{task.type === 'qa' ? task.description : task.name}</TableCell>
                <TableCell>{task.type === 'qa' ? task.source : task.area}</TableCell>
                <TableCell><Badge variant={task.type === 'qa' || task.priority === "High" ? "destructive" : "secondary"}>{task.type === 'qa' ? 'High' : task.priority}</Badge></TableCell>
                <TableCell className="text-right">
                    {task.type === 'qa' ? (
                        <Button size="sm" variant="destructive" onClick={() => handleOpenQaDialog(task)}>Perform Check</Button>
                    ) : (
                        <Dialog open={isTaskDialogsOpen[task.id] || false} onOpenChange={(isOpen) => setIsTaskDialogsOpen(prev => ({...prev, [task.id]: isOpen}))}>
                            <DialogTrigger asChild><Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">Complete Task</Button></DialogTrigger>
                            <DialogContent><DialogHeader><DialogTitle className="font-headline">Complete: {task.name}</DialogTitle><DialogDescription>Upload a photo as proof of completion. This helps us track our quality standards.</DialogDescription></DialogHeader><PhotoUploader /><DialogFooter><Button type="button" className="bg-primary hover:bg-primary/90" onClick={() => handleCompleteTask(task)}>Submit Completion</Button></DialogFooter></DialogContent>
                        </Dialog>
                    )}
                </TableCell>
            </TableRow>
            )) : <TableRow><TableCell colSpan={4} className="h-24 text-center">No tasks assigned. Great job staying on top of things!</TableCell></TableRow>}
        </TableBody></Table></CardContent>
      </Card>

        {/* Tier 2: Shift Awareness */}
       <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader className="flex-row justify-between items-start">
                  <CardTitle className="font-headline flex items-center gap-2"><Clock /> Time Clock</CardTitle>
                  <Dialog open={isOvertimeDialogOpen} onOpenChange={setIsOvertimeDialogOpen}><DialogTrigger asChild><Button variant="outline" size="sm"><Timer className="mr-2 h-4 w-4"/> Request Overtime</Button></DialogTrigger>
                    <DialogContent><DialogHeader><DialogTitle className="font-headline">Request Overtime</DialogTitle><DialogDescription>All overtime must be approved by the owner. Please provide a reason and duration.</DialogDescription></DialogHeader>
                      <form onSubmit={(e) => { e.preventDefault(); if (!overtimeReason || !overtimeHours) { toast({ variant: "destructive", title: "Missing Information" }); return; } setIsOvertimeDialogOpen(false); setOvertimeReason(""); setOvertimeHours(""); toast({ title: "Overtime Request Submitted" }); }}>
                        <div className="grid gap-4 py-4"><div className="grid gap-2"><Label htmlFor="overtime-hours">Overtime Hours Requested</Label><Input id="overtime-hours" type="number" placeholder="e.g., 2" value={overtimeHours} onChange={(e) => setOvertimeHours(e.target.value)} required /></div><div className="grid gap-2"><Label htmlFor="overtime-reason">Reason for Overtime</Label><Textarea id="overtime-reason" placeholder="e.g., Needed to finish deep cleaning..." value={overtimeReason} onChange={(e) => setOvertimeReason(e.target.value)} required /></div></div>
                        <DialogFooter><Button type="submit">Submit for Approval</Button></DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4"><div className="text-center md:text-left"><p className="text-lg font-semibold">{isClockedIn ? "You are clocked in." : "You are clocked out."}</p>{lastClockIn && isClockedIn && (<p className="text-sm text-muted-foreground">Clocked in at {lastClockIn.toLocaleTimeString()}</p>)}</div><div className="flex gap-2"><Button onClick={handleClockIn} disabled={isClockedIn} className="w-32">Clock In</Button><Button onClick={handleClockOut} disabled={!isClockedIn} variant="destructive" className="w-32">Clock Out</Button></div></div>
                     <Alert><AlertCircle className="h-4 w-4" /><AlertTitle>Manual Clock-In</AlertTitle><AlertDescription>Automatic location-based clock-in is not possible in web applications due to browser privacy and technical limitations. Please clock in and out manually.</AlertDescription></Alert>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex-row items-start justify-between">
                    <div>
                        <CardTitle className="font-headline flex items-center gap-2"><Megaphone /> Message from the Manager</CardTitle>
                        <CardDescription>Your manager's daily briefing and focus for the team.</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleTranslateBriefing} disabled={isTranslatingBriefing}>{isTranslatingBriefing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Languages className="mr-2 h-4 w-4" />}{translatedBriefing ? 'Show Original' : 'Translate'}</Button>
                </CardHeader>
                <CardContent>
                    <Alert><AlertTitle className="font-semibold">{translatedBriefing ? translatedBriefing.title : briefing.title}</AlertTitle><AlertDescription><p className="mb-2">{translatedBriefing ? translatedBriefing.message : briefing.message}</p><p className="font-semibold text-xs mb-1">Today's Focus:</p><ul className="list-disc list-inside text-xs">{briefing.tasks.map((task, i) => <li key={i}>{task}</li>)}</ul></AlertDescription></Alert>
                    <p className="text-xs text-muted-foreground mt-2 text-center">This is an example briefing. Your manager can post new messages daily.</p>
                </CardContent>
            </Card>
       </div>

        {/* Tier 3: Personal & Team Hub */}
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Personal & Team Hub</CardTitle>
                <CardDescription>View your schedule, log issues, and access training materials.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Tabs defaultValue="schedule">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="schedule">My Schedule</TabsTrigger>
                        <TabsTrigger value="reporting">Reporting & Logs</TabsTrigger>
                        <TabsTrigger value="team">Team & Culture</TabsTrigger>
                    </TabsList>
                    <TabsContent value="schedule" className="mt-6">
                        <div className="grid md:grid-cols-2 gap-6">
                             <Card>
                                <CardHeader><CardTitle className="font-headline text-lg flex items-center gap-2"><CalendarDays /> My Schedule & Availability</CardTitle><CardDescription>View your upcoming shifts, offer a shift to a colleague, and set your unavailable days.</CardDescription></CardHeader>
                                <CardContent className="grid md:grid-cols-2 gap-6">
                                    <div><h3 className="font-semibold mb-2 text-sm">Set Unavailability</h3><div className="rounded-md border"><Calendar mode="multiple" selected={unavailableDays} onSelect={setUnavailableDays} className="p-0"/></div><p className="text-sm text-muted-foreground mt-2">You have marked {unavailableDays?.length || 0} day(s) as unavailable.</p></div>
                                    <div><h3 className="font-semibold mb-2 text-sm">Upcoming Shifts</h3><div className="border rounded-md p-1 space-y-2 min-h-[290px]">{mySchedule.length > 0 ? (<Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Shift</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader><TableBody>{mySchedule.sort((a,b) => a.date.localeCompare(b.date)).map(shift => (<TableRow key={shift.id} className={shift.status === 'offered' ? 'bg-accent/10' : ''}><TableCell className="font-medium">{format(parseDate(shift.date), "EEE, MMM dd")}</TableCell><TableCell>{shift.startTime} - {shift.endTime}</TableCell><TableCell className="text-right">{shift.status === 'offered' ? (<Badge variant="secondary">Offered</Badge>) : (<Button variant="outline" size="sm" onClick={() => handleOfferShift(shift.id)}>Offer</Button>)}</TableCell></TableRow>))}</TableBody></Table>) : (<div className="flex items-center justify-center h-full"><p className="text-muted-foreground text-center text-sm">Your schedule will appear here once published by the manager.</p></div>)}</div></div>
                                </CardContent>
                              </Card>
                              <Card>
                                <CardHeader><CardTitle className="font-headline text-lg flex items-center gap-2"><ArrowRightLeft /> Available Shifts to Claim</CardTitle><CardDescription>Shifts offered by your colleagues. Claiming a shift will automatically add it to your schedule.</CardDescription></CardHeader>
                                <CardContent><Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Shift</TableHead><TableHead>Offered By</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader><TableBody>{availableShifts.length > 0 ? (availableShifts.map(shift => (<TableRow key={shift.id}><TableCell>{format(parseDate(shift.date), "EEE, MMM dd")}</TableCell><TableCell>{shift.startTime} - {shift.endTime}</TableCell><TableCell>{shift.assignedTo}</TableCell><TableCell className="text-right"><Button size="sm" onClick={() => handleClaimShift(shift.id)}>Claim Shift</Button></TableCell></TableRow>))) : (<TableRow><TableCell colSpan={4} className="text-center h-24 text-muted-foreground">There are no available shifts to claim right now.</TableCell></TableRow>)}</TableBody></Table></CardContent>
                              </Card>
                        </div>
                    </TabsContent>
                    <TabsContent value="reporting" className="mt-6">
                        <div className="grid md:grid-cols-2 gap-6">
                             <Card>
                                <CardHeader className="flex-row items-center justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="font-headline text-lg flex items-center gap-2"><AlertTriangle /> Reported Issues & Concerns</CardTitle>
                                        <CardDescription>If you see something, say something. Report issues here.</CardDescription>
                                    </div>
                                    <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
                                        <DialogTrigger asChild><Button size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Report New Issue</Button></DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader><DialogTitle className="font-headline">Report a New Issue</DialogTitle><DialogDescription>Provide a description and, if possible, a photo of the issue.</DialogDescription></DialogHeader>
                                            <form onSubmit={handleReportIssue} className="py-4 space-y-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="issue-description">Description</Label>
                                                    <Textarea id="issue-description" placeholder="e.g., The freezer door is not sealing correctly." value={newIssueDescription} onChange={(e) => setNewIssueDescription(e.target.value)} required />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label>Photo Evidence</Label>
                                                    <PhotoUploader onPhotoDataChange={setPhotoForAnalysis} />
                                                </div>
                                                {photoForAnalysis && (
                                                    <Button type="button" variant="outline" className="w-full" onClick={handleAnalyzePhoto} disabled={isAnalyzingPhoto}>
                                                        {isAnalyzingPhoto ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                                        Pre-fill with AI Analysis
                                                    </Button>
                                                )}
                                                <DialogFooter><Button type="submit">Submit Report</Button></DialogFooter>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                </CardHeader>
                                <CardContent>
                                    <Table><TableHeader><TableRow><TableHead>Description</TableHead><TableHead className="text-right">Status</TableHead></TableRow></TableHeader><TableBody>{issues.length > 0 ? issues.map((issue) => (<TableRow key={issue.id}><TableCell className="font-medium">{issue.description}</TableCell><TableCell className="text-right"><Badge variant="outline">{issue.status}</Badge></TableCell></TableRow>)) : (<TableRow><TableCell colSpan={2} className="h-24 text-center text-muted-foreground">No issues reported. Great job!</TableCell></TableRow>)}</TableBody></Table>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader>
                                    <CardTitle className="font-headline text-lg">Inventory Count</CardTitle>
                                    <CardDescription>Update the current stock levels for key items.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader><TableRow><TableHead>Item</TableHead><TableHead>Status</TableHead><TableHead className="w-[120px]">Current Count</TableHead></TableRow></TableHeader>
                                        <TableBody>
                                            {inventory.map(item => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-medium">{item.name}</TableCell>
                                                    <TableCell><Badge variant={item.currentCount < item.par ? 'destructive' : 'outline'}>{item.currentCount < item.par ? 'Low' : 'OK'}</Badge></TableCell>
                                                    <TableCell><Input type="number" value={item.currentCount} onChange={e => handleCountChange(item.id, e.target.value)} className="h-8"/></TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                                <CardFooter><Button onClick={() => toast({ title: 'Counts Submitted', description: 'Inventory levels have been updated by manager.' })}>Submit Counts</Button></CardFooter>
                            </Card>
                        </div>
                    </TabsContent>
                    <TabsContent value="team" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline text-lg">Training Center</CardTitle>
                                <CardDescription>Access training games, materials, and challenges.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">Keep your skills sharp! The training center is where you can learn more about menu items and compete in challenges.</p>
                                <Button asChild><Link href="/dashboard/training"><BookOpen className="mr-2 h-4 w-4"/> Go to Training Center</Link></Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
      
      <Dialog open={isQaTaskDialogOpen} onOpenChange={setIsQaTaskDialogOpen}><DialogContent><DialogHeader><DialogTitle className="font-headline">Perform QA Check</DialogTitle><DialogDescription>Take a photo of a freshly made "{currentQaTask?.itemToAudit}" to compare it against the golden standard.</DialogDescription></DialogHeader><div className="py-4 space-y-4"><PhotoUploader onPhotoDataChange={setQaAuditPhoto} /><Alert><AlertCircle className="h-4 w-4" /><AlertTitle>Heads up!</AlertTitle><AlertDescription>If the AI score is too low, your manager and the KDS alarm will be notified automatically.</AlertDescription></Alert></div><DialogFooter><Button onClick={handleQaAudit} disabled={isAuditing || !qaAuditPhoto}>{isAuditing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <ShieldCheck className="mr-2 h-4 w-4"/>}Submit for AI Audit</Button></DialogFooter></DialogContent></Dialog>
    </div>
    </TooltipProvider>
  );
}
