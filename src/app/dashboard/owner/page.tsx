
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  analyzeCameraImageAction,
  fetchToastDataAction,
  summarizeReviewsAction,
  postJobAction,
  suggestTaskAssignmentAction,
  estimateStockLevelAction
} from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, AlertCircle, Rss, BarChart2, Briefcase, UserCheck, Check, X, Send, Package, ShoppingCart } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CameraAnalysisOutput } from '@/ai/flows/cameraAnalysisFlow';
import type { ToastPOSData } from '@/ai/flows/fetch-toast-data-flow';
import type { SummarizeReviewsOutput } from '@/ai/schemas/review-summary-schemas';
import type { SuggestTaskAssignmentOutput } from '@/ai/schemas/task-assignment-schemas';
import type { EstimateStockLevelOutput } from '@/ai/schemas/stock-level-schemas';

type HiringRequest = {
    id: number;
    manager: string;
    location: string;
    role: string;
    urgency: string;
    shiftType: 'Full-time' | 'Part-time' | 'Contract';
    justification: string;
};

const locations = ["Downtown", "Uptown", "Suburb"];

const cupStockImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARgAAAEYCAYAAADw5sJwAAAA60lEQVR4nO3UAQ0AMAjAsKM78OgA/x9I0AElzR2b8/MFAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAN2OFY/gH/9E3AAAAAElFTkSuQmCC";

export default function OwnerDashboard() {
  const { toast } = useToast();
  const camera = {
    id: 'cam-01',
    location: 'Front Counter',
    imageUrl: 'https://storage.googleapis.com/gen-ai-recipes/person-in-restaurant.jpg',
  };

  const [analysisPrompt, setAnalysisPrompt] = useState('How many customers are in line, and what is the estimated wait time? Are any staff members idle?');
  const [cameraReport, setCameraReport] = useState<CameraAnalysisOutput | null>(null);
  const [isAnalyzingCamera, setIsAnalyzingCamera] = useState(false);
  
  const [selectedLocation, setSelectedLocation] = useState(locations[0]);
  const [toastData, setToastData] = useState<ToastPOSData | null>(null);
  const [isFetchingToast, setIsFetchingToast] = useState(false);

  const [reviewSummary, setReviewSummary] = useState<SummarizeReviewsOutput | null>(null);
  const [isFetchingReviews, setIsFetchingReviews] = useState(false);

  const [taskSuggestion, setTaskSuggestion] = useState<SuggestTaskAssignmentOutput | null>(null);
  const [isSuggestingTask, setIsSuggestingTask] = useState(false);

  const [hiringRequests, setHiringRequests] = useState<HiringRequest[]>([]);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [requestToReject, setRequestToReject] = useState<HiringRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const [stockLevel, setStockLevel] = useState<EstimateStockLevelOutput | null>(null);
  const [isCheckingStock, setIsCheckingStock] = useState(false);

  useEffect(() => {
    // Load hiring requests from localStorage on mount
    const storedRequests = localStorage.getItem('hiringRequests');
    if (storedRequests) {
        setHiringRequests(JSON.parse(storedRequests));
    }
  }, []);

  useEffect(() => {
    // When location changes, fetch new data
    handleFetchToastData();
    setReviewSummary(null); // Clear reviews when location changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLocation]);

  const handleAnalyzeCamera = async () => {
    setIsAnalyzingCamera(true);
    setCameraReport(null);

    const result = await analyzeCameraImageAction({
      imageUrl: camera.imageUrl,
      analysisPrompt,
    });

    if (result.error || !result.data) {
      toast({ variant: 'destructive', title: 'Analysis Failed', description: result.error });
    } else {
      setCameraReport(result.data);
      toast({ title: 'Analysis Complete' });
    }
    setIsAnalyzingCamera(false);
  };

  const handleFetchToastData = async () => {
      setIsFetchingToast(true);
      const result = await fetchToastDataAction({ location: selectedLocation });
      if (result.data) {
          setToastData(result.data);
      } else {
          toast({ variant: 'destructive', title: 'Sales Data Error', description: result.error });
      }
      setIsFetchingToast(false);
  };
  
  const handleFetchReviews = async (source: 'Google' | 'Yelp') => {
      setIsFetchingReviews(true);
      setReviewSummary(null);
      const result = await summarizeReviewsAction({ source, location: selectedLocation });
      if (result.data) {
          setReviewSummary(result.data);
          toast({ title: `${source} Reviews Loaded` });
      } else {
          toast({ variant: 'destructive', title: 'Review Fetch Error', description: result.error });
      }
      setIsFetchingReviews(false);
  };
  
  const handleSuggestTask = async () => {
      setIsSuggestingTask(true);
      setTaskSuggestion(null);
      // Dummy data for suggestion
      const issue = { issueDescription: 'The main POS terminal is crashing repeatedly during peak hours.', teamMembers: [{name: 'Alex Ray', role: 'Manager' as const}, {name: 'John Doe', role: 'Employee' as const}] };
      const result = await suggestTaskAssignmentAction(issue);
      if (result.data) {
          setTaskSuggestion(result.data);
      } else {
          toast({ variant: 'destructive', title: 'Task Suggestion Error', description: result.error });
      }
      setIsSuggestingTask(false);
  };

  const handleCheckStock = async () => {
    setIsCheckingStock(true);
    setStockLevel(null);
    const result = await estimateStockLevelAction({ currentStockImageUri: cupStockImage });
    if (result.data) {
      setStockLevel(result.data);
      toast({title: "Stock Level Assessed"});
    } else {
      toast({ variant: 'destructive', title: 'Stock Check Error', description: result.error });
    }
    setIsCheckingStock(false);
  }

  const handleApproveRequest = async (request: HiringRequest) => {
    toast({ title: 'Posting Job...', description: `Submitting request for a ${request.role}.` });
    
    const result = await postJobAction({
        role: request.role,
        location: request.location,
        shiftType: request.shiftType,
    });

    if (result.data) {
        toast({
            title: 'Job Posted Successfully!',
            description: `Confirmation ID: ${result.data.confirmationId}`,
        });
        // Remove from list after successful posting
        const updatedRequests = hiringRequests.filter(r => r.id !== request.id);
        setHiringRequests(updatedRequests);
        localStorage.setItem('hiringRequests', JSON.stringify(updatedRequests));
    } else {
        toast({
            variant: 'destructive',
            title: 'Job Posting Failed',
            description: result.error,
        });
    }
  };

  const openRejectDialog = (request: HiringRequest) => {
      setRequestToReject(request);
      setIsRejectDialogOpen(true);
  };

  const handleRejectRequest = () => {
      if (!requestToReject || !rejectionReason) {
          toast({ variant: 'destructive', title: 'Reason required', description: 'Please provide a reason for rejection.' });
          return;
      }

      // Add to rejected list for manager's view
      const rejectedList = JSON.parse(localStorage.getItem('rejectedHiringRequests') || '[]');
      rejectedList.push({ ...requestToReject, ownerComment: rejectionReason });
      localStorage.setItem('rejectedHiringRequests', JSON.stringify(rejectedList));
      
      // Remove from pending list
      const updatedRequests = hiringRequests.filter(r => r.id !== requestToReject.id);
      setHiringRequests(updatedRequests);
      localStorage.setItem('hiringRequests', JSON.stringify(updatedRequests));

      toast({ title: 'Request Rejected', description: 'The manager has been notified.' });
      setIsRejectDialogOpen(false);
      setRejectionReason('');
      setRequestToReject(null);
  };

  return (
    <div className="space-y-6">
       <Card>
            <CardHeader>
                <CardTitle className="font-headline">Location Overview</CardTitle>
                <CardDescription>Select a location to view its live sales and customer feedback.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger className="w-full md:w-1/3">
                        <SelectValue placeholder="Select location..." />
                    </SelectTrigger>
                    <SelectContent>
                        {locations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                    </SelectContent>
                </Select>
            </CardContent>
        </Card>
        
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><BarChart2 /> Live Sales Data (Simulated)</CardTitle>
                    <CardDescription>Real-time sales figures for {selectedLocation} powered by Toast POS integration.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isFetchingToast ? <Loader2 className="h-6 w-6 animate-spin" /> : toastData ? (
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                                <p className="text-sm text-muted-foreground">Today's Sales</p>
                                <p className="text-3xl font-bold">${toastData.liveSalesToday.toLocaleString()}</p>
                            </div>
                             <div>
                                <p className="text-sm text-muted-foreground">Month-to-Date Sales</p>
                                <p className="text-3xl font-bold">${toastData.salesThisMonth.toLocaleString()}</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-muted-foreground">Could not load sales data.</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><UserCheck /> AI Task Delegation</CardTitle>
                    <CardDescription>Get an AI suggestion for who should handle a critical task.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isSuggestingTask ? <Loader2 className="h-6 w-6 animate-spin" /> : taskSuggestion ? (
                        <Alert>
                            <AlertTitle>Suggestion: Assign to {taskSuggestion.suggestedAssignee}</AlertTitle>
                            <AlertDescription>
                                <strong>Reasoning:</strong> {taskSuggestion.reasoning}
                            </AlertDescription>
                        </Alert>
                    ) : (
                         <Button onClick={handleSuggestTask}>Suggest Assignee for POS issue</Button>
                    )}
                </CardContent>
            </Card>
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><Rss /> Customer Feedback for {selectedLocation}</CardTitle>
                <CardDescription>Fetch and summarize recent reviews from Google or Yelp.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="flex gap-4 mb-6">
                    <Button onClick={() => handleFetchReviews('Google')} disabled={isFetchingReviews}>
                        {isFetchingReviews && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Fetch Google Reviews
                    </Button>
                    <Button onClick={() => handleFetchReviews('Yelp')} disabled={isFetchingReviews} variant="outline">
                         {isFetchingReviews && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Fetch Yelp Reviews
                    </Button>
                </div>
                 {reviewSummary && (
                     <div>
                        <Alert className="mb-4">
                            <AlertTitle className="font-semibold">AI Summary</AlertTitle>
                            <AlertDescription>{reviewSummary.summary}</AlertDescription>
                        </Alert>
                        <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                            {reviewSummary.reviews.map((review, index) => (
                                <div key={index} className="p-3 border rounded-lg bg-muted/50">
                                    <div className="flex justify-between items-start">
                                        <p className="font-semibold">{review.author}</p>
                                        <div className="flex items-center gap-1">
                                            <Badge variant="outline" className="mr-2">{review.source}</Badge>
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-accent' : 'text-muted-foreground/30'}`} fill="currentColor"/>
                                            ))}
                                        </div>
                                    </div>
                                    <blockquote className="text-sm italic border-l-2 pl-3 mt-1">"{review.comment}"</blockquote>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>

      <Card>
        <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Briefcase /> Hiring Requests</CardTitle>
            <CardDescription>Review, approve, or reject new hire requests submitted by your managers.</CardDescription>
        </CardHeader>
        <CardContent>
            {hiringRequests.length > 0 ? (
                <div className="space-y-4">
                    {hiringRequests.map(req => (
                        <Card key={req.id} className="bg-muted/30">
                            <CardHeader>
                                <CardTitle className="text-lg">Request: {req.role} at {req.location}</CardTitle>
                                <CardDescription>Submitted by {req.manager}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm"><strong>Shift:</strong> {req.shiftType} | <strong>Urgency:</strong> {req.urgency}</p>
                                <blockquote className="mt-2 border-l-2 pl-4 text-sm italic">"{req.justification}"</blockquote>
                            </CardContent>
                            <CardFooter className="gap-2">
                                <Button onClick={() => handleApproveRequest(req)}>
                                    <Check className="mr-2 h-4 w-4"/> Approve & Post Job
                                </Button>
                                <Button variant="destructive" onClick={() => openRejectDialog(req)}>
                                    <X className="mr-2 h-4 w-4"/> Reject
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <p className="text-muted-foreground text-center py-4">No pending hiring requests.</p>
            )}
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Camera Analysis</CardTitle>
          <CardDescription>
            Analyze a snapshot from a camera feed using a custom prompt. This feature uses Gemini 1.5 to provide detailed insights.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div>
              <p><strong>Location:</strong> {camera.location}</p>
              <div className="relative w-full aspect-video rounded-lg overflow-hidden border mt-2">
                <Image src={camera.imageUrl} alt="Camera Feed Snapshot" layout="fill" objectFit="cover" data-ai-hint="security camera" />
              </div>
            </div>
            <div className="space-y-4">
               <div className="grid w-full gap-2">
                <Label htmlFor="analysis-prompt">What do you want to know?</Label>
                <Textarea
                  id="analysis-prompt"
                  rows={4}
                  value={analysisPrompt}
                  onChange={(e) => setAnalysisPrompt(e.target.value)}
                  placeholder="e.g., Count customers. Note handwashing events. Estimate wait times."
                />
              </div>
              
              <Button onClick={handleAnalyzeCamera} disabled={isAnalyzingCamera}>
                {isAnalyzingCamera ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    AI is Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Analyze Feed
                  </>
                )}
              </Button>
            </div>
          </div>

          {cameraReport && (
            <div className="space-y-4 pt-4">
              <h4 className="font-headline text-xl">{cameraReport.reportTitle}</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader><CardTitle className="text-base">Observations</CardTitle></CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {cameraReport.observations.map((obs, index) => <li key={index}>{obs}</li>)}
                      </ul>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle className="text-base">Extracted Data</CardTitle></CardHeader>
                    <CardContent>
                      <pre className="text-sm bg-muted p-2 rounded-md overflow-x-auto">
                        {JSON.stringify(cameraReport.data, null, 2)}
                      </pre>
                    </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><Package /> Predictive Stock Monitoring</CardTitle>
                <CardDescription>
                    Use AI to estimate stock levels from a camera feed. This example uses a pre-set image of coffee cups.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div>
                    <p className="font-semibold">Camera: Coffee Cup Dispenser</p>
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden border mt-2">
                        <Image src={cupStockImage} alt="Coffee cup stock" layout="fill" objectFit="contain" data-ai-hint="coffee cups stack" />
                    </div>
                </div>
                <div className="space-y-4">
                    <Button onClick={handleCheckStock} disabled={isCheckingStock}>
                        {isCheckingStock ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
                        Check Stock Level
                    </Button>

                    {stockLevel && (
                        <Alert>
                           <AlertTitle className="flex justify-between">
                                <span>Level: <Badge variant={stockLevel.level === 'Critical' ? 'destructive' : 'secondary'}>{stockLevel.level}</Badge></span>
                                <span>~{stockLevel.estimatedPercentage}% Full</span>
                            </AlertTitle>
                            <AlertDescription className="mt-2">
                                <strong>Recommendation:</strong> {stockLevel.recommendation}
                            </AlertDescription>
                        </Alert>
                    )}
                    {stockLevel?.level === 'Critical' && (
                        <Button variant="destructive">
                            <ShoppingCart className="mr-2 h-4 w-4" /> Add to Emergency Order
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>

       <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Reject Hiring Request</DialogTitle>
                    <DialogDescription>
                        Provide a brief reason for rejecting the request for a {requestToReject?.role}. This will be sent to the manager.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Textarea
                        placeholder="e.g., We don't have the budget for a new hire at this time. Let's revisit in Q4."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                    />
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsRejectDialogOpen(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={handleRejectRequest}>
                        <Send className="mr-2 h-4 w-4"/>
                        Send Rejection
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}
