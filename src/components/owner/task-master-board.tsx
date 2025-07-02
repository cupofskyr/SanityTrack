
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ListChecks, BellRing } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Task = {
  id: number;
  description: string;
  location: string;
  assignedTo: string;
  status: 'Overdue' | 'Unconfirmed' | 'In Progress';
  priority: 'High' | 'Medium' | 'Low';
};

const mockTasks: Task[] = [
  { id: 1, description: 'Fix leaking faucet in men\'s restroom', location: 'Downtown', assignedTo: 'Casey Lee', status: 'Overdue', priority: 'High' },
  { id: 2, description: 'Submit Q3 sales tax report', location: 'All', assignedTo: 'Alex Ray', status: 'Unconfirmed', priority: 'High' },
  { id: 3, description: 'Deep clean walk-in freezer', location: 'Uptown', assignedTo: 'Manager (Uptown)', status: 'In Progress', priority: 'Medium' },
  { id: 4, description: 'Unclog drain in kitchen prep area', location: 'Downtown', assignedTo: 'Casey Lee', status: 'Unconfirmed', priority: 'Medium' },
  { id: 5, description: 'Renew food handler permit for John Doe', location: 'Downtown', assignedTo: 'Casey Lee', status: 'Overdue', priority: 'High' },
  { id: 6, description: 'Restock first-aid kit', location: 'Uptown', assignedTo: 'Manager (Uptown)', status: 'Unconfirmed', priority: 'Low' },
];

const locations = ['All', 'Downtown', 'Uptown', 'Westside'];
const statuses = ['All', 'Overdue', 'Unconfirmed', 'In Progress'];
const priorities = ['All', 'High', 'Medium', 'Low'];

export default function TaskMasterBoard() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [filters, setFilters] = useState({
    location: 'All',
    status: 'All',
    priority: 'All',
  });

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => 
      (filters.location === 'All' || task.location === filters.location) &&
      (filters.status === 'All' || task.status === filters.status) &&
      (filters.priority === 'All' || task.priority === filters.priority)
    );
  }, [tasks, filters]);

  const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const sendReminder = (task: Task) => {
    toast({
      title: 'Reminder Sent!',
      description: `A reminder for "${task.description}" has been sent to ${task.assignedTo}.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <ListChecks /> Task Master Board
        </CardTitle>
        <CardDescription>
          A centralized view of all important, unconfirmed, or overdue tasks across all your locations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 border rounded-lg bg-muted">
          <div className="grid gap-1.5 flex-1">
            <label className="text-sm font-medium">Location</label>
            <Select value={filters.location} onValueChange={(val) => handleFilterChange('location', val)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{locations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}</SelectContent>
            </Select>
          </div>
           <div className="grid gap-1.5 flex-1">
            <label className="text-sm font-medium">Status</label>
            <Select value={filters.status} onValueChange={(val) => handleFilterChange('status', val)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
           <div className="grid gap-1.5 flex-1">
            <label className="text-sm font-medium">Priority</label>
            <Select value={filters.priority} onValueChange={(val) => handleFilterChange('priority', val)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{priorities.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.length > 0 ? (
                filteredTasks.map(task => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.description}</TableCell>
                    <TableCell>{task.location}</TableCell>
                    <TableCell>{task.assignedTo}</TableCell>
                    <TableCell>
                      <Badge variant={task.status === 'Overdue' ? 'destructive' : task.status === 'In Progress' ? 'default' : 'secondary'}>
                        {task.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => sendReminder(task)}>
                        <BellRing className="mr-2 h-4 w-4" />
                        Send Reminder
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No tasks match the current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
