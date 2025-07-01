"use client"
import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, FileText, ShieldCheck, PlusCircle, FileCheck, Mail, Wand2, Loader2, Trash2, Pencil, Send, MessageSquare, Check, X } from "lucide-react";
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
import { processInspectionReportAction, generateInquiryAction, analyzeIssueAction } from '@/app/actions';
import type { AnalyzeIssueOutput } from '@/ai/schemas/issue-analysis-schemas';
import type { ProcessInspectionReportOutput } from '@/ai/schemas/inspection-report-schemas';
import type { GenerateInquiryOutput } from '@/ai/schemas/inquiry-generation-schemas';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PhotoUploader from '@/components/photo-uploader';

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
  
  const [isContactOwnerDialogOpen, setContactOwnerDialogOpen] = useState(false);
  const [selectedReportForContact, setSelectedReportForContact] = useState<Report | null>(null);
  const [aiMessage, setAiMessage] = useState<GenerateInquiryOutput | null>(null);
  const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);
  
  const [isInvestigateDialogOpen, setIsInvestigateDialogOpen] = useState(false);
  const [selectedReportForInvestigation, setSelectedReportForInvestigation] = useState<Report | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [isReviewTaskDialogOpen, setIsReviewTaskDialogOpen] = useState(false);
  const [taskToReview, setTaskToReview] = useState<ComplianceTask | null>(null);
  const [inspectorComments, setInspectorComments] = useState('');
  
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
    const newJurisdiction = `${newEstablishmentCode.trim()}`;
    if (!linkedJurisdictions.includes(newJurisdiction)) {
        setLinkedJurisdictions([...linkedJurisdictions, newJurisdiction]);
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

    if (currentTask.id) { 
        setComplianceTasks(complianceTasks.map(t => (t.id === currentTask.id ? { ...t, ...currentTask } : t)));
        toast({ title: 'Task Updated', description: `"${currentTask.description}" has been updated.` });
    } else { 
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
      const result = await processInspectionReportAction(input);
      if (result.error || !result.data) {
        throw new Error(result.error || "Failed to process report.");
      }
      setProcessingResult(result.data);
      toast({
        title: 'AI Processing Complete',
        description: 'Review the generated tasks below and send them to the owner when ready.',
      });
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: error.message || 'Could not process the inspection report.',
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
      setProcessingResult(null);
      setReportNotes('');
  }
  
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
            const result = await analyzeIssueAction({ description: report.issue });
            if (result.error || !result.data) throw new Error(result.error || 'No data returned from AI.');
            setRecentReports(reports => reports.map(r => 
                r.id === report.id ? { ...r, aiAnalysis: result.data as AnalyzeIssueOutput } : r
            ));
            setSelectedReportForInvestigation(prev => prev ? {...prev, aiAnalysis: result.data as AnalyzeIssueOutput} : null);
        } catch (error: any) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'AI Analysis Failed',
                description: error.message || 'Could not get an analysis for this issue.',
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
        const result = await generateInquiryAction({
            guestReport: report.issue,
            locationName: report.location,
            ownerName: report.owner,
        });
        if (result.error || !result.data) throw new Error(result.error || 'No data returned from AI.');
        setAiMessage(result.data);
    } catch (error: any) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: 'AI Error',
            description: error.message || 'Could not generate the message.',
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
      setInspectorComments(''); 
      setIsReviewTaskDialogOpen(true);
  }

  const handleSaveReview = () => {
      if (!taskToReview) return;
      toast({
          title: "Review Saved",
          description: `Your comments for "${taskToReview.description}" have been logged.`
      });
      setIsReviewTaskDialogOpen(false);
      setTaskToReview(null);
  }

  return (
    <TooltipProvider>
      <Tabs defaultValue="triage" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="triage">Triage Queue</TabsTrigger>
          <TabsTrigger value="ai_tools">AI Tools</TabsTrigger>
          <TabsTrigger value="compliance_rules">Compliance Rules</TabsTrigger>
          <TabsTrigger value="establishments">My Establishments</TabsTrigger>
        </TabsList>

        <TabsContent value="triage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Escalated Guest Reports</CardTitle>
              <CardDescription>Guest-submitted reports requiring investigation and action.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Issue</TableHead>
                    <TableHead className="hidden sm:table-cell">Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentReports.length > 0 ? recentReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium max-w-xs truncate">{report.issue}</TableCell>
                      <TableCell className="hidden sm:table-cell">{report.location}</TableCell>
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
                            Contact
                         </Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        No escalated reports found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Pending Compliance Submissions</CardTitle>
              <CardDescription>Mandatory tasks completed by establishments, awaiting your review.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead className="hidden sm:table-cell">Location</TableHead>
                    <TableHead>Submission Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complianceTasks.filter(t => t.lastCompleted).length > 0 ? complianceTasks.filter(t => t.lastCompleted).map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.description}</TableCell>
                      <TableCell className="hidden sm:table-cell">{task.location}</TableCell>
                      <TableCell>{task.lastCompleted?.date}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => handleOpenReviewDialog(task)}>Review Submission</Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        No pending submissions from establishments.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="ai_tools">
           <Card className="border-primary bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline text-primary flex items-center gap-2"><Wand2 /> AI Inspection Report Processor</CardTitle>
                  <CardDescription>Paste your inspection notes below. The AI will extract actionable tasks to send to the business owner.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                     <div className="md:col-span-3 grid gap-2">
                      <Label htmlFor="inspection-notes">Inspection Notes</Label>
                      <Textarea id="inspection-notes" placeholder="e.g., Visited on 6/1. Back storage area had boxes blocking the hand-washing sink..." value={reportNotes} onChange={(e) => setReportNotes(e.target.value)} required rows={4}/>
                    </div>
                     <div className="grid gap-2">
                      <Label htmlFor="report-location">Location</Label>
                      <Select value={reportLocation} onValueChange={setReportLocation} required>
                        <SelectTrigger id="report-location"><SelectValue placeholder="Select location" /></SelectTrigger>
                        <SelectContent>{linkedJurisdictions.map(j => <SelectItem key={j} value={j}>{j}</SelectItem>)}</SelectContent>
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
                            <div className="space-y-2"><h4 className="font-semibold text-sm">Immediate Tasks for Owner</h4>{processingResult.immediateTasks.length > 0 ? (<ul className="list-disc list-inside text-sm text-muted-foreground bg-background/50 p-3 rounded-md">{processingResult.immediateTasks.map((task, i) => <li key={i}>{task}</li>)}</ul>) : <p className="text-sm text-muted-foreground italic">No immediate tasks generated.</p>}</div>
                            <div className="space-y-2"><h4 className="font-semibold text-sm">Suggested New Recurring Tasks</h4>{processingResult.suggestedRecurringTasks.length > 0 ? (<ul className="list-disc list-inside text-sm text-muted-foreground bg-background/50 p-3 rounded-md">{processingResult.suggestedRecurringTasks.map((task, i) => <li key={i}>{task.description} ({task.frequency})</li>)}</ul>) : <p className="text-sm text-muted-foreground italic">No new task suggestions.</p>}</div>
                          </div>
                          <Button onClick={handleSendAiTasks} className="bg-accent hover:bg-accent/90 text-accent-foreground"><Send className="mr-2 h-4 w-4"/>Confirm and Send Tasks to Owner</Button>
                      </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="compliance_rules" className="space-y-6">
           <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">Manager Suggestions Pending Approval</CardTitle>
                    <CardDescription>Review new recurring tasks suggested by location managers.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Description</TableHead><TableHead>From</TableHead><TableHead className="hidden md:table-cell">Location</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {complianceTasks.filter(t => t.status === 'Pending Approval').length > 0 ? complianceTasks.filter(t => t.status === 'Pending Approval').map(task => (
                                <TableRow key={task.id} className="bg-primary/5">
                                    <TableCell className="font-medium">{task.description}</TableCell>
                                    <TableCell>{task.source}</TableCell>
                                    <TableCell className="hidden md:table-cell">{task.location}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button size="sm" onClick={() => handleApproveTask(task.id)}><Check className="mr-2 h-4 w-4" /> Approve</Button>
                                        <Button size="sm" variant="destructive" onClick={() => handleRejectTask(task.id)}><X className="mr-2 h-4 w-4" /> Reject</Button>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow><TableCell colSpan={4} className="text-center h-24 text-muted-foreground">No pending suggestions from managers.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
           </Card>
           <Card>
                <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2"><FileCheck /> Official Compliance Task List</CardTitle>
                        <CardDescription>This is the master list of all recurring compliance tasks for your jurisdictions.</CardDescription>
                    </div>
                    <Button onClick={() => handleOpenDialog(null)}><PlusCircle className="mr-2 h-4 w-4" /> Add New Task</Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader><TableRow><TableHead className="w-[35%]">Description</TableHead><TableHead className="hidden md:table-cell">Location</TableHead><TableHead className="hidden lg:table-cell">Frequency</TableHead><TableHead className="hidden lg:table-cell">Source</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {complianceTasks.filter(t => t.status === 'Approved').length > 0 ? (
                        complianceTasks.filter(t => t.status === 'Approved').map((task) => (
                          <TableRow key={task.id}>
                            <TableCell className="font-medium">{task.description}</TableCell>
                            <TableCell className="hidden md:table-cell">{task.location}</TableCell>
                            <TableCell className="hidden lg:table-cell">{task.frequency}</TableCell>
                            <TableCell className="hidden lg:table-cell"><Badge variant="outline">{task.source}</Badge></TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(task)}><Pencil className="h-4 w-4" /><span className="sr-only">Edit Task</span></Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(task)}><Trash2 className="h-4 w-4" /><span className="sr-only">Remove Task</span></Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground h-24">No compliance tasks defined yet. Click "Add New Task" to begin.</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="establishments">
           <Card>
                <CardHeader>
                    <CardTitle>Linked Establishments</CardTitle>
                    <CardDescription>Enter a code from a business owner to link their location to your file.</CardDescription>
                </CardHeader>
                <CardContent>
                     <form onSubmit={handleLinkEstablishment} className="flex flex-col sm:flex-row gap-2">
                        <Input placeholder="Enter Establishment Code" value={newEstablishmentCode} onChange={(e) => setNewEstablishmentCode(e.target.value)} required/>
                        <Button type="submit" className="w-full sm:w-auto">Link Location</Button>
                    </form>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
      
      {/* Dialogs */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}><DialogContent><DialogHeader><DialogTitle className="font-headline">{currentTask.id ? 'Edit Compliance Task' : 'Add New Compliance Task'}</DialogTitle><DialogDescription>{currentTask.id ? 'Modify the details of this task.' : 'Define new weekly or monthly tasks for establishments to follow.'}</DialogDescription></DialogHeader><div className="grid gap-6 py-4"><div className="grid gap-2"><Label htmlFor="task-description">Task Description</Label><Input id="task-description" placeholder="e.g., Verify all fire extinguishers are certified" value={currentTask.description} onChange={(e) => setCurrentTask({ ...currentTask, description: e.target.value })} required /></div><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="grid gap-2"><Label htmlFor="frequency">Frequency</Label><Select value={currentTask.frequency} onValueChange={(val) => setCurrentTask({ ...currentTask, frequency: val })} required><SelectTrigger id="frequency"><SelectValue placeholder="Select frequency" /></SelectTrigger><SelectContent><SelectItem value="Daily">Daily</SelectItem><SelectItem value="Weekly">Weekly</SelectItem><SelectItem value="Monthly">Monthly</SelectItem></SelectContent></Select></div><div className="grid gap-2"><Label htmlFor="task-location">For Location</Label><Select value={currentTask.location} onValueChange={(val) => setCurrentTask({ ...currentTask, location: val || 'All' })} required><SelectTrigger id="task-location"><SelectValue placeholder="Select location" /></SelectTrigger><SelectContent><SelectItem value="All">All Jurisdictions</SelectItem>{linkedJurisdictions.map(j => <SelectItem key={j} value={j}>{j}</SelectItem>)}</SelectContent></Select></div></div><div className="grid gap-2"><Label>Type</Label><RadioGroup value={currentTask.type} onValueChange={(val) => setCurrentTask({ ...currentTask, type: val as ComplianceTask['type'] })} className="flex items-center gap-4 pt-2"><div className="flex items-center space-x-2"><RadioGroupItem value="Mandatory" id="mandatory" /><Label htmlFor="mandatory" className="font-normal">Mandatory</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="Optional" id="optional" /><Label htmlFor="optional" className="font-normal">Optional</Label></div></RadioGroup></div></div><DialogFooter><Button variant="outline" onClick={() => setIsTaskDialogOpen(false)}>Cancel</Button><Button onClick={handleSaveTask}>Save Task</Button></DialogFooter></DialogContent></Dialog>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete the compliance task: <span className="font-semibold">"{taskToDelete?.description}"</span>.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
      <Dialog open={isContactOwnerDialogOpen} onOpenChange={setContactOwnerDialogOpen}><DialogContent><DialogHeader><DialogTitle className='font-headline'>Contact Location Owner</DialogTitle><DialogDescription>The AI will generate a professional message regarding the issue: "{selectedReportForContact?.issue}". You can edit it before sending.</DialogDescription></DialogHeader><div className="py-4 space-y-4">{isGeneratingMessage ? (<div className="flex items-center justify-center p-8 space-x-2"><Loader2 className="h-6 w-6 animate-spin text-primary" /><p className="text-muted-foreground">AI is drafting the message...</p></div>) : aiMessage ? (<div className="space-y-4"><div className="grid gap-2"><Label htmlFor="ai-subject">Email Subject</Label><Input id="ai-subject" value={aiMessage.subject} readOnly/></div><div className="grid gap-2"><Label htmlFor="ai-message">Message Body</Label><Textarea id="ai-message" defaultValue={aiMessage.messageBody} rows={8}/></div></div>) : (<p className="text-destructive text-center">Failed to generate a message.</p>)}</div><DialogFooter><Button variant="secondary" onClick={() => setContactOwnerDialogOpen(false)}>Cancel</Button><Button onClick={handleSendMessageAndCreateTask} disabled={isGeneratingMessage || !aiMessage}>Send Message & Create Task</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={isInvestigateDialogOpen} onOpenChange={setIsInvestigateDialogOpen}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle className="font-headline">Investigate Guest Report</DialogTitle><DialogDescription>Review the details of the report from {selectedReportForInvestigation?.location}.</DialogDescription></DialogHeader>{selectedReportForInvestigation && (<div className="py-4 space-y-4"><div className="grid grid-cols-1 sm:grid-cols-3 items-start gap-4"><Label className="text-right text-muted-foreground sm:mt-2">Location</Label><p className="col-span-2 font-semibold">{selectedReportForInvestigation.location}</p></div><div className="grid grid-cols-1 sm:grid-cols-3 items-start gap-4"><Label className="text-right text-muted-foreground sm:mt-2">Reported Date</Label><p className="col-span-2">{selectedReportForInvestigation.date}</p></div><div className="grid gap-2"><Label>Reported Issue</Label><div className="border rounded-md p-3 bg-muted/50"><p className="text-sm font-semibold">{selectedReportForInvestigation.issue}</p></div></div><Separator/><div className="space-y-2"><Label className="flex items-center gap-2 text-muted-foreground"><Wand2 className="h-4 w-4" /> AI Analysis</Label>{isAnalyzing ? (<div className="flex items-center justify-center p-4"><Loader2 className="h-5 w-5 animate-spin" /></div>) : selectedReportForInvestigation.aiAnalysis ? (<Alert><AlertTitle>Urgency: {selectedReportForInvestigation.aiAnalysis.urgency}</AlertTitle><AlertDescription><p><strong>Category:</strong> {selectedReportForInvestigation.aiAnalysis.category}</p><p><strong>Suggested Action:</strong> {selectedReportForInvestigation.aiAnalysis.suggestedAction}</p></AlertDescription></Alert>) : (<p className="text-sm text-muted-foreground italic p-4 text-center">No AI analysis available.</p>)}</div><div className="space-y-2"><Label className="flex items-center gap-2 text-muted-foreground"><MessageSquare className="h-4 w-4" /> Manager's Resolution Notes</Label><div className="border rounded-md p-3 bg-muted/50 text-sm min-h-[60px]">{selectedReportForInvestigation.resolutionNotes ? (<p>{selectedReportForInvestigation.resolutionNotes}</p>) : (<p className="italic text-muted-foreground">No resolution notes have been submitted by the manager yet.</p>)}</div></div><div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4"><Label htmlFor='status-select' className="text-right text-muted-foreground">Update Status</Label><div className="col-span-2"><Select value={selectedReportForInvestigation.status} onValueChange={(newStatus) => handleStatusChange(selectedReportForInvestigation.id, newStatus)}><SelectTrigger id="status-select"><SelectValue placeholder="Change status..." /></SelectTrigger><SelectContent><SelectItem value="Reported">Reported</SelectItem><SelectItem value="Under Investigation">Under Investigation</SelectItem><SelectItem value="Action Taken">Action Taken</SelectItem><SelectItem value="Resolved">Resolved</SelectItem><SelectItem value="No Action Needed">No Action Needed</SelectItem></SelectContent></Select></div></div></div>)}<DialogFooter><Button variant="outline" onClick={() => setIsInvestigateDialogOpen(false)}>Close</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={isReviewTaskDialogOpen} onOpenChange={setIsReviewTaskDialogOpen}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle className="font-headline">Review Completed Task</DialogTitle><DialogDescription>Review the evidence for "{taskToReview?.description}" and add comments if necessary.</DialogDescription></DialogHeader>{taskToReview && (<div className="py-4 space-y-4"><div><Label className="text-sm text-muted-foreground">Photo Proof of Completion</Label><div className="mt-2"><PhotoUploader readOnly initialPreview={{ url: taskToReview.lastCompleted!.photoUrl, name: 'completion.png'}} /></div></div><div><Label htmlFor="inspector-comments">Your Comments (Optional)</Label><Textarea id="inspector-comments" placeholder="e.g., Looks good. Please ensure the area behind the equipment is also cleaned next time." value={inspectorComments} onChange={(e) => setInspectorComments(e.target.value)} rows={3}/></div></div>)}<DialogFooter><Button variant="secondary" onClick={() => setIsReviewTaskDialogOpen(false)}>Cancel</Button><Button onClick={handleSaveReview}>Save Review</Button></DialogFooter></DialogContent></Dialog>
    </TooltipProvider>
  );
}
