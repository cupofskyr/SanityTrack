
"use client";

import AISetupAssistant from '@/components/ai-setup-assistant';
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { ListTodo, PlusCircle, X, Sparkles, Trash2, Pencil, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


type Task = {
    description: string;
    frequency: string;
};

type ManagedTask = Task & {
    id: number;
    status: 'Local' | 'Pending Approval' | 'Approved';
};

export default function EquipmentPage() {
    const { toast } = useToast();
    const [managedTasks, setManagedTasks] = useState<ManagedTask[]>([]);
    const [suggestedTasks, setSuggestedTasks] = useState<Task[] | null>(null);

    const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
    const [currentTask, setCurrentTask] = useState<{ id: number | null; description: string; frequency: string }>({
        id: null,
        description: '',
        frequency: '',
    });
    
    const handleTasksSuggested = (tasks: Task[]) => {
        setSuggestedTasks(tasks);
        toast({
            title: "AI Suggestions Ready!",
            description: `The AI has suggested ${tasks.length} tasks. Please review them below.`,
        });
    };

    const handleAddTask = (taskToAdd: Task) => {
        if (managedTasks.some(task => task.description === taskToAdd.description)) {
            toast({
                variant: 'secondary',
                title: "Duplicate Task",
                description: "This task is already in the master list.",
            });
            setSuggestedTasks(prev => prev ? prev.filter(t => t.description !== taskToAdd.description) : null);
            return;
        }

        const newManagedTask: ManagedTask = {
            ...taskToAdd,
            id: (managedTasks.length > 0 ? Math.max(...managedTasks.map(t => t.id)) : 0) + 1,
            status: 'Local',
        };

        setManagedTasks(prevTasks => [...prevTasks, newManagedTask]);
        setSuggestedTasks(prev => prev ? prev.filter(t => t.description !== taskToAdd.description) : null);

        toast({
            title: "Task Added!",
            description: `"${taskToAdd.description}" has been added as a local task.`,
        });
    };

    const handleRemoveTask = (taskId: number) => {
        const taskToRemove = managedTasks.find(t => t.id === taskId);
        setManagedTasks(prev => prev.filter(t => t.id !== taskId));
        if (taskToRemove) {
            toast({
                variant: 'secondary',
                title: "Task Removed",
                description: `"${taskToRemove.description}" has been removed from the master list.`,
            });
        }
    };

    const handleClearSuggestions = () => {
        setSuggestedTasks(null);
        toast({
            variant: 'secondary',
            title: "Suggestions Cleared",
            description: "The AI-suggested tasks have been cleared.",
        });
    }

    const handleOpenDialog = (task: ManagedTask | null) => {
        if (task) {
            setCurrentTask({ id: task.id, description: task.description, frequency: task.frequency });
        } else {
            setCurrentTask({ id: null, description: '', frequency: '' });
        }
        setIsTaskDialogOpen(true);
    };

    const handleSaveTask = () => {
        if (!currentTask.description || !currentTask.frequency) {
            toast({
                variant: 'destructive',
                title: "Missing Information",
                description: "Please provide a description and frequency.",
            });
            return;
        }

        if (currentTask.id) { // Editing existing task
            setManagedTasks(managedTasks.map(t => t.id === currentTask.id ? { ...t, description: currentTask.description, frequency: currentTask.frequency } : t));
            toast({
                title: "Task Updated",
                description: `"${currentTask.description}" has been updated.`,
            });
        } else { // Adding new task
            const newManagedTask: ManagedTask = {
                id: (managedTasks.length > 0 ? Math.max(...managedTasks.map(t => t.id)) : 0) + 1,
                description: currentTask.description,
                frequency: currentTask.frequency,
                status: 'Local',
            };
            setManagedTasks(prevTasks => [...prevTasks, newManagedTask]);
            toast({
                title: "Task Added",
                description: `"${currentTask.description}" has been added to the master list.`,
            });
        }
        setIsTaskDialogOpen(false);
    };

    const handleSubmitForApproval = (taskId: number) => {
        setManagedTasks(tasks => tasks.map(t => t.id === taskId ? { ...t, status: 'Pending Approval' } : t));
        toast({
            title: "Submitted for Review",
            description: "The task has been sent to the Health Department for approval."
        });
    };

    return (
        <div className="space-y-6">
            <AISetupAssistant onTasksSuggested={handleTasksSuggested} />

            {suggestedTasks && suggestedTasks.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><Sparkles className="text-primary" /> Review AI-Suggested Tasks</CardTitle>
                        <CardDescription>
                            Review the tasks generated by the AI. Add them to your master list individually or clear all suggestions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Task Description</TableHead>
                                    <TableHead>Frequency</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {suggestedTasks.map((task, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{task.description}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{task.frequency}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" onClick={() => handleAddTask(task)}>
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            Add to List
                                        </Button>
                                    </TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline" onClick={handleClearSuggestions}>
                            <X className="mr-2 h-4 w-4"/>
                            Clear Suggestions
                        </Button>
                    </CardFooter>
                </Card>
            )}

            <Card>
                <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                        <CardTitle className="font-headline flex items-center gap-2"><ListTodo /> Master Task List</CardTitle>
                        <CardDescription>
                            This is the master list of recurring tasks. Submit local tasks to the Health Department for official approval.
                        </CardDescription>
                    </div>
                    <Button onClick={() => handleOpenDialog(null)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Manual Task
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50%]">Task Description</TableHead>
                                <TableHead>Frequency</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {managedTasks.length > 0 ? (
                                managedTasks.map((task) => (
                                <TableRow key={task.id}>
                                    <TableCell className="font-medium">{task.description}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{task.frequency}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            task.status === 'Approved' ? 'default' :
                                            task.status === 'Pending Approval' ? 'secondary' :
                                            'outline'
                                        }>{task.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {task.status === 'Local' && (
                                            <div className="flex gap-2 justify-end">
                                                <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(task)}>
                                                    <Pencil className="h-4 w-4" />
                                                    <span className="sr-only">Edit Task</span>
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleRemoveTask(task.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">Remove Task</span>
                                                </Button>
                                                 <Button size="sm" onClick={() => handleSubmitForApproval(task.id)}>
                                                    <Send className="mr-2 h-4 w-4"/> Submit
                                                </Button>
                                            </div>
                                        )}
                                        {task.status === 'Pending Approval' && (
                                            <span className="text-xs text-muted-foreground italic">Awaiting Health Dept. review</span>
                                        )}
                                        {task.status === 'Approved' && (
                                             <span className="text-xs text-muted-foreground italic">Official compliance task</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                <TableCell colSpan={4} className="text-center h-24">
                                    No tasks in the master list yet. Use the AI Setup Assistant or "Add Manual Task" to get started.
                                </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="font-headline">{currentTask.id ? 'Edit Task' : 'Add Manual Task'}</DialogTitle>
                        <DialogDescription>
                            {currentTask.id ? 'Modify the details of this task.' : 'Add a new task to the master list.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="task-description">Task Description</Label>
                            <Input
                                id="task-description"
                                value={currentTask.description}
                                onChange={(e) => setCurrentTask({ ...currentTask, description: e.target.value })}
                                placeholder="e.g., Clean the ice machine"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="task-frequency">Frequency</Label>
                            <Select
                                value={currentTask.frequency}
                                onValueChange={(value) => setCurrentTask({ ...currentTask, frequency: value })}
                            >
                                <SelectTrigger id="task-frequency">
                                    <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Daily">Daily</SelectItem>
                                    <SelectItem value="Weekly">Weekly</SelectItem>
                                    <SelectItem value="Monthly">Monthly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSaveTask}>Save Task</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
