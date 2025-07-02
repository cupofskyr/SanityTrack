
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
import { Check, Clock, ListTodo, ShieldCheck, Camera, Loader2, Lightbulb, HelpCircle, Sparkles } from "lucide-react";
import LiveTeamFeed from '@/components/dashboard/employee/LiveTeamFeed';
import WhosOnShift from '@/components/dashboard/employee/WhosOnShift';
import TodaysFlow from '@/components/dashboard/employee/TodaysFlow';
import PerformanceCard from '@/components/dashboard/employee/PerformanceCard';
import TeamLeaderboard from '@/components/dashboard/employee/TeamLeaderboard';
import ShiftRecapDialog from '@/components/dashboard/employee/ShiftRecapDialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PhotoUploader from '@/components/photo-uploader';
import { verifyTaskProofAction, explainTaskImportanceAction } from '@/app/actions';
import EmployeeServiceAlertWidget from '@/components/employee-service-alert-widget';
import type { VerifyTaskProofOutput } from '@/ai/schemas/task-proof-schemas';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const initialTasks = [
  { id: 1, name: "Clean kitchen floor", description: "Mop the entire kitchen floor, including under the prep tables.", area: "Kitchen", priority: "High", status: 'Pending', type: 'regular' },
  { id: 2, name: "Restock restroom supplies", description: "Check and refill all soap dispensers, paper towel holders, and toilet paper in both restrooms.", area: "Restroom", priority: "Medium", status: 'Pending', type: 'regular' },
  { id: 3, name: "Sanitize all door handles", description: "Use approved sanitizer to wipe down all door handles, including entry, exit, and restroom doors.", area: "All Areas", priority: "High", status: 'In Progress', type: 'regular' },
];

const initialQaTasks = [
  { id: 4, name: `Perform QA check for: Classic Burger`, description: 'Audit a newly made "Classic Burger" against its golden standard photo.', source: 'Manager Assignment', status: 'Pending', itemToAudit: 'Classic Burger', type: 'qa' }
];

type Task = { id: number; name: string; description: string; area: string; priority: string; status: 'Pending' | 'In Progress'; type: 'regular' };
type QaTask = { id: number; name: string; description: string; source: string; status: 'Pending' | 'In Progress'; itemToAudit: string; standardImageUrl?: string; type: 'qa' };

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
    const [verificationResult, setVerificationResult] = useState<VerifyTaskProofOutput | null>(null);

    // State for "Explain Why" dialog
    const [isExplainDialogOpen, setIsExplainDialogOpen] = useState(false);
    const [taskToExplain, setTaskToExplain] = useState<(Task | QaTask) | null>(null);
    const [explanation, setExplanation] = useState<string | null>(null);
    const [isExplaining, setIsExplaining] = useState(false);


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
                            toast({ title: 'New QA Task Assigned!', description: newTask.name });
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
        setVerificationResult(null);
    };
    
    const handleCloseProofDialog = () => {
        setIsProofDialogOpen(false);
        setTaskForProof(null);
        setProofPhoto(null);
        setIsVerifying(false);
        setVerificationResult(null);
    }

    const handleSubmitProof = async () => {
        if (!proofPhoto || !taskForProof) {
            toast({ variant: 'destructive', title: 'No photo provided.' });
            return;
        }
        setIsVerifying(true);
        setVerificationResult(null);
        try {
            const result = await verifyTaskProofAction({
                photoDataUri: proofPhoto,
                taskDescription: taskForProof.name,
            });

            if (result.error || !result.data) {
                throw new Error(result.error || "Verification failed.");
            }
            
            setVerificationResult(result.data);

            if (result.data.isApproved) {
                setTimeout(() => {
                    handleTaskCompletion(taskForProof.id);
                    handleCloseProofDialog();
                }, 1500); // Give user time to read the message
            }

        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsVerifying(false);
        }
    };
    
    const handleOpenExplainDialog = async (task: Task | QaTask) => {
        setTaskToExplain(task);
        setIsExplainDialogOpen(true);
        setIsExplaining(true);
        setExplanation(null);
        try {
            const { data, error } = await explainTaskImportanceAction({
                taskTitle: task.name,
                taskDescription: task.description,
            });
            if (error || !data) {
                throw new Error(error || 'Failed to get explanation.');
            }
            setExplanation(data.explanation);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'AI Error', description: error.message });
        } finally {
            setIsExplaining(false);
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
                                            <TableCell className="font-medium">{task.name}</TableCell>
                                            <TableCell className="text-muted-foreground">{task.type === 'qa' ? task.source : (task as Task).area}</TableCell>
                                            <TableCell>
                                                <Badge variant={task.type === 'qa' || (task as Task).priority === "High" ? "destructive" : "secondary"}>
                                                    {task.type === 'qa' ? 'High Priority' : (task as Task).priority}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right space-x-1">
                                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleOpenExplainDialog(task)}>
                                                    <HelpCircle className="h-4 w-4" />
                                                    <span className="sr-only">Why is this important?</span>
                                                </Button>
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
                            Take a photo to verify completion of the task: <span className="font-semibold">{taskForProof?.name}</span>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <PhotoUploader onPhotoDataChange={setProofPhoto} />
                        {verificationResult && (
                             <Alert variant={verificationResult.isApproved ? 'default' : 'destructive'}>
                                <Sparkles className="h-4 w-4" />
                                <AlertTitle>AI Verification Feedback</AlertTitle>
                                <AlertDescription>{verificationResult.feedback}</AlertDescription>
                            </Alert>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="secondary" onClick={handleCloseProofDialog}>Cancel</Button>
                        <Button onClick={handleSubmitProof} disabled={isVerifying || !proofPhoto || !!verificationResult}>
                            {isVerifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
                            Submit for AI Verification
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={isExplainDialogOpen} onOpenChange={setIsExplainDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                         <DialogTitle className="font-headline flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" /> Why is this important?
                        </DialogTitle>
                        <DialogDescription>
                           AI-generated explanation for task: <span className="font-semibold">{taskToExplain?.name}</span>
                        </DialogDescription>
                    </DialogHeader>
                     <div className="py-4 space-y-4">
                        {isExplaining ? (
                            <div className="flex items-center justify-center p-8 space-x-2">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                <p className="text-muted-foreground">AI is generating an explanation...</p>
                            </div>
                        ) : (
                            <Alert>
                                <AlertDescription>{explanation || "Sorry, I could not generate an explanation."}</AlertDescription>
                            </Alert>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
