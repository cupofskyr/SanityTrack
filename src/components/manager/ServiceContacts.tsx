
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import PhotoUploader from '../photo-uploader';
import { Loader2, Sparkles, AlertCircle, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { analyzeIssueAction } from '@/app/actions';
import type { AnalyzeIssueOutput } from '@/ai/schemas/issue-analysis-schemas';

const contacts = [
  { name: 'Apex Plumbing', trade: 'Plumber', phone: '(555) 123-4567' },
  { name: 'Volt Electric', trade: 'Electrician', phone: '(555) 987-6543' },
  { name: 'Cool HVAC Co.', trade: 'HVAC', phone: '(555) 555-1212' },
  { name: 'General Handyman', trade: 'General Maintenance', phone: '(555) 222-3333' },
];

export default function ServiceContacts() {
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [issueDescription, setIssueDescription] = useState('');
    const [issuePhoto, setIssuePhoto] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalyzeIssueOutput | null>(null);

    const handleAnalyze = async () => {
        if (!issueDescription.trim()) {
            toast({ variant: 'destructive', title: 'Please describe the issue.' });
            return;
        }
        setIsAnalyzing(true);
        setAnalysisResult(null);

        try {
            const result = await analyzeIssueAction({ description: issueDescription, photoDataUri: issuePhoto || undefined });
            if (result.error || !result.data) {
                throw new Error(result.error || "AI analysis failed.");
            }
            setAnalysisResult(result.data);
            toast({ title: "AI Analysis Complete" });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'AI Error', description: error.message });
        } finally {
            setIsAnalyzing(false);
        }
    };
    
    const resetDialog = () => {
        setIssueDescription('');
        setIssuePhoto(null);
        setAnalysisResult(null);
        setIsAnalyzing(false);
    }

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                 <p className="text-sm text-muted-foreground">A directory of approved service professionals for your location.</p>
                 <Dialog open={isDialogOpen} onOpenChange={(open) => {
                     setIsDialogOpen(open);
                     if (!open) resetDialog();
                 }}>
                     <DialogTrigger asChild>
                         <Button variant="outline" size="sm" className="mt-2 sm:mt-0">Diagnose New Issue</Button>
                     </DialogTrigger>
                     <DialogContent className="max-w-2xl">
                         <DialogHeader>
                            <DialogTitle className="font-headline flex items-center gap-2"><Sparkles className="text-primary" /> AI Problem Solver</DialogTitle>
                            <DialogDescription>Describe the problem and upload a photo. The AI will help you figure out who to call.</DialogDescription>
                         </DialogHeader>
                         <div className="grid md:grid-cols-2 gap-6 py-4">
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="issue-description">Problem Description</Label>
                                    <Textarea id="issue-description" placeholder="e.g., The sink in the main restroom is leaking water from the base." value={issueDescription} onChange={(e) => setIssueDescription(e.target.value)} rows={4}/>
                                </div>
                                 <div className="grid gap-2">
                                    <Label>Photo (Optional)</Label>
                                    <PhotoUploader onPhotoDataChange={setIssuePhoto} />
                                </div>
                                <Button onClick={handleAnalyze} disabled={isAnalyzing || !issueDescription}>
                                    {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                    Analyze Issue
                                </Button>
                            </div>
                            <div className="space-y-4">
                                {analysisResult ? (
                                    <Alert variant={analysisResult.isEmergency ? "destructive" : "default"}>
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle className="font-bold">AI Diagnosis: {analysisResult.urgency} Urgency</AlertTitle>
                                        <AlertDescription className="space-y-2 mt-2">
                                            <p><strong>Category:</strong> {analysisResult.category}</p>
                                            <p><strong>Suggested Contact:</strong> <span className="font-semibold text-foreground">{analysisResult.suggestedContact}</span></p>
                                            <p><strong>Recommended Action:</strong> {analysisResult.suggestedAction}</p>
                                        </AlertDescription>
                                    </Alert>
                                ) : (
                                    <div className="h-full flex items-center justify-center border-2 border-dashed rounded-md bg-muted/50 p-4">
                                        <p className="text-sm text-muted-foreground text-center">Analysis results will appear here.</p>
                                    </div>
                                )}
                            </div>
                         </div>
                     </DialogContent>
                 </Dialog>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Trade</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {contacts.map(contact => (
                        <TableRow key={contact.name}>
                            <TableCell className="font-semibold">{contact.trade}</TableCell>
                            <TableCell>{contact.name}</TableCell>
                            <TableCell>{contact.phone}</TableCell>
                            <TableCell className="text-right">
                                <Button asChild variant="outline" size="sm">
                                    <a href={`tel:${contact.phone}`}>
                                        <Phone className="mr-2 h-4 w-4"/> Call Now
                                    </a>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </>
    );
}
