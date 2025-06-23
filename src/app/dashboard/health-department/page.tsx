"use client"
import { useState, useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, FileText, TrendingUp, ShieldCheck, PlusCircle, FileCheck, Map, Link as LinkIcon, Sparkles, Wand2, Loader2 } from "lucide-react";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { processInspectionReport } from '@/ai/flows/process-inspection-report-flow';
import { type ProcessInspectionReportOutput } from '@/ai/schemas/inspection-report-schemas';
import { format } from 'date-fns';

const complianceData = [
  { month: "Jan", score: 82, jurisdiction: "Downtown" },
  { month: "Feb", score: 85, jurisdiction: "Downtown" },
  { month: "Mar", score: 91, jurisdiction: "Downtown" },
  { month: "Apr", score: 88, jurisdiction: "Uptown" },
  { month: "May", score: 94, jurisdiction: "Uptown" },
  { month: "Jun", score: 92, jurisdiction: "Uptown" },
];

const chartConfig = {
  score: {
    label: "Compliance Score",
    color: "hsl(var(--primary))",
  },
}

const recentReports = [
  { id: 1, issue: "Water puddle near entrance", location: "Downtown", date: "2024-05-21", status: "Action Taken", jurisdiction: "Downtown" },
  { id: 2, issue: "Table not cleaned properly", location: "Uptown", date: "2024-05-20", status: "Resolved", jurisdiction: "Uptown" },
  { id: 3, issue: "Soap dispenser empty", location: "Downtown", date: "2024-05-19", status: "Resolved", jurisdiction: "Downtown" },
  { id: 4, issue: "Strange smell from vent", location: "Uptown", date: "2024-05-18", status: "Under Investigation", jurisdiction: "Uptown" },
];

type ComplianceTask = {
    id: number;
    description: string;
    frequency: string;
    type: string;
    location?: string; // Optional location
};

export default function HealthDeptDashboard() {
  const { toast } = useToast();
  const [complianceTasks, setComplianceTasks] = useState<ComplianceTask[]>([
    { id: 1, description: "Weekly restroom deep clean", frequency: "Weekly", type: "Mandatory", location: "All" },
    { id: 2, description: "Monthly fire safety check", frequency: "Monthly", type: "Mandatory", location: "All" },
    { id: 3, description: "Verify temperature logs for all coolers", frequency: "Daily", type: "Mandatory", location: "Downtown" },
  ]);
  const [newTask, setNewTask] = useState({ description: '', frequency: '', type: 'mandatory', location: 'All' });
  
  const [linkedJurisdictions, setLinkedJurisdictions] = useState(["Downtown", "Uptown"]);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('All');
  const [newEstablishmentCode, setNewEstablishmentCode] = useState('');

  // State for AI Report Processor
  const [reportNotes, setReportNotes] = useState('');
  const [reportLocation, setReportLocation] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingResult, setProcessingResult] = useState<ProcessInspectionReportOutput | null>(null);


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


  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.description || !newTask.frequency) {
        toast({
          variant: "destructive",
          title: "Missing Information",
          description: "Please fill out all task fields.",
        })
        return;
    }
    const newId = complianceTasks.length > 0 ? Math.max(...complianceTasks.map(t => t.id)) + 1 : 1;
    const taskToAdd = {
        ...newTask,
        id: newId,
        frequency: newTask.frequency.charAt(0).toUpperCase() + newTask.frequency.slice(1),
        type: newTask.type.charAt(0).toUpperCase() + newTask.type.slice(1),
    };
    setComplianceTasks([taskToAdd, ...complianceTasks]);
    // Reset form
    setNewTask({ description: '', frequency: '', type: 'mandatory', location: 'All' });
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
        description: 'Review the generated tasks below. Immediate tasks have been sent to the owner.',
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


  const filteredReports = useMemo(() => {
    if (selectedJurisdiction === 'All') return recentReports;
    return recentReports.filter(report => report.jurisdiction === selectedJurisdiction);
  }, [selectedJurisdiction]);
  
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


  return (
    <div className="space-y-6">
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
      
      <Alert>
        <ShieldCheck className="h-4 w-4" />
        <AlertTitle className="font-bold">Scoped Access View</AlertTitle>
        <CardDescription>
            In a real-world application, each Health Department agent would only see the locations and data assigned to their specific jurisdiction. This simulation allows you to switch between different jurisdictional views.
        </CardDescription>
      </Alert>

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
            <CardTitle className="text-sm font-medium">Guest Reports This Month</CardTitle>
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
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart accessibilityLayer data={filteredComplianceData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
              <YAxis domain={[70, 100]}/>
              <Tooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="score" fill="var(--color-score)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      
      <Card className="border-primary bg-primary/5">
        <CardHeader>
          <CardTitle className="font-headline text-primary flex items-center gap-2"><Wand2 /> AI Inspection Report Processor</CardTitle>
          <CardDescription>
            Paste your inspection notes below. The AI will extract actionable tasks and suggest new compliance rules. The immediate tasks will be sent to the business owner automatically.
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
                Process with AI
            </Button>
            {processingResult && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Immediate Tasks for Owner (Sent)</h4>
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
            )}
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Recent Guest Reports for {selectedJurisdiction}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Issue</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.length > 0 ? filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.issue}</TableCell>
                  <TableCell>{report.location}</TableCell>
                  <TableCell>{report.date}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={report.status === 'Under Investigation' ? 'destructive' : 'outline'}>{report.status}</Badge>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    No reports found for the "{selectedJurisdiction}" jurisdiction.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2"><PlusCircle /> Add New Compliance Task</CardTitle>
          <CardDescription>
            Define new weekly or monthly tasks for establishments to follow.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddTask} className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="task-description">Task Description</Label>
              <Input id="task-description" placeholder="e.g., Verify all fire extinguishers are certified" value={newTask.description} onChange={(e) => setNewTask({...newTask, description: e.target.value})} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="grid gap-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select value={newTask.frequency} onValueChange={(val) => setNewTask({...newTask, frequency: val})} required>
                  <SelectTrigger id="frequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
               <div className="grid gap-2">
                <Label htmlFor="task-location">For Location</Label>
                <Select value={newTask.location} onValueChange={(val) => setNewTask({...newTask, location: val})} required>
                  <SelectTrigger id="task-location">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="All">All Jurisdictions</SelectItem>
                     {linkedJurisdictions.map(j => <SelectItem key={j} value={j}>{j}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Type</Label>
                <RadioGroup value={newTask.type} onValueChange={(val) => setNewTask({...newTask, type: val})} className="flex items-center gap-4 pt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mandatory" id="mandatory" />
                    <Label htmlFor="mandatory" className="font-normal">Mandatory</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="optional" id="optional" />
                    <Label htmlFor="optional" className="font-normal">Optional</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full md:w-auto bg-primary hover:bg-primary/90">Add Task</Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2"><FileCheck /> Defined Compliance Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead className="text-right">Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complianceTasks.length > 0 ? (
                complianceTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.description}</TableCell>
                    <TableCell>{task.location}</TableCell>
                    <TableCell>{task.frequency}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={task.type === 'Mandatory' ? 'destructive' : 'secondary'}>{task.type}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No compliance tasks defined yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </div>
  );
}
