
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useWindowSize } from 'react-use';
import Confetti from 'react-confetti';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, Clock, ListTodo, ShieldCheck, Camera, Loader2, Lightbulb } from "lucide-react";
import LiveTeamFeed from '@/components/dashboard/employee/LiveTeamFeed';
import WhosOnShift from '@/components/dashboard/employee/WhosOnShift';
import TodaysFlow from '@/components/dashboard/employee/TodaysFlow';
import PerformanceCard from '@/components/dashboard/employee/PerformanceCard';
import TeamLeaderboard from '@/components/dashboard/employee/TeamLeaderboard';
import ShiftRecapDialog from '@/components/dashboard/employee/ShiftRecapDialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PhotoUploader from '@/components/photo-uploader';
import { verifyTaskProofAction } from '@/app/actions';
import EmployeeServiceAlertWidget from '@/components/employee-service-alert-widget';

const initialTasks = [
  { id: 1, name: "Clean kitchen floor", area: "Kitchen", priority: "High", status: 'Pending', type: 'regular' },
  { id: 2, name: "Restock restroom supplies", area: "Restroom", priority: "Medium", status: 'Pending', type: 'regular' },
  { id: 3, name: "Sanitize all door handles", area: "All Areas", priority: "High", status: 'In Progress', type: 'regular' },
];

const initialQaTasks = [
  { id: 4, description: `Perform QA check for: Classic Burger`, source: 'Manager Assignment', status: 'Pending', itemToAudit: 'Classic Burger', type: 'qa' }
];

type Task = { id: number; name: string; area: string; priority: string; status: 'Pending' | 'In Progress'; type: 'regular' };
type QaTask = { id: number; description: string; source: string; status: 'Pending' | 'In Progress'; itemToAudit: string; standardImageUrl?: string; type: 'qa' };

export default function EmployeeDashboardV2() {
    const { toast } = useToast();
    const { width, height } = useWindowSize();
    
    const [tasks, setTasks] = useState<(Task | QaTask)[]>([...initialTasks, ...initialQaTasks]);
    const [completedCount, setCompletedCount] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    
    const [isClockedIn, setIsClockedIn] = useState(false);
    const [lastClockIn, setLastClockIn] = useState<Date | null>(null);
    const [isShiftRecapOpen, setIsShiftRecapOpen] = useState(false);
    
    const [storeVibe, setStoreVibe] = useState<'good' | 'warning' | 'urgent'>('good');
    const [vibeMessage, setVibeMessage] = useState('All systems normal.');

    // State for proof submission
    const [isProofDialogOpen, setIsProofDialogOpen] = useState(false);
    const [taskForProof, setTaskForProof] = useState<(Task|QaTask)|null>(null);
    const [proofPhoto, setProofPhoto] = useState<string|null>(null);
    const [isVerifying, setIsVerifying] = useState(false);

    const totalTasks = useMemo(() => tasks.length, [tasks]);
    const progressPercentage = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;
    const xpEarned = completedCount * 50; 

    useEffect(() => {
        const interval = setInterval(() => {
            const agentStatus = localStorage.getItem('sentinel-agent-status');
            if (agentStatus === 'urgent') {
                setStoreVibe('urgent');
                setVibeMessage('Urgent issue detected!');
            } else if (agentStatus === 'warning') {
                setStoreVibe('warning');
                setVibeMessage('Minor system alert.');
            } else {
                setStoreVibe('good');
                setVibeMessage('All systems normal.');
            }
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Effect to listen for new QA tasks assigned by a manager
    useEffect(() => {
        const handleQaTaskUpdate = () => {
            const storedTask = localStorage.getItem('qa-employee-task');
            if (storedTask) {
                try {
                    const newTask = JSON.parse(storedTask);
                    setTasks(prevTasks => {
                        if (!prevTasks.some(task => task.id === newTask.id)) {
                            toast({ title: 'New QA Task Assigned!', description: newTask.description });
                            return [...prevTasks, newTask];
                        }
                        return prevTasks;
                    });
                } catch (e) {
                    console.error("Failed to parse task from localStorage", e);
                }
            }
        };

        const handleStorageEvent = (event: StorageEvent) => {
            if (event.key === 'qa-employee-task') {
                handleQaTaskUpdate();
            }
        };
        
        handleQaTaskUpdate(); // Check on component mount
        window.addEventListener('storage', handleStorageEvent);

        return () => {
            window.removeEventListener('storage', handleStorageEvent);
        };
    }, [toast]);

    const handleTaskCompletion = (taskId: number) => {
        setTasks(prev => prev.filter(task => task.id !== taskId));
        setCompletedCount(prev => prev + 1);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000); 
    };

    const handleOpenProofDialog = (task: Task | QaTask) => {
        setTaskForProof(task);
        setIsProofDialogOpen(true);
    };
    
    const handleCloseProofDialog = () => {
        setIsProofDialogOpen(false);
        setTaskForProof(null);
        setProofPhoto(null);
        setIsVerifying(false);
    }

    const handleSubmitProof = async () => {
        if (!proofPhoto || !taskForProof) {
            toast({ variant: 'destructive', title: 'No photo provided.' });
            return;
        }
        setIsVerifying(true);
        try {
            const result = await verifyTaskProofAction({
                photoDataUri: proofPhoto,
                taskDescription: taskForProof.type === 'regular' ? taskForProof.name : taskForProof.description,
            });

            if (result.error || !result.data) {
                throw new Error(result.error || "Verification failed.");
            }

            toast({ title: "AI Verification", description: result.data.feedback });

            if (result.data.isApproved) {
                handleTaskCompletion(taskForProof.id);
                handleCloseProofDialog();
            }

        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsVerifying(false);
        }
    };


    const handleClockIn = () => {
        setIsClockedIn(true);
        setLastClockIn(new Date());
        toast({ title: "Clocked In", description: `Welcome! Your shift has started.` });
    };

    const handleClockOut = () => {
        setIsClockedIn(false);
        setIsShiftRecapOpen(true);
    };

    const VibeIndicator = () => {
        const colorClass = {
            good: 'bg-green-500',
            warning: 'bg-yellow-500',
            urgent: 'bg-red-500',
        }[storeVibe];
        return (
            <div className="flex items-center gap-2 text-xs font-semibold">
                <span className={`h-2 w-2 rounded-full animate-pulse ${colorClass}`} />
                <span className="text-muted-foreground">{vibeMessage}</span>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={300} />}
            <ShiftRecapDialog open={isShiftRecapOpen} onOpenChange={setIsShiftRecapOpen} completedTasks={completedCount} xpEarned={xpEarned} />

            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold font-headline">My Day</h1>
                    <p className="text-muted-foreground">Welcome, John. Here's your mission for today.</p>
                </div>
                <VibeIndicator />
            </div>

            <EmployeeServiceAlertWidget />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="lg:col-span-2 space-y-6">
                    <Card id="tasks-checklists">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><ListTodo /> My Mission</CardTitle>
                            <CardDescription>Complete these tasks to keep our store running smoothly. Photo proof is required for all tasks.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4 mb-4">
                                <Progress value={progressPercentage} className="h-2 flex-1" />
                                <span className="text-sm font-semibold">{completedCount} / {totalTasks} Complete</span>
                            </div>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Task</TableHead>
                                        <TableHead>Area / Source</TableHead>
                                        <TableHead>Priority</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tasks.length > 0 ? tasks.map(task => (
                                        <TableRow key={task.id}>
                                            <TableCell className="font-medium">{task.type === 'qa' ? task.description : (task as Task).name}</TableCell>
                                            <TableCell className="text-muted-foreground">{task.type === 'qa' ? task.source : (task as Task).area}</TableCell>
                                            <TableCell>
                                                <Badge variant={task.type === 'qa' || (task as Task).priority === "High" ? "destructive" : "secondary"}>
                                                    {task.type === 'qa' ? 'High Priority' : (task as Task).priority}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" onClick={() => handleOpenProofDialog(task)}>
                                                    <Check className="mr-2 h-4 w-4" /> Done
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center">All tasks completed. Great job!</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-primary"><Lightbulb /> AI Tip of the Day</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">"Remember to restock sauces and napkins during downtime. A fully stocked station makes the next rush smoother for everyone!"</p>
                        </CardContent>
                    </Card>

                    <LiveTeamFeed />
                </div>

                
                <div className="space-y-6">
                    <Card id="clock-in-out">
                        <CardHeader><CardTitle className="flex items-center gap-2"><Clock /> Time Clock</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-center font-semibold">{isClockedIn ? "You are clocked in." : "You are clocked out."}</p>
                            <div className="flex gap-2">
                                <Button onClick={handleClockIn} disabled={isClockedIn} className="w-full">Clock In</Button>
                                <Button onClick={handleClockOut} disabled={!isClockedIn} variant="destructive" className="w-full">Clock Out</Button>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <TodaysFlow />
                    <WhosOnShift />
                    <PerformanceCard xpEarned={xpEarned} />
                    <TeamLeaderboard />
                </div>
            </div>

            <Dialog open={isProofDialogOpen} onOpenChange={handleCloseProofDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className='font-headline'>Submit Proof of Completion</DialogTitle>
                        <DialogDescription>
                            Take a photo to verify completion of the task: <span className="font-semibold">{taskForProof?.type === 'regular' ? (taskForProof as Task).name : taskForProof?.description}</span>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <PhotoUploader onPhotoDataChange={setProofPhoto} />
                    </div>
                    <DialogFooter>
                        <Button variant="secondary" onClick={handleCloseProofDialog}>Cancel</Button>
                        <Button onClick={handleSubmitProof} disabled={isVerifying || !proofPhoto}>
                            {isVerifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
                            Submit Proof for AI Verification
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
