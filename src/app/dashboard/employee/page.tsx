import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import PhotoUploader from "@/components/photo-uploader";
import { CheckCircle, AlertTriangle, ListTodo } from "lucide-react";

const tasks = [
  { id: 1, name: "Clean kitchen floor", area: "Kitchen", priority: "High", status: "Pending" },
  { id: 2, name: "Restock restroom supplies", area: "Restroom", priority: "Medium", status: "Pending" },
  { id: 3, name: "Sanitize all door handles", area: "All Areas", priority: "High", status: "In Progress" },
];

const completedTasks = [
  { id: 4, name: "Empty trash bins", area: "All Areas", completedAt: "2024-05-20 09:00" },
  { id: 5, name: "Wipe down dining tables", area: "Dining Area", completedAt: "2024-05-20 08:30" },
];

const issues = [
  { id: 1, description: "Leaky faucet in men's restroom", status: "Reported" },
  { id: 2, description: "Dining area light flickering", status: "Maintenance Notified" },
];

export default function EmployeeDashboard() {
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
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2"><AlertTriangle /> Open Issues</CardTitle>
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
