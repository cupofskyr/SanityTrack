
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import useWindowSize from 'react-use/lib/useWindowSize';
import Confetti from 'react-confetti';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Check, Clock, ListTodo, ShieldCheck, Sparkles, Trophy, Zap, MessageSquare, Briefcase, BarChart, BookOpen, AlertCircle, Award, CalendarDays, Loader2, Camera } from "lucide-react";
import LiveTeamFeed from '@/components/dashboard/employee/LiveTeamFeed';
import WhosOnShift from '@/components/dashboard/employee/WhosOnShift';
import TodaysFlow from '@/components/dashboard/employee/TodaysFlow';
import PerformanceCard from '@/components/dashboard/employee/PerformanceCard';
import TeamLeaderboard from '@/components/dashboard/employee/TeamLeaderboard';
import ShiftRecapDialog from '@/components/dashboard/employee/ShiftRecapDialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PhotoUploader from '@/components/photo-uploader';
import { verifyTaskProofAction } from '@/app/actions';

const initialTasks = [
  { id: 1, name: "Clean kitchen floor", area: "Kitchen", priority: "High", status: 'Pending', type: 'regular', xp: 50 },
  { id: 2, name: "Restock restroom supplies", area: "Restroom", priority: "Medium", status: 'Pending', type: 'regular', xp: 30 },
  { id: 3, name: "Sanitize all door handles", area: "All Areas", priority: "High", status: 'In Progress', type: 'regular', xp: 40 },
];

const initialQaTasks = [
  { id: 4, description: `Perform QA check for: Classic Burger`, source: 'Manager Assignment', status: 'Pending', itemToAudit: 'Classic Burger', standardImageUrl: '', type: 'qa', xp: 100 }
];

type Task = { id: number; name: string; area: string; priority: string; status: 'Pending' | 'In Progress'; type: 'regular'; xp: number };
type QaTask = { id: number; description: string; source: string; status: 'Pending' | 'In Progress'; itemToAudit: string; standardImageUrl: string; type: 'qa'; xp: number };

export default function EmployeeDashboardV2() {
    const { toast } = useToast();
    const { width, height } = useWindowSize();
    
    const [tasks, setTasks] = useState<(Task | QaTask)[]>(initialTasks);
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

    const totalTasks = useMemo(() => initialTasks.length + initialQaTasks.length, []);
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
                <span className={cn("h-2 w-2 rounded-full animate-pulse", colorClass)} />
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
                            <div className="space-y-3">
                                {tasks.map(task => (
                                    <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary">
                                            {task.type === 'qa' ? <ShieldCheck className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">{task.type === 'qa' ? task.description : task.name}</p>
                                            <p className="text-xs text-muted-foreground">{task.type === 'qa' ? task.source : task.area}</p>
                                        </div>
                                        <Badge variant={task.type === 'qa' || (task as Task).priority === "High" ? "destructive" : "secondary"}>
                                            {task.type === 'qa' ? 'High Priority' : (task as Task).priority}
                                        </Badge>
                                        <Button size="sm" onClick={() => handleOpenProofDialog(task)}>
                                            <Check className="mr-2 h-4 w-4" /> Done
                                        </Button>
                                    </div>
                                ))}
                            </div>
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
                    
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><CalendarDays /> My Schedule</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">Your next shift is on Tuesday at 9:00 AM.</p>
                            <Button asChild className="w-full" variant="outline">
                                <Link href="/dashboard/employee/schedule">View Full Schedule & Set Preferences</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <WhosOnShift />
                    <PerformanceCard xpEarned={xpEarned} />
                    <TodaysFlow />
                    <TeamLeaderboard />
                </div>
            </div>

            <Dialog open={isProofDialogOpen} onOpenChange={handleCloseProofDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className='font-headline'>Submit Proof of Completion</DialogTitle>
                        <DialogDescription>
                            Take a photo to verify completion of the task: <span className="font-semibold">{taskForProof?.type === 'regular' ? taskForProof.name : taskForProof?.description}</span>
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
