"use client"
import { useState, useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, FileText, TrendingUp, ShieldCheck, PlusCircle, FileCheck, Map, Link as LinkIcon } from "lucide-react";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle } from '@/components/ui/alert';

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
  { id: 1, issue: "Water puddle near entrance", location: "Downtown Cafe", date: "2024-05-21", status: "Action Taken", jurisdiction: "Downtown" },
  { id: 2, issue: "Table not cleaned properly", location: "Uptown Bistro", date: "2024-05-20", status: "Resolved", jurisdiction: "Uptown" },
  { id: 3, issue: "Soap dispenser empty", location: "Downtown Cafe", date: "2024-05-19", status: "Resolved", jurisdiction: "Downtown" },
  { id: 4, issue: "Strange smell from vent", location: "Uptown Bistro", date: "2024-05-18", status: "Under Investigation", jurisdiction: "Uptown" },
];


export default function HealthDeptDashboard() {
  const { toast } = useToast();
  const [complianceTasks, setComplianceTasks] = useState([
    { id: 1, description: "Weekly restroom deep clean", frequency: "Weekly", type: "Mandatory" },
    { id: 2, description: "Monthly fire safety check", frequency: "Monthly", type: "Mandatory" },
  ]);
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState('');
  const [type, setType] = useState('mandatory');
  
  const [linkedJurisdictions, setLinkedJurisdictions] = useState(["Downtown", "Uptown"]);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('All');
  const [newEstablishmentCode, setNewEstablishmentCode] = useState('');

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
    if (!description || !frequency) {
        toast({
          variant: "destructive",
          title: "Missing Information",
          description: "Please fill out all task fields.",
        })
        return;
    }
    const newTask = {
        id: complianceTasks.length + 1,
        description,
        frequency: frequency.charAt(0).toUpperCase() + frequency.slice(1),
        type: type.charAt(0).toUpperCase() + type.slice(1),
    };
    setComplianceTasks([newTask, ...complianceTasks]);
    // Reset form
    setDescription('');
    setFrequency('');
    setType('mandatory');
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
            Define new weekly or monthly tasks for establishments to follow. These tasks apply to all jurisdictions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddTask} className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="task-description">Task Description</Label>
              <Input id="task-description" placeholder="e.g., Verify all fire extinguishers are certified" value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="grid gap-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select value={frequency} onValueChange={setFrequency} required>
                  <SelectTrigger id="frequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Type</Label>
                <RadioGroup value={type} onValueChange={setType} className="flex items-center gap-4 pt-2">
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
                <TableHead>Frequency</TableHead>
                <TableHead className="text-right">Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complianceTasks.length > 0 ? (
                complianceTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.description}</TableCell>
                    <TableCell>{task.frequency}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={task.type === 'Mandatory' ? 'destructive' : 'secondary'}>{task.type}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
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
