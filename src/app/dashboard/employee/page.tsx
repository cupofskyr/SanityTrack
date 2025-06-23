
"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import PhotoUploader from "@/components/photo-uploader";
import { CheckCircle, AlertTriangle, ListTodo, PlusCircle, CalendarDays, Clock, AlertCircle, Star, Timer, Megaphone, Sparkles, Loader2, User, Phone, Mail, UtensilsCrossed, Languages } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { analyzePhotoIssue } from '@/ai/flows/analyze-photo-issue-flow';
import { translateText } from "@/ai/flows/translate-text-flow";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";


const initialTasks = [
  { id: 1, name: "Clean kitchen floor", area: "Kitchen", priority: "High", status: "Pending" },
  { id: 2, name: "Restock restroom supplies", area: "Restroom", priority: "Medium", status: "Pending" },
  { id: 3, name: "Sanitize all door handles", area: "All Areas", priority: "High", status: "In Progress" },
  { id: 4, name: "Mandatory Team Meeting: Q3 Planning", area: "Main Office", priority: "High", status: "Pending" }
];

const initialCompletedTasks = [
  { id: 4, name: "Empty trash bins", area: "All Areas", completedAt: "2024-05-20 09:00" },
  { id: 5, name: "Wipe down dining tables", area: "Dining Area", completedAt: "2024-05-20 08:30" },
];

const initialIssues = [
  { id: 1, description: "Leaky faucet in men's restroom", status: "Reported" },
  { id: 2, description: "Dining area light flickering", status: "Maintenance Notified" },
];

const initialReviews = [
    { id: 1, rating: 5, comment: "The service was incredibly fast and friendly! The smoothie was delicious.", author: "Happy Customer" },
    { id: 2, rating: 4, comment: "Great place, very clean. My order took a little long, but it was worth the wait.", author: "Visitor" },
    { id: 3, rating: 5, comment: "I love coming here. The staff always remembers my order!", author: "A Regular" },
];

const mealLimit = 2;

const initialBriefing = {
    title: "Let's Make it a Great Tuesday!",
    message: "Great work yesterday everyone! Let's keep the energy high today. Our focus is on guest experience, so let's make sure every customer leaves with a smile.",
    tasks: [
        "Double-check all tables for cleanliness before seating new guests.",
        "Give a friendly greeting to everyone who walks in."
    ]
};

type Shift = {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    assignedTo?: string;
};


export default function EmployeeDashboard() {
  const [tasks, setTasks] = useState(initialTasks);
  const [completedTasks, setCompletedTasks] = useState(initialCompletedTasks);
  const [issues, setIssues] = useState(initialIssues);
  const [reviews, setReviews] = useState(initialReviews);
  
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
  
  const [loggedMeals, setLoggedMeals] = useState<{ id: number; description: string; photoUrl: string | null; }[]>([]);
  const [isMealLogDialogOpen, setIsMealLogDialogOpen] = useState(false);
  const [newMealDescription, setNewMealDescription] = useState("");
  const [newMealPhoto, setNewMealPhoto] = useState<string | null>(null);

  const [directMessage, setDirectMessage] = useState<{title: string, description: string} | null>(null);

  const [briefing, setBriefing] = useState(initialBriefing);
  const [translatedBriefing, setTranslatedBriefing] = useState<{title: string, message: string} | null>(null);
  const [isTranslatingBriefing, setIsTranslatingBriefing] = useState(false);
  
  const [mySchedule, setMySchedule] = useState<Shift[]>([]);
  const employeeName = "John Doe"; // In a real app, this would come from user context

  useEffect(() => {
    // This effect simulates fetching the schedule from a shared source (localStorage)
    const publishedScheduleJSON = localStorage.getItem('published-schedule');
    if (publishedScheduleJSON) {
        const allShifts: Shift[] = JSON.parse(publishedScheduleJSON);
        const userShifts = allShifts.filter(shift => shift.assignedTo === employeeName);
        setMySchedule(userShifts);
    }
  }, []);


  useEffect(() => {
    const pendingIssue = localStorage.getItem('ai-issue-suggestion');
    if (pendingIssue) {
        setNewIssueDescription(pendingIssue);
        setIsReportDialogOpen(true);
        localStorage.removeItem('ai-issue-suggestion');
        toast({
            title: "AI Suggestion Loaded",
            description: "The issue description from the AI Camera has been pre-filled for you."
        });
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
    toast({
      title: "Clocked In",
      description: `You clocked in at ${new Date().toLocaleTimeString()}. Welcome!`,
    });
  };

  const handleClockOut = () => {
    setIsClockedIn(false);
    toast({
      title: "Clocked Out",
      description: `You clocked out at ${new Date().toLocaleTimeString()}. Have a great day!`,
    });
  };

  const handleReportIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIssueDescription.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide a description for the issue.",
      });
      return;
    }
    const newIssue = {
      id: Date.now(), // Use a simple unique ID for now
      description: newIssueDescription,
      status: "Reported",
    };
    setIssues([newIssue, ...issues]);
    setNewIssueDescription("");
    setPhotoForAnalysis(null);
    setIsReportDialogOpen(false);
    toast({
      title: "Issue Reported",
      description: "The new issue has been reported to the manager.",
    });
  };

  const handleAnalyzePhoto = async () => {
      if (!photoForAnalysis) return;
      setIsAnalyzingPhoto(true);
      try {
        const { suggestion } = await analyzePhotoIssue({ photoDataUri: photoForAnalysis });
        setNewIssueDescription(suggestion);
        toast({ title: "AI Analysis Complete", description: "The issue description has been pre-filled." });
      } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'AI Analysis Failed', description: 'Could not analyze the photo.' });
      } finally {
        setIsAnalyzingPhoto(false);
      }
    };

  const handleRequestOvertime = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overtimeReason || !overtimeHours) {
        toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please provide a reason and the number of hours.",
        });
        return;
    }
    setIsOvertimeDialogOpen(false);
    setOvertimeReason("");
    setOvertimeHours("");
    toast({
        title: "Overtime Request Submitted",
        description: `Your request for ${overtimeHours} hour(s) has been sent to the owner for approval.`,
    });
  };

  const handleLogMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMealDescription.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please describe the meal you are logging.",
      });
      return;
    }
    if (!newMealPhoto) {
      toast({
        variant: "destructive",
        title: "Missing Photo",
        description: "Please upload a photo of your meal.",
      });
      return;
    }
    if (loggedMeals.length >= mealLimit) {
        toast({
            variant: "destructive",
            title: "Limit Reached",
            description: `You have already logged ${mealLimit} meals for this shift.`,
        });
        return;
    }
    const newMeal = {
      id: Date.now(),
      description: newMealDescription,
      photoUrl: newMealPhoto,
    };
    setLoggedMeals([...loggedMeals, newMeal]);
    setNewMealDescription("");
    setNewMealPhoto(null);
    setIsMealLogDialogOpen(false);
    toast({
      title: "Meal Logged",
      description: "Your meal has been successfully logged.",
    });
  };

  const handleTranslateBriefing = async () => {
    if (translatedBriefing) {
        setTranslatedBriefing(null);
        return;
    }
    setIsTranslatingBriefing(true);
    try {
        const [titleRes, messageRes] = await Promise.all([
            translateText({ text: briefing.title, targetLanguage: 'Spanish' }),
            translateText({ text: briefing.message, targetLanguage: 'Spanish' })
        ]);
        setTranslatedBriefing({
            title: titleRes.translatedText,
            message: messageRes.translatedText
        });
        toast({
            title: "Briefing Translated",
            description: "The manager's message has been translated to Spanish."
        });
    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Translation Failed', description: 'Could not translate the message.' });
    } finally {
        setIsTranslatingBriefing(false);
    }
  };

  const parseDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };


  return (
    <TooltipProvider>
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
       {directMessage && (
            <Alert variant="destructive" className="lg:col-span-2 bg-accent/10 border-accent/50 text-accent [&>svg]:text-accent">
                <Megaphone className="h-4 w-4" />
                <AlertTitle>{directMessage.title}</AlertTitle>
                <AlertDescription className="flex justify-between items-center">
                    {directMessage.description}
                    <Button variant="ghost" size="sm" onClick={() => {
                        setDirectMessage(null);
                        localStorage.removeItem('employee-direct-message');
                    }}>Dismiss</Button>
                </AlertDescription>
            </Alert>
        )}
      <Tooltip>
        <TooltipTrigger asChild>
           <Card className="lg:col-span-2">
                <CardHeader className="flex-row items-start justify-between">
                    <div>
                        <CardTitle className="font-headline flex items-center gap-2"><Megaphone /> Message from the Manager</CardTitle>
                        <CardDescription>Your manager's daily briefing and focus for the team.</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleTranslateBriefing} disabled={isTranslatingBriefing}>
                        {isTranslatingBriefing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Languages className="mr-2 h-4 w-4" />}
                        {translatedBriefing ? 'Show Original' : 'Translate'}
                    </Button>
                </CardHeader>
                <CardContent>
                    <Alert>
                        <AlertTitle className="font-semibold">{translatedBriefing ? translatedBriefing.title : briefing.title}</AlertTitle>
                        <AlertDescription>
                            <p className="mb-2">{translatedBriefing ? translatedBriefing.message : briefing.message}</p>
                            <p className="font-semibold text-xs mb-1">Today's Focus:</p>
                            <ul className="list-disc list-inside text-xs">
                                {briefing.tasks.map((task, i) => <li key={i}>{task}</li>)}
                            </ul>
                        </AlertDescription>
                    </Alert>
                    <p className="text-xs text-muted-foreground mt-2 text-center">This is an example briefing. Your manager can post new messages daily.</p>
                </CardContent>
            </Card>
        </TooltipTrigger>
        <TooltipContent>
            <p>Check here for daily announcements and focus tasks.</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Card className="lg:col-span-2">
            <CardHeader className="flex-row justify-between items-start">
              <CardTitle className="font-headline flex items-center gap-2"><Clock /> Time Clock</CardTitle>
              <Dialog open={isOvertimeDialogOpen} onOpenChange={setIsOvertimeDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm"><Timer className="mr-2 h-4 w-4"/> Request Overtime</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="font-headline">Request Overtime</DialogTitle>
                        <DialogDescription>
                            All overtime must be approved by the owner. Please provide a reason and duration.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleRequestOvertime}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="overtime-hours">Overtime Hours Requested</Label>
                                <Input
                                id="overtime-hours"
                                type="number"
                                placeholder="e.g., 2"
                                value={overtimeHours}
                                onChange={(e) => setOvertimeHours(e.target.value)}
                                required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="overtime-reason">Reason for Overtime</Label>
                                <Textarea
                                id="overtime-reason"
                                placeholder="e.g., Needed to finish deep cleaning the kitchen after a busy night."
                                value={overtimeReason}
                                onChange={(e) => setOvertimeReason(e.target.value)}
                                required
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Submit for Approval</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-center md:text-left">
                        <p className="text-lg font-semibold">{isClockedIn ? "You are clocked in." : "You are clocked out."}</p>
                        {lastClockIn && isClockedIn && (
                            <p className="text-sm text-muted-foreground">
                                Clocked in at {lastClockIn.toLocaleTimeString()}
                            </p>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleClockIn} disabled={isClockedIn} className="w-32">Clock In</Button>
                        <Button onClick={handleClockOut} disabled={!isClockedIn} variant="destructive" className="w-32">Clock Out</Button>
                    </div>
                </div>
                 <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Manual Clock-In</AlertTitle>
                    <AlertDescription>
                        Automatic location-based clock-in is not possible in web applications due to browser privacy and technical limitations. Please clock in and out manually.
                    </AlertDescription>
                </Alert>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent>
            <p>Clock in and out for every shift here.</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2"><ListTodo /> My Tasks</CardTitle>
              <CardDescription>Tasks assigned to you. Complete them to maintain our standards.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Area</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.name}</TableCell>
                      <TableCell>{task.area}</TableCell>
                      <TableCell>
                        <Badge variant={task.priority === "High" ? "destructive" : "secondary"}>{task.priority}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{task.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">Complete Task</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle className="font-headline">Complete: {task.name}</DialogTitle>
                              <DialogDescription>
                                Upload a photo as proof of completion. This helps us track our quality standards.
                              </DialogDescription>
                            </DialogHeader>
                            <PhotoUploader />
                            <DialogFooter>
                              <Button type="submit" className="bg-primary hover:bg-primary/90">Submit Completion</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent>
            <p>A list of tasks assigned directly to you.</p>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2"><CalendarDays /> My Schedule & Availability</CardTitle>
              <CardDescription>View your upcoming shifts and set your unavailable days for the next scheduling period.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
                <div>
                    <h3 className="font-semibold mb-2 text-sm">Set Unavailability</h3>
                    <div className="rounded-md border">
                        <Calendar
                            mode="multiple"
                            min={0}
                            selected={unavailableDays}
                            onSelect={setUnavailableDays}
                            className="p-0"
                        />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        You have marked {unavailableDays?.length || 0} day(s) as unavailable.
                    </p>
                </div>
                <div>
                    <h3 className="font-semibold mb-2 text-sm">Upcoming Shifts</h3>
                    <div className="border rounded-md p-4 space-y-2 min-h-[290px]">
                        {mySchedule.length > 0 ? (
                           <Table>
                               <TableHeader>
                                   <TableRow>
                                       <TableHead>Date</TableHead>
                                       <TableHead>Shift</TableHead>
                                   </TableRow>
                               </TableHeader>
                               <TableBody>
                                   {mySchedule.sort((a,b) => a.date.localeCompare(b.date)).map(shift => (
                                       <TableRow key={shift.id}>
                                           <TableCell className="font-medium">{format(parseDate(shift.date), "EEE, MMM dd")}</TableCell>
                                           <TableCell>{shift.startTime} - {shift.endTime}</TableCell>
                                       </TableRow>
                                   ))}
                               </TableBody>
                           </Table>
                        ) : (
                             <div className="flex items-center justify-center h-full">
                                <p className="text-muted-foreground text-center text-sm">Your schedule will appear here once published by the manager.</p>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent>
            <p>View your shifts and set days you're unavailable.</p>
        </TooltipContent>
      </Tooltip>

    <Tooltip>
        <TooltipTrigger asChild>
            <Card>
                <CardHeader>
                  <CardTitle className="font-headline flex items-center gap-2"><User /> My Profile</CardTitle>
                  <CardDescription>Your contact information for scheduling and communication.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-2"><User className="h-4 w-4"/> Full Name</span>
                        <span className="font-semibold">{employeeName} (Demo)</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-2"><Mail className="h-4 w-4"/> Email</span>
                        <span className="font-semibold">john.doe@example.com</span>
                    </div>
                     <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-2"><Phone className="h-4 w-4"/> Phone</span>
                        <span className="font-semibold">555-123-4567</span>
                    </div>
                    <Button variant="outline" className="w-full" disabled>Edit Profile</Button>
                </CardContent>
              </Card>
        </TooltipTrigger>
        <TooltipContent><p>Your basic contact information.</p></TooltipContent>
    </Tooltip>

      <Tooltip>
          <TooltipTrigger asChild>
              <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><UtensilsCrossed /> Staff Meal Log</CardTitle>
                    <CardDescription>Log your meals for the shift. Limit: {mealLimit} items.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <div>
                                <p className="text-sm font-medium">Logged Items</p>
                                <p className="text-2xl font-bold">{loggedMeals.length} / {mealLimit}</p>
                            </div>
                            <Dialog open={isMealLogDialogOpen} onOpenChange={setIsMealLogDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button disabled={loggedMeals.length >= mealLimit}>
                                        <PlusCircle className="mr-2 h-4 w-4" /> Log Meal
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle className="font-headline">Log Staff Meal</DialogTitle>
                                        <DialogDescription>
                                            Describe the item(s) you are taking for your meal and upload a photo.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleLogMeal}>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="meal-photo">Photo of Meal</Label>
                                                <PhotoUploader onPhotoDataChange={setNewMealPhoto} />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="meal-description">Meal Description</Label>
                                                <Textarea
                                                    id="meal-description"
                                                    placeholder="e.g., Turkey sandwich and a bag of chips"
                                                    value={newMealDescription}
                                                    onChange={(e) => setNewMealDescription(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit">Log Meal</Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium">Your Logged Meals Today</h4>
                            {loggedMeals.length > 0 ? (
                                <ul className="list-disc list-inside text-sm text-muted-foreground">
                                    {loggedMeals.map(meal => <li key={meal.id}>{meal.description}</li>)}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center pt-2">You haven't logged any meals yet.</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent><p>Log your staff meals for each shift as per company policy.</p></TooltipContent>
      </Tooltip>
      <Tooltip>
          <TooltipTrigger asChild>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2"><CheckCircle /> Completed Recently</CardTitle>
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
                  {completedTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>{task.name}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{task.completedAt}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          </TooltipTrigger>
          <TooltipContent><p>A list of tasks you've recently completed.</p></TooltipContent>
      </Tooltip>

      <Tooltip>
          <TooltipTrigger asChild>
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="font-headline flex items-center gap-2"><AlertTriangle /> Open Issues</CardTitle>
                <CardDescription>Issues you've reported that need attention.</CardDescription>
              </div>
              <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Report Issue</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="font-headline">Report a New Issue</DialogTitle>
                    <DialogDescription>
                      Take a photo or describe the issue you've found. The AI can help generate a description from the photo.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleReportIssue}>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                         <Label>Photo of Issue</Label>
                         <PhotoUploader onPhotoDataChange={setPhotoForAnalysis} />
                      </div>
                      
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={handleAnalyzePhoto}
                        disabled={!photoForAnalysis || isAnalyzingPhoto}
                      >
                        {isAnalyzingPhoto ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4 text-primary" />}
                        Analyze Photo to Generate Description
                      </Button>
    
                      <div className="grid gap-2">
                        <Label htmlFor="issue-description">Issue Description</Label>
                        <Textarea
                          id="issue-description"
                          placeholder="e.g., Water puddle near the entrance. Or, let the AI generate this from a photo."
                          value={newIssueDescription}
                          onChange={(e) => setNewIssueDescription(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Submit Report</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
            <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {issues.map((issue) => (
                    <TableRow key={issue.id}>
                      <TableCell>{issue.description}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">{issue.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          </TooltipTrigger>
          <TooltipContent><p>Report new issues you find in the workplace.</p></TooltipContent>
      </Tooltip>
      <Tooltip>
          <TooltipTrigger asChild>
          <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><Star /> Recent Customer Feedback</CardTitle>
                <CardDescription>Approved reviews from recent guests, curated by management.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {reviews.length > 0 ? reviews.map((review) => (
                <div key={review.id} className="p-3 border rounded-lg bg-muted/50">
                    <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                        key={i}
                        className={`h-4 w-4 ${i < review.rating ? 'text-accent' : 'text-muted-foreground/30'}`}
                        fill="currentColor"
                        />
                    ))}
                    </div>
                    <blockquote className="text-sm italic border-l-2 pl-3">"{review.comment}"</blockquote>
                    <p className="text-xs text-right text-muted-foreground mt-2">- {review.author}</p>
                </div>
                )) : (
                     <div className="text-center text-sm text-muted-foreground p-4">No reviews have been featured by management yet.</div>
                )}
            </CardContent>
        </Card>
          </TooltipTrigger>
          <TooltipContent><p>See what customers are saying about their experience.</p></TooltipContent>
      </Tooltip>

    </div>
    </TooltipProvider>
  );
}
