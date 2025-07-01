
"use client";

import { useState, useEffect, FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Thermometer, AlertTriangle, Printer, Info, Clock, MailWarning, Phone, Send, CheckCircle, MessageSquare, Megaphone, Utensils, Sigma, Loader2 } from "lucide-react";
import { format, formatDistanceToNow } from 'date-fns';
import type { TimeClockLog } from '@/lib/types';
import { generateWarningLetterAction } from '@/app/actions';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { GenerateWarningLetterOutput } from '@/ai/schemas/warning-letter-schemas';
import ComplianceChart from '@/components/compliance-chart';
import type { CameraAnalysisOutput } from '@/ai/schemas/camera-analysis-schemas';
import Image from 'next/image';
import { Textarea } from '@/components/ui/textarea';

const initialTempData = {
    'Walk-in Cooler': 38,
    'Prep Cooler 1': 40,
    'Freezer': -2,
    'Holding Cabinet': 145,
};

const complianceData = [
  { month: "Jan", score: 92 },
  { month: "Feb", score: 95 },
  { month: "Mar", score: 88 },
  { month: "Apr", score: 91 },
  { month: "May", score: 96 },
  { month: "Jun", score: 94 },
];

type TempData = typeof initialTempData;

type AiCameraReport = {
    reportId: string;
    timestamp: string;
} & CameraAnalysisOutput;

export default function ManagerDashboard() {
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

    useEffect(() => {
        // Simulate real-time temperature fluctuations
        const tempInterval = setInterval(() => {
            setTempData(prevData => {
                const newCoolerTemp = prevData['Walk-in Cooler'] > 41 ? 45 : prevData['Walk-in Cooler'] + (Math.random() > 0.8 ? 1 : -0.2);
                return {
                    ...prevData,
                    'Walk-in Cooler': parseFloat(newCoolerTemp.toFixed(1)),
                    'Prep Cooler 1': parseFloat((prevData['Prep Cooler 1'] + (Math.random() - 0.5)).toFixed(1)),
                }
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

    return (
        <div className="space-y-6">
             {aiReport && (
                <Card className="lg:col-span-3 border-accent animate-pulse-slow">
                    <form onSubmit={handlePostReport}>
                        <CardHeader>
                            <CardTitle className="font-headline text-accent flex items-center gap-2">
                                <Megaphone/> New Report from Owner
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
                                <Alert>
                                    <Sigma className="h-4 w-4" />
                                    <AlertTitle>AI Analysis: {aiReport.output.reportTitle}</AlertTitle>
                                    <AlertDescription>
                                         <ul className="list-disc list-inside mt-2 text-sm">
                                            {aiReport.output.observations.map((obs, i) => <li key={i}>{obs}</li>)}
                                        </ul>
                                    </AlertDescription>
                                </Alert>
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
                        <CardTitle className="font-headline flex items-center gap-2"><Thermometer/> Live Temperature Monitoring (Simulated)</CardTitle>
                        <CardDescription>Real-time data from your connected equipment. Alerts are triggered for out-of-range temperatures.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                        {Object.entries(tempData).map(([name, temp]) => {
                            const isAlert = name.includes('Cooler') && temp > 41 || name.includes('Freezer') && temp > 0;
                            return (
                                <Card key={name} className={cn(isAlert && "bg-destructive/10 border-destructive")}>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">{name}</CardTitle>
                                        {isAlert && <AlertTriangle className="h-4 w-4 text-destructive"/>}
                                    </CardHeader>
                                    <CardContent><div className="text-2xl font-bold">{temp}°F</div></CardContent>
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
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><Printer /> Monthly Reporting</CardTitle>
                        <CardDescription>Generate a printable report of this month's activities.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full" onClick={() => setIsReportDialogOpen(true)}><Printer className="mr-2 h-4 w-4" /> Generate Report</Button>
                        <Alert className="mt-4">
                            <Info className="h-4 w-4" />
                            <AlertTitle>For Your Records</AlertTitle>
                            <AlertDescription>In a production app, this report could be automatically generated and emailed to you and the owner monthly.</AlertDescription>
                        </Alert>
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
                            const isLate = log.status.includes('Late');
                            return (
                                <TableRow key={log.timestamp}>
                                    <TableCell className="font-medium">{log.employeeName}</TableCell>
                                    <TableCell>{format(new Date(log.timestamp), 'p')} ({formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })})</TableCell>
                                    <TableCell><Badge variant={isLate ? 'destructive' : 'default'}>{log.status}</Badge></TableCell>
                                    <TableCell className="text-right">
                                        {isLate && (
                                            <Button variant="outline" size="sm" onClick={() => handleGenerateWarning(log, log.status)}>
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
