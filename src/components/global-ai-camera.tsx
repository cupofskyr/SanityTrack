
"use client";

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, Sparkles, Loader2, Clipboard, AlertTriangle, FilePen, Edit } from 'lucide-react';
import PhotoUploader from './photo-uploader';
import { analyzePhotoIssueAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle } from './ui/alert';

export default function GlobalAICamera() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [photoForAnalysis, setPhotoForAnalysis] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);

    const pathname = usePathname();
    const router = useRouter();
    const { toast } = useToast();

    const getRole = () => {
        if (pathname.includes("/owner")) return "Owner";
        if (pathname.includes("/employee")) return "Employee";
        if (pathname.includes("/manager")) return "Manager";
        if (pathname.includes("/health-department")) return "Health Department";
        return "User";
    };
    const role = getRole();

    const handleAnalyzePhoto = async () => {
        if (!photoForAnalysis) return;
        setIsAnalyzing(true);
        setAnalysisResult(null);
        try {
            const result = await analyzePhotoIssueAction({ photoDataUri: photoForAnalysis });
            if (result.error) {
                toast({ variant: 'destructive', title: 'AI Analysis Failed', description: result.error });
            } else if (result.data) {
                setAnalysisResult(result.data.suggestion);
            }
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'AI Analysis Failed', description: 'Could not analyze the photo.' });
        } finally {
            setIsAnalyzing(false);
        }
    };
    
    const handleAction = (action: 'reportIssue' | 'addToMemo' | 'startInvestigation') => {
        if (!analysisResult) return;
        
        switch (action) {
            case 'reportIssue':
                localStorage.setItem('ai-issue-suggestion', analysisResult);
                // Managers have a more complex issue analyzer, employees have a simple report dialog.
                // Let's send managers to their dashboard and employees to theirs.
                if (role === 'Manager') {
                    router.push('/dashboard/manager');
                } else {
                    router.push('/dashboard/employee');
                }
                break;
            case 'addToMemo':
                localStorage.setItem('ai-memo-suggestion', analysisResult);
                router.push('/dashboard/owner');
                break;
            case 'startInvestigation':
                localStorage.setItem('ai-investigation-suggestion', analysisResult);
                router.push('/dashboard/health-department');
                break;
        }
        resetAndClose();
    };

    const handleCopyToClipboard = () => {
        if (!analysisResult) return;
        navigator.clipboard.writeText(analysisResult);
        toast({ title: 'Copied to Clipboard', description: 'The AI-generated description has been copied.' });
    };
    
    const resetAndClose = () => {
        setIsDialogOpen(false);
        setPhotoForAnalysis(null);
        setAnalysisResult(null);
        setIsAnalyzing(false);
    }

    const renderActionButtons = () => {
        if (!analysisResult) return null;
    
        let actionButton = null;
    
        if (role === 'Employee') {
            actionButton = (
                <Button onClick={() => handleAction('reportIssue')}>
                    <AlertTriangle className="mr-2" /> Create Issue Report
                </Button>
            );
        } else if (role === 'Manager') {
            actionButton = (
                <Button onClick={() => handleAction('reportIssue')}>
                    <AlertTriangle className="mr-2" /> Analyze as Issue
                </Button>
            );
        } else if (role === 'Owner') {
            actionButton = (
                <Button onClick={() => handleAction('addToMemo')}>
                    <Edit className="mr-2" /> Add to Memo Board
                </Button>
            );
        } else if (role === 'Health Department') {
            actionButton = (
                <Button onClick={() => handleAction('startInvestigation')}>
                    <FilePen className="mr-2" /> Start Investigation
                </Button>
            );
        }
    
        return (
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
                {actionButton}
                <Button variant="outline" onClick={handleCopyToClipboard}>
                    <Clipboard className="mr-2"/> Copy Description
                </Button>
            </div>
        );
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
            if (!open) {
                resetAndClose();
            } else {
                setIsDialogOpen(true);
            }
        }}>
            <DialogTrigger asChild>
                <SidebarMenuItem>
                    <SidebarMenuButton variant="outline" className="w-full justify-start text-muted-foreground hover:text-foreground" tooltip="Universal AI Camera">
                        <Camera />
                        <span>AI Camera</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="font-headline flex items-center gap-2">
                        <Sparkles className="text-primary h-5 w-5" />
                        Universal AI Camera
                    </DialogTitle>
                    <DialogDescription>
                        Take a photo of anything and let the AI analyze it and suggest a relevant action for you.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <PhotoUploader onPhotoDataChange={setPhotoForAnalysis} />
                    
                    {photoForAnalysis && !analysisResult && (
                        <Button
                            className="w-full"
                            onClick={handleAnalyzePhoto}
                            disabled={isAnalyzing}
                        >
                            {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            Analyze Photo
                        </Button>
                    )}

                    {isAnalyzing && (
                         <div className="flex items-center justify-center p-4 space-x-2">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            <p className="text-muted-foreground">AI is analyzing the image...</p>
                        </div>
                    )}

                    {analysisResult && (
                        <div>
                            <Alert>
                                <Sparkles className="h-4 w-4" />
                                <AlertTitle>AI Analysis</AlertTitle>
                                <p className="text-sm text-foreground">{analysisResult}</p>
                            </Alert>
                            {renderActionButtons()}
                        </div>
                    )}
                </div>
                 <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">
                            Close
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
