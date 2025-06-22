
"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import PhotoUploader from "@/components/photo-uploader";
import { CheckCircle, AlertTriangle, ListTodo, PlusCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const initialTasks = [
  { id: 1, name: "Clean kitchen floor", area: "Kitchen", priority: "High", status: "Pending" },
  { id: 2, name: "Restock restroom supplies", area: "Restroom", priority: "Medium", status: "Pending" },
  { id: 3, name: "Sanitize all door handles", area: "All Areas", priority: "High", status: "In Progress" },
];

const initialCompletedTasks = [
  { id: 4, name: "Empty trash bins", area: "All Areas", completedAt: "2024-05-20 09:00" },
  { id: 5, name: "Wipe down dining tables", area: "Dining Area", completedAt: "2024-05-20 08:30" },
];

const initialIssues = [
  { id: 1, description: "Leaky faucet in men's restroom", status: "Reported" },
  { id: 2, description: "Dining area light flickering", status: "Maintenance Notified" },
];

export default function EmployeeDashboard() {
  const [tasks, setTasks] = useState(initialTasks);
  const [completedTasks, setCompletedTasks] = useState(initialCompletedTasks);
  const [issues, setIssues] = useState(initialIssues);
  
  const [newIssueDescription, setNewIssueDescription] = useState("");
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const { toast } = useToast();

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
    setIsReportDialogOpen(false);
    toast({
      title: "Issue Reported",
      description: "The new issue has been reported to the manager.",
    });
  };

  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
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
                  Describe the issue you've found. This will be sent to the manager for review.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleReportIssue}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="issue-description">Issue Description</Label>
                    <Textarea
                      id="issue-description"
                      placeholder="e.g., Water puddle near the entrance"
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
    </div>
  );
}
