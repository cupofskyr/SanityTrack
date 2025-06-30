
"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import PhotoUploader from "@/components/photo-uploader";
import { CheckCircle, AlertTriangle, ListTodo, PlusCircle, CalendarDays, Clock, AlertCircle, Timer, Megaphone, Sparkles, Loader2, Languages, ArrowRightLeft, ShieldCheck, BookOpen, Edit, FileText, Video, Zap } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { analyzePhotoIssueAction, translateTextAction, compareFoodQualityAction, placeEmergencyOrderAction } from '@/app/actions';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";
import EmployeeServiceAlertWidget from "@/components/employee-service-alert-widget";
import type { CompareFoodQualityOutput } from "@/ai/schemas/food-quality-schemas";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

const initialTasks = [
  { id: 1, name: "Clean kitchen floor", area: "Kitchen", priority: "High", status: "Pending", type: 'regular' },
  { id: 2, name: "Restock restroom supplies", area: "Restroom", priority: "Medium", status: "Pending", type: 'regular' },
  { id: 3, name: "Sanitize all door handles", area: "All Areas", priority: "High", status: "In Progress", type: 'regular' },
  { id: 4, name: "Mandatory Team Meeting: Q3 Planning", area: "Main Office", priority: "High", status: "Pending", type: 'regular' }
];

const initialQaTasks: QaTask[] = [];

type Task = { id: number; name: string; area: string; priority: string; status: string; type: 'regular' };
type QaTask = { id: number; description: string; source: string; status: 'Pending' | 'Failed'; itemToAudit: string; standardImageUrl: string; type: 'qa' };

const initialCompletedTasks: ( (Task | QaTask) & {completedAt: string})[] = [
  { id: 5, name: "Empty trash bins", area: "All Areas", priority: "Low", status: "Approved", completedAt: "2024-05-20 09:00", type: 'regular' },
  { id: 6, name: "Wipe down dining tables", area: "Dining Area", priority: "Medium", status: "Approved", completedAt: "2024-05-20 08:30", type: 'regular' },
];

const initialIssues = [
  { id: 1, description: "Leaky faucet in men's restroom", status: "Reported" },
  { id: 2, description: "Dining area light flickering", status: "Maintenance Notified" },
];

const initialBriefing = {
    title: "Let's Make it a Great Tuesday!",
    message: "Great work yesterday everyone! Let's keep the energy high today. Our focus is on guest experience, so let's make sure every customer leaves with a smile.",
    tasks: [ "Double-check all tables for cleanliness before seating new guests.", "Give a friendly greeting to everyone who walks in." ]
};

type Shift = { id: string; date: string; startTime: string; endTime: string; assignedTo?: string; status?: 'scheduled' | 'offered'; };

const employeeName = "John Doe";

export default function EmployeeDashboard() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [qaTasks, setQaTasks] = useState<QaTask[]>(initialQaTasks);
  const [completedTasks, setCompletedTasks] = useState(initialCompletedTasks);
  const [issues, setIssues] = useState(initialIssues);
  
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

  const [announcement, setAnnouncement] = useState<{title: string, videoUrl: string} | null>(null);
  
  const [isEmergencyOrderOpen, setIsEmergencyOrderOpen] = useState(false);
  const [emergencyItem, setEmergencyItem] = useState("");
  const [isOrdering, setIsOrdering] = useState(false);

  const allCurrentTasks = [...qaTasks, ...tasks];

  useEffect(() => {
    const publishedScheduleJSON = localStorage.getItem('published-schedule');
    if (publishedScheduleJSON) setAllShifts(JSON.parse(publishedScheduleJSON));

    const qaTaskInterval = setInterval(() => {
      const storedQaTask = localStorage.getItem('qa-employee-task');
      if (storedQaTask) {
        try {
          const newTask: QaTask = JSON.parse(storedQaTask);
          if (newTask.type === 'qa') {
            setQaTasks(prev => {
              if (!prev.some(t => t.id === newTask.id)) {
                toast({ variant: "destructive", title: "New QA Task Assigned", description: "A high-priority QA task has been added to your list." });
                localStorage.removeItem('qa-employee-task'); // Consume the task
                return [...prev, newTask];
              }
              return prev;
            });
          }
        } catch (error) {
          console.error("Error parsing QA task from localStorage", error);
          localStorage.removeItem('qa-employee-task');
        }
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
    
    const checkAnnouncement = () => {
        const storedAnnouncement = localStorage.getItem('company-announcement');
        if (storedAnnouncement) {
            setAnnouncement(JSON.parse(storedAnnouncement));
        }
    };
    checkAnnouncement();
    window.addEventListener('storage', checkAnnouncement);
    return () => window.removeEventListener('storage', checkAnnouncement);
  }, [toast]);

  const handleClockIn = () => {
    setIsClockedIn(true);
    setLastClockIn(new Date());
    toast({ title: "Clocked In", description: `You clocked in at ${new Date().toLocaleTimeString()}. Welcome!` });
  };

  const handleClockOut = () => {
    setIsClockedIn(false);
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
  
  const dispatchQaFailure = (itemName: string, result: CompareFoodQualityOutput) => {
    toast({
        variant: "destructive",
        title: "QA Check Failed!",
        description: "Manager and KDS have been notified of the low score."
    });

    const kdsAlertData = {
        itemName,
        score: result.score,
        feedback: result.feedback,
        deviations: result.deviations,
        timestamp: new Date().toISOString(),
    };
    // In a real app, location would be from user context
    const locationId = "Downtown"; 
    localStorage.setItem(`kds-alert-${locationId}`, JSON.stringify(kdsAlertData));
  };


  const handleQaAudit = async () => {
    if (!currentQaTask || !qaAuditPhoto) return;
    
    setIsAuditing(true);
    try {
        const { data, error } = await compareFoodQualityAction({ 
            standardImageUri: currentQaTask.standardImageUrl, 
            actualImageUri: qaAuditPhoto, 
            itemName: currentQaTask.itemToAudit 
        });

        if (error || !data) throw new Error(error || "Could not complete audit.");

        if (data.score >= 7) {
            toast({ title: "QA Check Passed!", description: `Score: ${data.score}/10. Great job!` });
            setQaTasks(prev => prev.filter(t => t.id !== currentQaTask.id));
        } else {
             dispatchQaFailure(currentQaTask.itemToAudit, data);
             setQaTasks(prev => prev.map(t => t.id === currentQaTask.id ? {...t, status: 'Failed', description: `[FAILED] ${t.description}`} : t));
        }
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Audit Failed', description: error.message });
    } finally {
        setIsAuditing(false);
        setQaAuditPhoto(null);
        setCurrentQaTask(null);
        setIsQaTaskDialogOpen(false);
    }
  };
  
  const handleEmergencyOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emergencyItem.trim()) {
        toast({ variant: 'destructive', title: 'Item Needed', description: 'Please describe the item you need to order.' });
        return;
    }
    setIsOrdering(true);
    try {
        const result = await placeEmergencyOrderAction({
            itemDescription: emergencyItem,
            locationName: "Downtown" // In real app, from user context
        });
        if (result.error || !result.data) {
            throw new Error(result.error || "Failed to place order.");
        }
        toast({
            title: "Order Placed!",
            description: result.data.confirmationMessage,
            duration: 10000,
        });
        setIsEmergencyOrderOpen(false);
        setEmergencyItem("");
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Order Failed', description: error.message });
    } finally {
        setIsOrdering(false);
    }
  };

  const mySchedule = allShifts.filter(shift => shift.assignedTo === employeeName);
  const availableShifts = allShifts.filter(shift => shift.status === 'offered' && shift.assignedTo !== employeeName);
  const parseDate = (dateString: string) => { const [year, month, day] = dateString.split('-').map(Number); return new Date(year, month - 1, day); };

  return (
    <TooltipProvider>
    <div className="space-y-6">
       {announcement && (
        <Card className="bg-primary/10 border-primary">
            <CardHeader>
                <CardTitle className="font-headline flex items-center justify-between">
                    <span><Megaphone className="inline-block mr-2 text-primary"/> A Message from the CEO</span>
                    <Button variant="ghost" size="sm" onClick={() => {
                        setAnnouncement(null);
                        localStorage.removeItem('company-announcement');
                    }}>Dismiss</Button>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="font-semibold">{announcement.title}</p>
                <div className="aspect-video w-full rounded-lg overflow-hidden border bg-black">
                    <video src={announcement.videoUrl} controls className="w-full h-full object-cover" />
                </div>
            </CardContent>
        </Card>
       )}
       {directMessage && (
            <Alert variant="destructive" className="bg-accent/10 border-accent/50 text-accent [&>svg]:text-accent">
                <Megaphone className="h-4 w-4" /><AlertTitle>{directMessage.title}</AlertTitle>
                <AlertDescription className="flex justify-between items-center">{directMessage.description}<Button variant="ghost" size="sm" onClick={() => { setDirectMessage(null); localStorage.removeItem('employee-direct-message'); }}>Dismiss</Button></AlertDescription>
            </Alert>
        )}
       <EmployeeServiceAlertWidget />
      
       <Card>
        <CardHeader><CardTitle className="font-headline flex items-center gap-2"><ListTodo /> My Mission for Today</CardTitle><CardDescription>Tasks assigned to you for your current shift. Complete these to maintain our standards.</CardDescription></CardHeader>
        <CardContent><Table><TableHeader><TableRow><TableHead>Task</TableHead><TableHead>Area / Source</TableHead><TableHead>Priority</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
        <TableBody>
            {allCurrentTasks.length > 0 ? allCurrentTasks.map((task) => (
            <TableRow key={task.id} className={task.type === 'qa' ? 'bg-destructive/5' : ''}>
                <TableCell className="font-medium flex items-center gap-2">
                  {task.type === 'qa' && <ShieldCheck className="h-4 w-4 text-destructive" />}
                  {task.type === 'qa' ? task.description : (task as Task).name}
                </TableCell>
                <TableCell>{task.type === 'qa' ? task.source : (task as Task).area}</TableCell>
                <TableCell><Badge variant={task.type === 'qa' || (task as Task).priority === "High" ? "destructive" : "secondary"}>{task.type === 'qa' ? 'High' : (task as Task).priority}</Badge></TableCell>
                <TableCell className="text-right">
                    {task.type === 'qa' ? (
                        <Button size="sm" variant="destructive" onClick={() => handleOpenQaDialog(task as QaTask)} disabled={(task as QaTask).status === 'Failed'}>
                            {(task as QaTask).status === 'Failed' ? 'Failed' : 'Perform Check'}
                        </Button>
                    ) : (
                        <Dialog open={isTaskDialogsOpen[task.id] || false} onOpenChange={(isOpen) => setIsTaskDialogsOpen(prev => ({...prev, [task.id]: isOpen}))}>
                            <DialogTrigger asChild><Button size="sm">Complete Task</Button></DialogTrigger>
                            <DialogContent><DialogHeader><DialogTitle className="font-headline">Complete: {(task as Task).name}</DialogTitle><DialogDescription>Upload a photo as proof of completion. This helps us track our quality standards.</DialogDescription></DialogHeader><PhotoUploader /><DialogFooter><Button type="button" onClick={() => handleCompleteTask(task as Task)}>Submit Completion</Button></DialogFooter></DialogContent>
                        </Dialog>
                    )}
                </TableCell>
            </TableRow>
            )) : <TableRow><TableCell colSpan={4} className="h-24 text-center">No tasks assigned. Great job staying on top of things!</TableCell></TableRow>}
        </TableBody></Table></CardContent>
      </Card>

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

        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Tools & Resources</CardTitle>
                <CardDescription>View your schedule, log issues, and access other resources.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Tabs defaultValue="schedule">
                    <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3">
                        <TabsTrigger value="schedule">Schedule</TabsTrigger>
                        <TabsTrigger value="reporting">Reporting</TabsTrigger>
                        <TabsTrigger value="resources">Resources</TabsTrigger>
                    </TabsList>
                    <TabsContent value="schedule" className="mt-6">
                        <div className="grid lg:grid-cols-2 gap-6">
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base font-semibold">Set Unavailability</CardTitle>
                                        <CardDescription className="text-xs">Click dates to mark them as unavailable.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex flex-col items-center">
                                        <Calendar mode="multiple" selected={unavailableDays} onSelect={setUnavailableDays} className="p-0 border rounded-md"/>
                                        <p className="text-sm text-muted-foreground mt-2">You have marked {unavailableDays?.length || 0} day(s) as unavailable.</p>
                                    </CardContent>
                                </Card>
                                 <Card>
                                    <CardHeader><CardTitle className="font-headline text-lg flex items-center gap-2"><ArrowRightLeft /> Available Shifts</CardTitle><CardDescription>Shifts offered by your colleagues.</CardDescription></CardHeader>
                                    <CardContent><Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Shift</TableHead><TableHead>Offered By</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader><TableBody>{availableShifts.length > 0 ? (availableShifts.map(shift => (<TableRow key={shift.id}><TableCell>{format(parseDate(shift.date), "EEE, MMM dd")}</TableCell><TableCell>{shift.startTime} - {shift.endTime}</TableCell><TableCell>{shift.assignedTo}</TableCell><TableCell className="text-right"><Button size="sm" onClick={() => handleClaimShift(shift.id)}>Claim Shift</Button></TableCell></TableRow>))) : (<TableRow><TableCell colSpan={4} className="text-center h-24 text-muted-foreground">There are no available shifts to claim right now.</TableCell></TableRow>)}</TableBody></Table></CardContent>
                                </Card>
                            </div>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base font-semibold">My Upcoming Shifts</CardTitle>
                                    <CardDescription className="text-xs">Your assigned shifts for the upcoming period.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="border rounded-md">
                                    {mySchedule.length > 0 ? (
                                        <Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Shift</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader><TableBody>{mySchedule.sort((a,b) => a.date.localeCompare(b.date)).map(shift => (<TableRow key={shift.id} className={shift.status === 'offered' ? 'bg-accent/10' : ''}><TableCell className="font-medium">{format(parseDate(shift.date), "EEE, MMM dd")}</TableCell><TableCell>{shift.startTime} - {shift.endTime}</TableCell><TableCell className="text-right">{shift.status === 'offered' ? (<Badge variant="secondary">Offered</Badge>) : (<Button variant="outline" size="sm" onClick={() => handleOfferShift(shift.id)}>Offer</Button>)}</TableCell></TableRow>))}</TableBody></Table>
                                    ) : (
                                        <div className="flex items-center justify-center h-[280px] p-4">
                                            <p className="text-muted-foreground text-center text-sm">Your schedule will appear here once published by the manager.</p>
                                        </div>
                                    )}
                                    </div>
                                </CardContent>
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
                                    <CardTitle className="font-headline text-lg">Completed Tasks Log</CardTitle>
                                    <CardDescription>A record of your completed tasks for this shift.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Task</TableHead>
                                                <TableHead className="text-right">Completed At</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {completedTasks.length > 0 ? completedTasks.map((task) => (
                                                <TableRow key={task.id}>
                                                    <TableCell className="font-medium">{task.type === 'qa' ? task.description : (task as Task).name}</TableCell>
                                                    <TableCell className="text-right text-xs text-muted-foreground">{task.completedAt}</TableCell>
                                                </TableRow>
                                            )) : (
                                                <TableRow><TableCell colSpan={2} className="h-24 text-center text-muted-foreground">No tasks completed yet.</TableCell></TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                            <Card className="md:col-span-2 border-accent bg-accent/5">
                              <CardHeader>
                                  <CardTitle className="font-headline flex items-center gap-2 text-accent"><Zap /> Emergency Order</CardTitle>
                                  <CardDescription>If you run out of a critical item mid-shift, use this to place an automated priority order via the owner's Instacart account.</CardDescription>
                              </CardHeader>
                              <CardContent>
                                  <Dialog open={isEmergencyOrderOpen} onOpenChange={setIsEmergencyOrderOpen}>
                                      <DialogTrigger asChild>
                                          <Button variant="destructive" className="bg-accent hover:bg-accent/90">
                                              <Zap className="mr-2 h-4 w-4" /> Place Emergency Order
                                          </Button>
                                      </DialogTrigger>
                                      <DialogContent>
                                          <DialogHeader>
                                              <DialogTitle className="font-headline">Place Emergency Order</DialogTitle>
                                              <DialogDescription>
                                                  Describe the single most critical item you are out of. The AI will place a priority order. Use only for true emergencies.
                                              </DialogDescription>
                                          </DialogHeader>
                                          <form onSubmit={handleEmergencyOrder} className="space-y-4 py-4">
                                              <div className="grid gap-2">
                                                  <Label htmlFor="emergency-item">What item do you need?</Label>
                                                  <Textarea
                                                      id="emergency-item"
                                                      placeholder="e.g., We are completely out of whole milk for lattes."
                                                      value={emergencyItem}
                                                      onChange={(e) => setEmergencyItem(e.target.value)}
                                                      required
                                                      rows={3}
                                                  />
                                              </div>
                                              <DialogFooter>
                                                  <Button type="submit" disabled={isOrdering} className="bg-accent hover:bg-accent/90">
                                                      {isOrdering ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
                                                      Submit Order to AI
                                                  </Button>
                                              </DialogFooter>
                                          </form>
                                      </DialogContent>
                                  </Dialog>
                              </CardContent>
                          </Card>
                        </div>
                    </TabsContent>
                    <TabsContent value="resources" className="mt-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="font-headline text-lg">Training Center</CardTitle>
                                    <CardDescription>Access training games, materials, and challenges to keep your skills sharp.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button asChild><Link href="/dashboard/training"><BookOpen className="mr-2 h-4 w-4"/> Go to Training Center</Link></Button>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader>
                                    <CardTitle className="font-headline text-lg">Ask the Brain</CardTitle>
                                    <CardDescription>Have a question about a recipe or company policy? Get an instant answer from the AI.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button asChild><Link href="/dashboard/brain"><Edit className="mr-2 h-4 w-4"/> Ask the Company Brain</Link></Button>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
      
      <Dialog open={isQaTaskDialogOpen} onOpenChange={setIsQaTaskDialogOpen}><DialogContent><DialogHeader><DialogTitle className="font-headline">Perform QA Check</DialogTitle><DialogDescription>Take a photo of a freshly made "{currentQaTask?.itemToAudit}" to compare it against the golden standard.</DialogDescription></DialogHeader><div className="py-4 space-y-4"><PhotoUploader onPhotoDataChange={setQaAuditPhoto} /><Alert><AlertCircle className="h-4 w-4" /><AlertTitle>Heads up!</AlertTitle><AlertDescription>If the AI score is too low, your manager and the KDS alarm will be notified automatically.</AlertDescription></Alert></div><DialogFooter><Button onClick={handleQaAudit} disabled={isAuditing || !qaAuditPhoto}>{isAuditing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <ShieldCheck className="mr-2 h-4 w-4"/>}Submit for AI Audit</Button></DialogFooter></DialogContent></Dialog>
    </div>
    </TooltipProvider>
  );
}
