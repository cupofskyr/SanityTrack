
"use client"
import { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, FileText, TrendingUp, ShieldCheck, PlusCircle, FileCheck, Map, Link as LinkIcon, Sparkles, Wand2, Loader2, Trash2, Pencil, Mail, BrainCircuit, MessageSquare, Check, X, ThumbsUp, Send, Camera, Clipboard, Printer } from "lucide-react";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Textarea } from '@/components/ui/textarea';
import { processInspectionReport } from '@/ai/flows/process-inspection-report-flow';
import { type ProcessInspectionReportOutput } from '@/ai/schemas/inspection-report-schemas';
import { generateInquiry, type GenerateInquiryOutput } from '@/ai/flows/generate-inquiry-flow';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { analyzeIssue, type AnalyzeIssueOutput } from '@/ai/flows/analyze-issue-flow';
import PhotoUploader from '@/components/photo-uploader';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';

const ComplianceChart = dynamic(() => import('@/components/compliance-chart'), { 
    ssr: false,
    loading: () => <Skeleton className="h-[250px] w-full" />
});

const complianceData = [
  { month: "Jan", score: 82, jurisdiction: "Downtown" },
  { month: "Feb", score: 85, jurisdiction: "Downtown" },
  { month: "Mar", score: 91, jurisdiction: "Downtown" },
  { month: "Apr", score: 88, jurisdiction: "Uptown" },
  { month: "May", score: 94, jurisdiction: "Uptown" },
  { month: "Jun", score: 92, jurisdiction: "Uptown" },
];

const initialReports = [
  { id: 1, issue: "Water puddle near entrance (Unresolved)", location: "Downtown", date: "2024-05-21", status: "Action Taken", jurisdiction: "Downtown", owner: "Alex Ray", source: 'Guest Report', resolutionNotes: "Manager Alex Ray has mopped the area and placed a 'Wet Floor' sign. Maintenance has been called to check for a roof leak." },
  { id: 4, issue: "Strange smell from vent (Unresolved)", location: "Uptown", date: "2024-05-18", status: "Reported", jurisdiction: "Uptown", owner: "Casey Lee", source: 'Guest Report' },
];

type Report = {
    id: number;
    issue: string;
    location: string;
    date: string;
    status: string;
    jurisdiction: string;
    owner: string;
    source: 'Guest Report' | 'Inspector Filed';
    resolutionNotes?: string;
    aiAnalysis?: AnalyzeIssueOutput;
};


type ComplianceTask = {
    id: number;
    description: string;
    frequency: string;
    type: 'Mandatory' | 'Optional' | 'Manager Suggestion';
    location?: string;
    status: 'Approved' | 'Pending Approval';
    source: string;
    lastCompleted?: {
        date: string;
        photoUrl: string;
    }
};

export default function HealthDeptDashboard() {
  const { toast } = useToast();
  const [recentReports, setRecentReports] = useState<Report[]>(initialReports);
  const [complianceTasks, setComplianceTasks] = useState<ComplianceTask[]>([
    { id: 1, description: "Weekly restroom deep clean", frequency: "Weekly", type: "Mandatory", location: "All", status: "Approved", source: "Health Dept.", lastCompleted: { date: '2024-07-25', photoUrl: 'https://placehold.co/600x400.png' } },
    { id: 2, description: "Monthly fire safety check", frequency: "Monthly", type: "Mandatory", location: "All", status: "Approved", source: "Health Dept." },
    { id: 3, description: "Verify temperature logs for all coolers", frequency: "Daily", type: "Mandatory", location: "Downtown", status: "Approved", source: "Health Dept.", lastCompleted: { date: '2024-07-26', photoUrl: 'https://placehold.co/600x400.png'} },
    { id: 4, description: 'Check sanitizer concentration daily', frequency: 'Daily', type: 'Manager Suggestion', location: 'Downtown', status: 'Pending Approval', source: 'Alex Ray (Manager)' },
  ]);
  
  const [linkedJurisdictions, setLinkedJurisdictions] = useState(["Downtown", "Uptown"]);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('All');
  const [newEstablishmentCode, setNewEstablishmentCode] = useState('');

  // State for AI Report Processor
  const [reportNotes, setReportNotes] = useState('');
  const [reportLocation, setReportLocation] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingResult, setProcessingResult] = useState<ProcessInspectionReportOutput | null>(null);
  
  // State for task management dialogs
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<{ id: number | null; description: string; frequency: string; type: ComplianceTask['type']; location: string; status: ComplianceTask['status']; source: string; }>({
    id: null,
    description: '',
    frequency: '',
    type: 'Mandatory',
    location: 'All',
    status: 'Approved',
    source: 'Health Dept.',
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<ComplianceTask | null>(null);
  
  // State for AI Inquiry Dialog
  const [isContactOwnerDialogOpen, setContactOwnerDialogOpen] = useState(false);
  const [selectedReportForContact, setSelectedReportForContact] = useState<Report | null>(null);
  const [aiMessage, setAiMessage] = useState<GenerateInquiryOutput | null>(null);
  const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);
  
  // State for Investigation Dialog
  const [isInvestigateDialogOpen, setIsInvestigateDialogOpen] = useState(false);
  const [selectedReportForInvestigation, setSelectedReportForInvestigation] = useState<Report | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // State for Compliance Task Review Dialog
  const [isReviewTaskDialogOpen, setIsReviewTaskDialogOpen] = useState(false);
  const [taskToReview, setTaskToReview] = useState<ComplianceTask | null>(null);
  const [inspectorComments, setInspectorComments] = useState('');
  
  // State for Report Dialog
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);


  useEffect(() => {
    const pendingInvestigation = localStorage.getItem('ai-investigation-suggestion');
    if (pendingInvestigation) {
        setReportNotes(pendingInvestigation);
        localStorage.removeItem('ai-investigation-suggestion');
        toast({
            title: "AI Suggestion Loaded",
            description: "The description from the AI Camera has been added to the Inspection Notes."
        });
        // Scroll to the processor card
        document.getElementById('ai-report-processor-card')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [toast]);

  const handleLinkEstablishment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEstablishmentCode.trim()) {
        toast({
            variant: "destructive",
            title: "Invalid Code",
            description: "Please enter a valid establishment code.",
        });
        return;
    }
    // Simulate linking
    const newJurisdiction = `${newEstablishmentCode.trim()}`;
    if (!linkedJurisdictions.includes(newJurisdiction)) {
        setLinkedJurisdictions([...linkedJurisdictions, newJurisdiction]);
        setSelectedJurisdiction(newJurisdiction); // Switch to the new one
        toast({
            title: "Establishment Linked!",
            description: `You now have access to ${newEstablishmentCode.trim()}.`,
        });
        setNewEstablishmentCode('');
    } else {
         toast({
            variant: "secondary",
            title: "Already Linked",
            description: `This establishment is already in your file.`,
        });
    }
  };
  
  const handleOpenDialog = (task: ComplianceTask | null) => {
    if (task) {
        // Can't edit `lastCompleted` here, so we omit it
        const { lastCompleted, ...editableTask } = task;
        setCurrentTask(editableTask);
    } else {
        setCurrentTask({ id: null, description: '', frequency: '', type: 'Mandatory', location: 'All', status: 'Approved', source: 'Health Dept.' });
    }
    setIsTaskDialogOpen(true);
  };

  const handleSaveTask = () => {
    if (!currentTask.description || !currentTask.frequency) {
        toast({
            variant: 'destructive',
            title: 'Missing Information',
            description: 'Please fill out all task fields.',
        });
        return;
    }

    if (currentTask.id) { // Editing
        setComplianceTasks(complianceTasks.map(t => (t.id === currentTask.id ? { ...t, ...currentTask } : t)));
        toast({ title: 'Task Updated', description: `"${currentTask.description}" has been updated.` });
    } else { // Adding
        const newId = complianceTasks.length > 0 ? Math.max(...complianceTasks.map(t => t.id)) + 1 : 1;
        setComplianceTasks([{ ...currentTask, id: newId }, ...complianceTasks]);
        toast({ title: 'Task Added', description: `"${currentTask.description}" has been created.` });
    }
    setIsTaskDialogOpen(false);
  };
  
  const handleDeleteClick = (task: ComplianceTask) => {
    setTaskToDelete(task);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (taskToDelete) {
        setComplianceTasks(complianceTasks.filter(t => t.id !== taskToDelete.id));
        toast({
            variant: 'secondary',
            title: 'Task Deleted',
            description: `"${taskToDelete.description}" has been deleted.`,
        });
    }
    setIsDeleteDialogOpen(false);
    setTaskToDelete(null);
  };

  const handleProcessReport = async () => {
    if (!reportNotes.trim() || !reportLocation) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please provide inspection notes and select a location.',
      });
      return;
    }
    setIsProcessing(true);
    setProcessingResult(null);
    try {
      const input = {
        inspectionNotes: reportNotes,
        locationName: reportLocation,
        inspectionDate: format(new Date(), 'yyyy-MM-dd'),
      };
      const result = await processInspectionReport(input);
      setProcessingResult(result);
      toast({
        title: 'AI Processing Complete',
        description: 'Review the generated tasks below and send them to the owner when ready.',
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: 'Could not process the inspection report.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendAiTasks = () => {
      if (!processingResult) return;
      toast({
          title: "Tasks Sent to Owner",
          description: "The immediate action items have been sent to the business owner."
      });
      // Here you would typically also clear the results or update state
      setProcessingResult(null);
      setReportNotes('');
  }


  const filteredReports = useMemo(() => {
    if (selectedJurisdiction === 'All') return recentReports;
    return recentReports.filter(report => report.jurisdiction === selectedJurisdiction);
  }, [selectedJurisdiction, recentReports]);
  
  const filteredComplianceData = useMemo(() => {
    if (selectedJurisdiction === 'All') {
        const aggregatedByMonth: { [key: string]: { totalScore: number; count: number } } = {};
        complianceData.forEach(item => {
            if (!aggregatedByMonth[item.month]) {
                aggregatedByMonth[item.month] = { totalScore: 0, count: 0 };
            }
            aggregatedByMonth[item.month].totalScore += item.score;
            aggregatedByMonth[item.month].count += 1;
        });

        return Object.keys(aggregatedByMonth).map(month => ({
            month,
            score: Math.round(aggregatedByMonth[month].totalScore / aggregatedByMonth[month].count),
        }));
    }
    return complianceData.filter(data => data.jurisdiction === selectedJurisdiction);
  }, [selectedJurisdiction]);
  
  const handleOpenInvestigateDialog = async (report: Report) => {
    setSelectedReportForInvestigation(report);
    setIsInvestigateDialogOpen(true);

    const statusesToKeep = ["Under Investigation", "Resolved", "No Action Needed"];
    if (!statusesToKeep.includes(report.status)) {
        setRecentReports(reports => reports.map(r => r.id === report.id ? { ...r, status: 'Under Investigation' } : r));
    }
    
    if (!report.aiAnalysis) {
        setIsAnalyzing(true);
        try {
            const result = await analyzeIssue({ description: report.issue });
            setRecentReports(reports => reports.map(r => 
                r.id === report.id ? { ...r, aiAnalysis: result } : r
            ));
            setSelectedReportForInvestigation(prev => prev ? {...prev, aiAnalysis: result} : null);
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'AI Analysis Failed',
                description: 'Could not get an analysis for this issue.',
            });
        } finally {
            setIsAnalyzing(false);
        }
    }
  };

  const handleOpenContactOwnerDialog = async (report: Report) => {
    setSelectedReportForContact(report);
    setContactOwnerDialogOpen(true);
    setIsGeneratingMessage(true);
    setAiMessage(null);
    try {
        const result = await generateInquiry({
            guestReport: report.issue,
            locationName: report.location,
            ownerName: report.owner,
        });
        setAiMessage(result);
    } catch (error) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: 'AI Error',
            description: 'Could not generate the message.',
        });
    } finally {
        setIsGeneratingMessage(false);
    }
  };

  const handleSendMessageAndCreateTask = () => {
    if (!selectedReportForContact) return;
    setContactOwnerDialogOpen(false);
    toast({
        title: "Message Sent & Task Created",
        description: `The owner of ${selectedReportForContact.location} has been notified and a mandatory task was created.`,
    });
    // In a real app, this would also trigger a database update to create the task.
    setRecentReports(reports => reports.map(r => r.id === selectedReportForContact.id ? { ...r, status: 'Owner Notified' } : r));
  };
  
  const handleStatusChange = (reportId: number, newStatus: string) => {
    setRecentReports(reports => reports.map(r => 
        r.id === reportId ? { ...r, status: newStatus } : r
    ));
    setSelectedReportForInvestigation(prev => prev ? { ...prev, status: newStatus } : null);
    toast({
        title: "Status Updated",
        description: `The report status has been changed to "${newStatus}".`,
    });
  };

  const handleApproveTask = (taskId: number) => {
    setComplianceTasks(tasks => tasks.map(t => t.id === taskId ? { ...t, status: 'Approved', type: 'Mandatory' } : t));
    toast({
        title: "Task Approved",
        description: "The manager's suggested task has been added to the compliance list."
    });
  };

  const handleRejectTask = (taskId: number) => {
    setComplianceTasks(tasks => tasks.filter(t => t.id !== taskId));
    toast({
        variant: 'secondary',
        title: "Task Rejected",
        description: "The manager's suggestion has been removed."
    });
  };

  const handleOpenReviewDialog = (task: ComplianceTask) => {
      setTaskToReview(task);
      setInspectorComments(''); // Reset comments
      setIsReviewTaskDialogOpen(true);
  }

  const handleSaveReview = () => {
      if (!taskToReview) return;
      toast({
          title: "Review Saved",
          description: `Your comments for "${taskToReview.description}" have been logged.`
      });
      // In a real app, this would save the comment to a database.
      setIsReviewTaskDialogOpen(false);
      setTaskToReview(null);
  }
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <TooltipProvider>
    <div className="space-y-6">
      <Tooltip>
        <TooltipTrigger asChild>
          <Card>
            <CardHeader>
              <CardTitle className='font-headline flex items-center gap-2'><Map /> Jurisdiction Selector</CardTitle>
              <CardDescription>Select a jurisdiction to view compliance data for specific locations.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-w-xs">
                <Select value={selectedJurisdiction} onValueChange={setSelectedJurisdiction}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Jurisdiction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Jurisdictions</SelectItem>
                    {linkedJurisdictions.map(j => <SelectItem key={j} value={j}>{j}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent><p>Filter the dashboard view by a specific location or view all.</p></TooltipContent>
      </Tooltip>
      
      <Alert>
        <ShieldCheck className="h-4 w-4" />
        <AlertTitle className="font-bold">Scoped Access View</AlertTitle>
        <CardDescription>
            In a real-world application, each Health Department agent would only see the locations and data assigned to their specific jurisdiction. This simulation allows you to switch between different jurisdictional views.
        </CardDescription>
      </Alert>

      <Tooltip>
        <TooltipTrigger asChild>
          <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><LinkIcon /> Link New Establishment</CardTitle>
                <CardDescription>Enter the code provided by the business owner to link their location to your jurisdiction file.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleLinkEstablishment} className="flex flex-col sm:flex-row gap-2">
                    <Input 
                        placeholder="Enter Establishment Code from owner" 
                        value={newEstablishmentCode} 
                        onChange={(e) => setNewEstablishmentCode(e.target.value)} 
                        required
                    />
                    <Button type="submit" className="w-full sm:w-auto">Link Location</Button>
                </form>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent><p>Add a new business to your file using their unique inspection code.</p></TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2"><FileText /> Monthly Reporting</CardTitle>
              <CardDescription>Generate a printable report of this month's activities for your records or for review.</CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
                <DialogTrigger asChild>
                  <Button><Printer className="mr-2 h-4 w-4" /> Generate Jurisdiction Report</Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle className="font-headline text-2xl">Monthly Jurisdiction Report</DialogTitle>
                    <DialogDescription>
                      Summary for {selectedJurisdiction} - {format(new Date(), 'MMMM yyyy')}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4 space-y-6">
                    <Card>
                      <CardHeader><CardTitle className="text-lg">Compliance Overview</CardTitle></CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader><TableRow><TableHead>Metric</TableHead><TableHead className="text-right">Value</TableHead></TableRow></TableHeader>
                          <TableBody>
                            <TableRow><TableCell>Average Compliance Score</TableCell><TableCell className="text-right font-semibold">{filteredComplianceData.reduce((acc, curr) => acc + curr.score, 0) / (filteredComplianceData.length || 1)}%</TableCell></TableRow>
                            <TableRow><TableCell>Total Reports Processed</TableCell><TableCell className="text-right font-semibold">{filteredReports.length}</TableCell></TableRow>
                            <TableRow><TableCell>New Compliance Rules Added</TableCell><TableCell className="text-right font-semibold">{complianceTasks.filter(t => t.source === 'Health Dept.').length}</TableCell></TableRow>
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader><CardTitle className="text-lg">Processed Reports Summary</CardTitle></CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader><TableRow><TableHead>Issue</TableHead><TableHead>Location</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                          <TableBody>
                            {filteredReports.map(report => (
                              <TableRow key={report.id}><TableCell>{report.issue}</TableCell><TableCell>{report.location}</TableCell><TableCell><Badge variant={report.status === 'Under Investigation' ? 'destructive' : 'outline'}>{report.status}</Badge></TableCell></TableRow>
                            ))}
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
                        In a production app, this report could be automatically generated and emailed to you monthly.
                      </AlertDescription>
                    </Alert>
                    <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Print Report</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent><p>Generate a printable report of the month's activities for your records.</p></TooltipContent>
      </Tooltip>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Compliance</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92.5%</div>
            <p className="text-xs text-muted-foreground">+2.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open High-Priority Issues</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredReports.filter(r => r.status === 'Under Investigation').length}</div>
            <p className="text-xs text-muted-foreground">Immediate attention required</p>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Escalated Guest Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredReports.length}</div>
            <p className="text-xs text-muted-foreground">in {selectedJurisdiction}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2"><TrendingUp /> Compliance Trend for {selectedJurisdiction}</CardTitle>
          <CardDescription>Monthly compliance scores based on completed tasks and resolved issues.</CardDescription>
        </CardHeader>
        <CardContent>
          <ComplianceChart data={filteredComplianceData} />
        </CardContent>
      </Card>
      
      <Tooltip>
        <TooltipTrigger asChild>
            <Card className="border-primary bg-primary/5" id="ai-report-processor-card">
            <CardHeader>
              <CardTitle className="font-headline text-primary flex items-center gap-2"><Wand2 /> AI Inspection Report Processor</CardTitle>
              <CardDescription>
                Paste your inspection notes below. The AI will extract actionable tasks. Review the suggestions, then send them to the business owner.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 <div className="md:col-span-3 grid gap-2">
                  <Label htmlFor="inspection-notes">Inspection Notes</Label>
                  <Textarea id="inspection-notes" placeholder="e.g., Visited on 6/1. Back storage area had boxes blocking the hand-washing sink. Walk-in freezer door seal is torn. Observed employee not washing hands after handling trash. Otherwise, temps were good." value={reportNotes} onChange={(e) => setReportNotes(e.target.value)} required rows={4}/>
                </div>
                 <div className="grid gap-2">
                  <Label htmlFor="report-location">Location</Label>
                  <Select value={reportLocation} onValueChange={setReportLocation} required>
                    <SelectTrigger id="report-location">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {linkedJurisdictions.map(j => <SelectItem key={j} value={j}>{j}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
               <Button onClick={handleProcessReport} disabled={isProcessing} className="w-full md:w-auto">
                    {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Generate Tasks with AI
                </Button>
                {processingResult && (
                  <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm">Immediate Tasks for Owner</h4>
                          {processingResult.immediateTasks.length > 0 ? (
                            <ul className="list-disc list-inside text-sm text-muted-foreground bg-background/50 p-3 rounded-md">
                              {processingResult.immediateTasks.map((task, i) => <li key={i}>{task}</li>)}
                            </ul>
                          ) : <p className="text-sm text-muted-foreground italic">No immediate tasks generated.</p>}
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm">Suggested New Recurring Tasks</h4>
                          {processingResult.suggestedRecurringTasks.length > 0 ? (
                            <ul className="list-disc list-inside text-sm text-muted-foreground bg-background/50 p-3 rounded-md">
                              {processingResult.suggestedRecurringTasks.map((task, i) => <li key={i}>{task.description} ({task.frequency})</li>)}
                            </ul>
                          ) : <p className="text-sm text-muted-foreground italic">No new task suggestions.</p>}
                        </div>
                      </div>
                      <Button onClick={handleSendAiTasks} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                        <Send className="mr-2 h-4 w-4"/>
                        Confirm and Send Tasks to Owner
                      </Button>
                  </div>
                )}
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent><p>Paste raw notes here and let AI extract actionable tasks.</p></TooltipContent>
      </Tooltip>


      <Tooltip>
        <TooltipTrigger asChild>
            <Card>
            <CardHeader>
              <CardTitle className="font-headline">Guest & Inspector Reports for {selectedJurisdiction}</CardTitle>
            </CardHeader>
            <CardContent>
               <Alert className="mb-4">
                  <ShieldCheck className="h-4 w-4" />
                  <AlertTitle>Escalation Policy</AlertTitle>
                  <AlertDescription>
                      Guest reports are only shown here after the business owner has been notified and given a grace period (e.g., 48 hours) to resolve the issue. This view represents escalated, unresolved issues.
                  </AlertDescription>
              </Alert>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Issue</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.length > 0 ? filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.issue}</TableCell>
                      <TableCell>{report.location}</TableCell>
                      <TableCell><Badge variant="outline">{report.source}</Badge></TableCell>
                      <TableCell>{report.date}</TableCell>
                      <TableCell>
                        <Badge variant={report.status === 'Under Investigation' || report.status === 'Reported' ? 'destructive' : 'outline'}>{report.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                         <Button size="sm" variant="outline" onClick={() => handleOpenInvestigateDialog(report)}>
                            <AlertCircle className="mr-2 h-4 w-4" />
                            Investigate
                         </Button>
                         <Button size="sm" onClick={() => handleOpenContactOwnerDialog(report)}>
                            <Mail className="mr-2 h-4 w-4" />
                            Contact Owner
                         </Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        No escalated reports found for the "{selectedJurisdiction}" jurisdiction.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent><p>An escalated queue of unresolved issues reported by guests or inspectors.</p></TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
            <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="font-headline flex items-center gap-2"><FileCheck /> Defined Compliance Tasks</CardTitle>
                <CardDescription>
                    This is the master list of all recurring compliance tasks. You can review photo proof of completion and add comments.
                </CardDescription>
              </div>
               <Button onClick={() => handleOpenDialog(null)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New Task
                </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[35%]">Description</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Last Completed</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complianceTasks.length > 0 ? (
                    complianceTasks.map((task) => (
                      <TableRow key={task.id} className={task.status === 'Pending Approval' ? 'bg-primary/5' : ''}>
                        <TableCell className="font-medium">{task.description}</TableCell>
                        <TableCell>{task.location}</TableCell>
                        <TableCell>{task.frequency}</TableCell>
                         <TableCell>
                          {task.lastCompleted ? (
                            <div className="flex items-center gap-2">
                               <span>{task.lastCompleted.date}</span>
                               <Button size="sm" variant="outline" onClick={() => handleOpenReviewDialog(task)}>Review</Button>
                            </div>
                          ) : (
                              <span className="text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={task.status === 'Approved' ? 'default' : 'secondary'}>{task.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            {task.status === 'Approved' ? (
                                <>
                                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(task)}>
                                        <Pencil className="h-4 w-4" />
                                        <span className="sr-only">Edit Task</span>
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(task)}>
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Remove Task</span>
                                    </Button>
                                </>
                            ) : (
                                 <div className="flex justify-end gap-2">
                                    <Button size="sm" onClick={() => handleApproveTask(task.id)}>
                                        <Check className="mr-2 h-4 w-4" /> Approve
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => handleRejectTask(task.id)}>
                                        <X className="mr-2 h-4 w-4" /> Reject
                                    </Button>
                                </div>
                            )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                        No compliance tasks defined yet. Click "Add New Task" to begin.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent><p>The master list of all recurring tasks for establishments in your jurisdiction.</p></TooltipContent>
      </Tooltip>

      {/* Add/Edit Task Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="font-headline">{currentTask.id ? 'Edit Compliance Task' : 'Add New Compliance Task'}</DialogTitle>
                <DialogDescription>
                    {currentTask.id ? 'Modify the details of this task.' : 'Define new weekly or monthly tasks for establishments to follow.'}
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
                <div className="grid gap-2">
                    <Label htmlFor="task-description">Task Description</Label>
                    <Input id="task-description" placeholder="e.g., Verify all fire extinguishers are certified" value={currentTask.description} onChange={(e) => setCurrentTask({ ...currentTask, description: e.target.value })} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="frequency">Frequency</Label>
                        <Select value={currentTask.frequency} onValueChange={(val) => setCurrentTask({ ...currentTask, frequency: val })} required>
                        <SelectTrigger id="frequency">
                            <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Daily">Daily</SelectItem>
                            <SelectItem value="Weekly">Weekly</SelectItem>
                            <SelectItem value="Monthly">Monthly</SelectItem>
                        </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="task-location">For Location</Label>
                        <Select value={currentTask.location} onValueChange={(val) => setCurrentTask({ ...currentTask, location: val || 'All' })} required>
                        <SelectTrigger id="task-location">
                            <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Jurisdictions</SelectItem>
                            {linkedJurisdictions.map(j => <SelectItem key={j} value={j}>{j}</SelectItem>)}
                        </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="grid gap-2">
                    <Label>Type</Label>
                    <RadioGroup value={currentTask.type} onValueChange={(val) => setCurrentTask({ ...currentTask, type: val as ComplianceTask['type'] })} className="flex items-center gap-4 pt-2">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Mandatory" id="mandatory" />
                        <Label htmlFor="mandatory" className="font-normal">Mandatory</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Optional" id="optional" />
                        <Label htmlFor="optional" className="font-normal">Optional</Label>
                    </div>
                    </RadioGroup>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveTask}>Save Task</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the compliance task: <span className="font-semibold">"{taskToDelete?.description}"</span>.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Contact Owner AI Dialog */}
      <Dialog open={isContactOwnerDialogOpen} onOpenChange={setContactOwnerDialogOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle className='font-headline'>Contact Location Owner</DialogTitle>
                  <DialogDescription>
                    The AI will generate a professional message regarding the issue: "{selectedReportForContact?.issue}". You can edit it before sending.
                  </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                  {isGeneratingMessage ? (
                       <div className="flex items-center justify-center p-8 space-x-2">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            <p className="text-muted-foreground">AI is drafting the message...</p>
                        </div>
                  ) : aiMessage ? (
                      <div className="space-y-4">
                          <div className="grid gap-2">
                              <Label htmlFor="ai-subject">Email Subject</Label>
                              <Input id="ai-subject" value={aiMessage.subject} readOnly/>
                          </div>
                          <div className="grid gap-2">
                              <Label htmlFor="ai-message">Message Body</Label>
                              <Textarea id="ai-message" defaultValue={aiMessage.messageBody} rows={8}/>
                          </div>
                      </div>
                  ) : (
                      <p className="text-destructive text-center">Failed to generate a message.</p>
                  )}
              </div>
              <DialogFooter>
                  <Button variant="secondary" onClick={() => setContactOwnerDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSendMessageAndCreateTask} disabled={isGeneratingMessage || !aiMessage}>
                      Send Message & Create Task
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
      
      {/* Investigate Report Dialog */}
        <Dialog open={isInvestigateDialogOpen} onOpenChange={setIsInvestigateDialogOpen}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="font-headline">Investigate Guest Report</DialogTitle>
                    <DialogDescription>
                        Review the details of the report from {selectedReportForInvestigation?.location}.
                    </DialogDescription>
                </DialogHeader>
                {selectedReportForInvestigation && (
                    <div className="py-4 space-y-4">
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label className="text-right text-muted-foreground">Location</Label>
                            <p className="col-span-2 font-semibold">{selectedReportForInvestigation.location}</p>
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label className="text-right text-muted-foreground">Reported Date</Label>
                            <p className="col-span-2">{selectedReportForInvestigation.date}</p>
                        </div>
                        <div className="grid gap-2">
                            <Label>Reported Issue</Label>
                            <div className="border rounded-md p-3 bg-muted/50">
                                <p className="text-sm font-semibold">{selectedReportForInvestigation.issue}</p>
                            </div>
                        </div>
                        <Separator/>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-muted-foreground"><BrainCircuit className="h-4 w-4" /> AI Analysis</Label>
                            {isAnalyzing ? (
                                <div className="flex items-center justify-center p-4"><Loader2 className="h-5 w-5 animate-spin" /></div>
                            ) : selectedReportForInvestigation.aiAnalysis ? (
                                <Alert>
                                    <AlertTitle>Urgency: {selectedReportForInvestigation.aiAnalysis.urgency}</AlertTitle>
                                    <AlertDescription>
                                        <p><strong>Category:</strong> {selectedReportForInvestigation.aiAnalysis.category}</p>
                                        <p><strong>Suggested Action:</strong> {selectedReportForInvestigation.aiAnalysis.suggestedAction}</p>
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                <p className="text-sm text-muted-foreground italic p-4 text-center">No AI analysis available.</p>
                            )}
                        </div>
                         <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-muted-foreground"><MessageSquare className="h-4 w-4" /> Manager's Resolution Notes</Label>
                            <div className="border rounded-md p-3 bg-muted/50 text-sm min-h-[60px]">
                                {selectedReportForInvestigation.resolutionNotes ? (
                                    <p>{selectedReportForInvestigation.resolutionNotes}</p>
                                ) : (
                                    <p className="italic text-muted-foreground">No resolution notes have been submitted by the manager yet.</p>
                                )}
                            </div>
                        </div>
                         <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor='status-select' className="text-right text-muted-foreground">Update Status</Label>
                            <div className="col-span-2">
                                <Select 
                                    value={selectedReportForInvestigation.status}
                                    onValueChange={(newStatus) => handleStatusChange(selectedReportForInvestigation.id, newStatus)}
                                >
                                    <SelectTrigger id="status-select">
                                        <SelectValue placeholder="Change status..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Reported">Reported</SelectItem>
                                        <SelectItem value="Under Investigation">Under Investigation</SelectItem>
                                        <SelectItem value="Action Taken">Action Taken</SelectItem>
                                        <SelectItem value="Resolved">Resolved</SelectItem>
                                        <SelectItem value="No Action Needed">No Action Needed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                )}
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsInvestigateDialogOpen(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Review Compliance Task Dialog */}
        <Dialog open={isReviewTaskDialogOpen} onOpenChange={setIsReviewTaskDialogOpen}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="font-headline">Review Completed Task</DialogTitle>
                    <DialogDescription>
                        Review the evidence for "{taskToReview?.description}" and add comments if necessary.
                    </DialogDescription>
                </DialogHeader>
                {taskToReview && (
                    <div className="py-4 space-y-4">
                        <div>
                            <Label className="text-sm text-muted-foreground">Photo Proof of Completion</Label>
                            <div className="mt-2">
                                <PhotoUploader readOnly initialPreview={{ url: taskToReview.lastCompleted!.photoUrl, name: 'completion.png'}} />
                            </div>
                        </div>
                         <div>
                            <Label htmlFor="inspector-comments">Your Comments (Optional)</Label>
                            <Textarea
                                id="inspector-comments"
                                placeholder="e.g., Looks good. Please ensure the area behind the equipment is also cleaned next time."
                                value={inspectorComments}
                                onChange={(e) => setInspectorComments(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>
                )}
                <DialogFooter>
                    <Button variant="secondary" onClick={() => setIsReviewTaskDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveReview}>Save Review</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    </div>
    </TooltipProvider>
  );
}

    