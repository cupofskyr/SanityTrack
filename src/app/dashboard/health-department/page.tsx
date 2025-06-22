"use client"
import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, FileText, TrendingUp, ShieldCheck, PlusCircle, FileCheck } from "lucide-react";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const complianceData = [
  { month: "Jan", score: 82 },
  { month: "Feb", score: 85 },
  { month: "Mar", score: 91 },
  { month: "Apr", score: 88 },
  { month: "May", score: 94 },
  { month: "Jun", score: 92 },
];

const chartConfig = {
  score: {
    label: "Compliance Score",
    color: "hsl(var(--primary))",
  },
}

const recentReports = [
  { id: 1, issue: "Water puddle near entrance", location: "Lobby", date: "2024-05-21", status: "Action Taken" },
  { id: 2, issue: "Table not cleaned properly", location: "Dining Area", date: "2024-05-20", status: "Resolved" },
  { id: 3, issue: "Soap dispenser empty", location: "Restroom A", date: "2024-05-19", status: "Resolved" },
  { id: 4, issue: "Strange smell from vent", location: "Kitchen", date: "2024-05-18", status: "Under Investigation" },
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


  return (
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
          <div className="text-2xl font-bold">3</div>
          <p className="text-xs text-muted-foreground">Immediate attention required</p>
        </CardContent>
      </Card>
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
           <CardTitle className="text-sm font-medium">Guest Reports This Month</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">12</div>
           <p className="text-xs text-muted-foreground">-5 from last month</p>
        </CardContent>
      </Card>

      <Card className="lg:col-span-4">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2"><TrendingUp /> Compliance Trend</CardTitle>
          <CardDescription>Monthly compliance scores based on completed tasks and resolved issues.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart accessibilityLayer data={complianceData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
              <YAxis />
              <Tooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="score" fill="var(--color-score)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-4">
        <CardHeader>
          <CardTitle className="font-headline">Recent Guest Reports</CardTitle>
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
              {recentReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.issue}</TableCell>
                  <TableCell>{report.location}</TableCell>
                  <TableCell>{report.date}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={report.status === 'Under Investigation' ? 'destructive' : 'outline'}>{report.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="lg:col-span-4">
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

      <Card className="lg:col-span-4">
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
