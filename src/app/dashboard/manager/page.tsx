
"use client";

import { useState, useEffect, FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Thermometer, AlertTriangle, Printer, Clock, MailWarning, Send, MessageSquare, Wrench, Loader2 } from "lucide-react";
import { format, formatDistanceToNow } from 'date-fns';
import type { TimeClockLog } from '@/lib/types';
import { generateWarningLetterAction, submitManualCoolerCheckAction } from '@/app/actions';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { GenerateWarningLetterOutput } from '@/ai/schemas/warning-letter-schemas';
import ComplianceChart from '@/components/compliance-chart';
import type { CameraAnalysisOutput } from '@/ai/schemas/camera-analysis-schemas';
import Image from 'next/image';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import PhotoUploader from '@/components/photo-uploader';
import ServiceContacts from '@/components/manager/ServiceContacts';
import TodaysFlow from '@/components/dashboard/employee/TodaysFlow';
import { useAuth } from '@/context/AuthContext';

type TempReading = {
    value: number;
    source: 'sensor' | 'manual';
    timestamp?: Date;
    submittedBy?: string;
};

type TempData = {
    [key: string]: TempReading;
};

const initialTempData: TempData = {
    'Walk-in Cooler': { value: 38, source: 'sensor' },
    'Prep Cooler 1': { value: 40, source: 'sensor' },
    'Freezer': { value: -2, source: 'manual', timestamp: new Date(Date.now() - 30 * 60 * 1000), submittedBy: 'John Doe' },
    'Holding Cabinet': { value: 145, source: 'sensor' },
};

const complianceData = [
  { month: "Jan", score: 92 },
  { month: "Feb", score: 95 },
  { month: "Mar", score: 88 },
  { month: "Apr", score: 91 },
  { month: "May", score: 96 },
  { month: "Jun", score: 94 },
];

type AiCameraReport = {
    reportId: string;
    timestamp: string;
} & CameraAnalysisOutput;

export default function ManagerDashboard() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [tempData, setTempData] = useState<TempData>(initialTempData);
    const [timeClockLogs, setTimeClockLogs] = useState<TimeClockLog[]>([]);
    const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
    const [isWarningDialogOpen, setIsWarningDialogOpen] = useState(false);
    const [warningContent, setWarningContent] = useState<GenerateWarningLetterOutput | null>(null);
    const [isGeneratingWarning, setIsGeneratingWarning] = useState(false);
    const [selectedLogForWarning, setSelectedLogForWarning] = useState<TimeClockLog | null>(null);
    const [aiReport, setAiReport] = useState<AiCameraReport | null>(null);
    const [managerComment, setManagerComment] = useState('');

    // State for manual temperature submission
    const [isManualTempOpen, setIsManualTempOpen] = useState(false);
    const [manualTempForm, setManualTempForm] = useState({ equipment: '', temperature: '' });
    const [manualTempPhoto, setManualTempPhoto] = useState<string | null>(null);
    const [isSubmittingTemp, setIsSubmittingTemp] = useState(false);

    useEffect(() => {
        // Simulate real-time temperature fluctuations for sensor-based equipment
        const tempInterval = setInterval(() => {
            setTempData(prevData => {
                const newData = { ...prevData };
                for (const key in newData) {
                    if (newData[key].source === 'sensor') {
                        let newTempValue = newData[key].value;
                        if (key.includes('Cooler')) {
                            newTempValue = newData[key].value > 41 ? 45 : newData[key].value + (Math.random() > 0.8 ? 1 : -0.2);
                        } else {
                            newTempValue = newData[key].value + (Math.random() - 0.5);
                        }
                        newData[key] = { ...newData[key], value: parseFloat(newTempValue.toFixed(1)) };
                    }
                }
                return newData;
            });
        }, 3000);

        // Simulate fetching logs and requests from storage
        const checkStorage = () => {
            const logs = JSON.parse(localStorage.getItem('timeClockLogs') || '[]');
            setTimeClockLogs(logs.sort((a:TimeClockLog, b:TimeClockLog) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));

            const report = localStorage.getItem('sentinel-report-for-manager');
            if (report) setAiReport(JSON.parse(report));
        };
        
        checkStorage();
        const storageInterval = setInterval(checkStorage, 2000);

        return () => {
            clearInterval(tempInterval);
            clearInterval(storageInterval);
        };
    }, []);
    
    const handlePrint = () => window.print();

    const handleGenerateWarning = async (log: TimeClockLog, details: string) => {
        setSelectedLogForWarning(log);
        setIsWarningDialogOpen(true);
        setIsGeneratingWarning(true);
        setWarningContent(null);
        try {
            const {data, error} = await generateWarningLetterAction({
                employeeName: log.employeeName,
                latenessDetails: details,
            });
            if (error || !data) throw new Error(error || "Failed to generate warning.");
            setWarningContent(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsGeneratingWarning(false);
        }
    };
    
    const handleSendWarning = () => {
        setIsWarningDialogOpen(false);
        toast({ title: "Warning Sent (Simulated)" });
    };

    const handlePostReport = (e: FormEvent) => {
        e.preventDefault();
        toast({
            title: "Report Posted!",
            description: "The AI Camera report and your comments are now visible to the team."
        });
        localStorage.removeItem('sentinel-report-for-manager');
        setAiReport(null);
        setManagerComment('');
    };

    const handleManualTempSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const { equipment, temperature } = manualTempForm;
        if (!equipment || !temperature || !manualTempPhoto) {
            toast({ variant: 'destructive', title: 'Missing fields', description: 'Please select equipment, enter a temperature, and provide a photo.' });
            return;
        }

        setIsSubmittingTemp(true);
        const result = await submitManualCoolerCheckAction({
            equipment,
            temperature: parseFloat(temperature),
            photoDataUrl: manualTempPhoto,
            user: user?.displayName || 'Manager'
        });
        setIsSubmittingTemp(false);

        if (result.success) {
            setTempData(prev => ({
                ...prev,
                [equipment]: {
                    value: parseFloat(temperature),
                    source: 'manual',
                    timestamp: new Date(),
                    submittedBy: user?.displayName || 'Manager'
                }
            }));
            toast({ title: "Manual Log Submitted", description: `Temperature for ${equipment} has been updated.` });
            setIsManualTempOpen(false);
            setManualTempForm({ equipment: '', temperature: '' });
            setManualTempPhoto(null);
        } else {
            toast({ variant: 'destructive', title: 'Submission Failed', description: result.error });
        }
    };

    return (
        <div className="space-y-6">
             {aiReport && (
                <Card className="lg:col-span-3 border-accent animate-pulse-slow">
                    <form onSubmit={handlePostReport}>
                        <CardHeader>
                            <CardTitle className="font-headline text-accent flex items-center gap-2">
                                <MessageSquare/> New Report from Owner
                            </CardTitle>
                            <CardDescription>
                                The owner has shared a new AI Camera analysis. Review and post it for your team with an optional comment.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-6">
                             <div className="relative w-full aspect-video rounded-md overflow-hidden border">
                               <Image src={aiReport.output.imageUrl} alt="AI Analysis" layout="fill" objectFit="cover" data-ai-hint="security camera" />
                             </div>
                             <div className="space-y-4">
                                <ComplianceChart data={complianceData} />
                                <Textarea 
                                    placeholder="Add a comment for your team... (e.g., 'Great job on the quick cleanup here!' or 'Let's keep an eye on this.')"
                                    value={managerComment}
                                    onChange={e => setManagerComment(e.target.value)}
                                    rows={3}
                                />
                             </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit">
                                <Send className="mr-2 h-4 w-4" /> Post Report to Team Feed
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                 <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><Thermometer/> Live Temperature Monitoring</CardTitle>
                        <CardDescription>Real-time data from sensors and manual checks. Alerts are triggered for out-of-range temperatures.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                        {Object.entries(tempData).map(([name, temp]) => {
                            const { value, source, timestamp, submittedBy } = temp;
                            const isAlert = name.includes('Cooler') && value > 41 || name.includes('Freezer') && value > 0;
                            return (
                                <Card key={name} className={cn(isAlert && "bg-destructive/10 border-destructive")}>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">{name}</CardTitle>
                                        {isAlert && <AlertTriangle className="h-4 w-4 text-destructive"/>}
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{value}°F</div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                                            {source === 'sensor' ? 'Live Sensor' : `by ${submittedBy} ${timestamp ? formatDistanceToNow(timestamp, { addSuffix: true }) : ''}`}
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </CardContent>
                </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2">Compliance Overview</CardTitle>
                        <CardDescription>Monthly compliance scores based on completed tasks and resolved issues.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ComplianceChart data={complianceData} />
                    </CardContent>
                </Card>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2"><Printer /> Monthly Reporting</CardTitle>
                            <CardDescription>Generate a printable report of this month's activities.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full" onClick={() => setIsReportDialogOpen(true)}><Printer className="mr-2 h-4 w-4" /> Generate Report</Button>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Manual Temperature Log</CardTitle>
                            <CardDescription>Simulate an employee submitting a manual temperature check.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Dialog open={isManualTempOpen} onOpenChange={setIsManualTempOpen}>
                                <DialogTrigger asChild>
                                    <Button className="w-full" variant="secondary">Log Manual Temperature</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Log Manual Temperature Check</DialogTitle>
                                        <DialogDescription>
                                            This action simulates an employee completing a scheduled temperature check task. Photo proof is required.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleManualTempSubmit}>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="equipment-select">Equipment</Label>
                                                <Select value={manualTempForm.equipment} onValueChange={(value) => setManualTempForm({...manualTempForm, equipment: value})}>
                                                    <SelectTrigger id="equipment-select">
                                                        <SelectValue placeholder="Select equipment..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.keys(tempData).map(key => <SelectItem key={key} value={key}>{key}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="temperature-input">Temperature (°F)</Label>
                                                <Input
                                                    id="temperature-input"
                                                    type="number"
                                                    value={manualTempForm.temperature}
                                                    onChange={(e) => setManualTempForm({...manualTempForm, temperature: e.target.value})}
                                                    placeholder="e.g., 39"
                                                    required
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>Photo of Thermometer</Label>
                                                <PhotoUploader onPhotoDataChange={setManualTempPhoto} />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit" disabled={isSubmittingTemp}>
                                                {isSubmittingTemp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Submit Log
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card id="service-contacts">
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><Wrench /> Service Contacts &amp; AI Diagnostics</CardTitle>
                        <CardDescription>Quickly diagnose issues and find the right contact number.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ServiceContacts />
                    </CardContent>
                </Card>
                <Card id="social-chat">
                    <CardHeader>
                        <CardTitle className="font-headline">Today's Flow</CardTitle>
                         <CardDescription>A daily micro-thread for shift notes and team communication.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TodaysFlow />
                    </CardContent>
                </Card>
            </div>
            
            <Card id="time-clock-feed" className="lg:col-span-3">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Clock/> Live Time Clock Feed</CardTitle>
                    <CardDescription>A real-time log of employee clock-ins and outs. AI can draft punctuality warnings.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Employee</TableHead><TableHead>Time</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                        <TableBody>
                        {timeClockLogs.map(log => {
                            const isLate = log.status?.includes('Late');
                            return (
                                <TableRow key={log.timestamp}>
                                    <TableCell className="font-medium">{log.employeeName}</TableCell>
                                    <TableCell>{format(new Date(log.timestamp), 'p')} ({formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })})</TableCell>
                                    <TableCell><Badge variant={isLate ? 'destructive' : 'default'}>{log.status}</Badge></TableCell>
                                    <TableCell className="text-right">
                                        {isLate && (
                                            <Button variant="outline" size="sm" onClick={() => handleGenerateWarning(log, log.status || 'Late')}>
                                                <MailWarning className="mr-2 h-4 w-4" /> AI Warning
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle className="font-headline text-2xl">Monthly Activity Report</DialogTitle>
                        <DialogDescription>Summary for {format(new Date(), 'MMMM yyyy')}</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-6 max-h-[70vh] overflow-y-auto pr-4">
                        <p className="text-muted-foreground">This is a placeholder for the full, printable monthly report content.</p>
                    </div>
                    <DialogFooter>
                        <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Print Report</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isWarningDialogOpen} onOpenChange={setIsWarningDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>AI-Generated Warning</DialogTitle>
                        <DialogDescription>
                            A professional warning has been drafted for {selectedLogForWarning?.employeeName}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        {isGeneratingWarning ? (
                            <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin"/></div>
                        ) : warningContent ? (
                            <div>
                                <h4 className="font-semibold">{warningContent.subject}</h4>
                                <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{warningContent.body}</p>
                            </div>
                        ) : <p>Failed to generate warning content.</p>}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsWarningDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSendWarning} disabled={isGeneratingWarning}>Send Warning</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
