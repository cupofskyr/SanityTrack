
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  fetchToastDataAction,
  summarizeReviewsAction,
  postJobAction,
  estimateStockLevelAction
} from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, Rss, BarChart2, Briefcase, Check, X, Send, Package, ShoppingCart, PlusCircle, Building, User, Phone } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import type { ToastPOSData } from '@/ai/flows/fetch-toast-data-flow';
import type { SummarizeReviewsOutput } from '@/ai/schemas/review-summary-schemas';
import type { EstimateStockLevelOutput } from '@/ai/schemas/stock-level-schemas';
import OwnerServiceAlertWidget from '@/components/owner-service-alert-widget';
import { Input } from '@/components/ui/input';

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

  const [selectedLocation, setSelectedLocation] = useState(locations[0]);
  const [toastData, setToastData] = useState<ToastPOSData | null>(null);
  const [isFetchingToast, setIsFetchingToast] = useState(false);

  const [reviewSummary, setReviewSummary] = useState<SummarizeReviewsOutput | null>(null);
  const [isFetchingReviews, setIsFetchingReviews] = useState(false);

  const [hiringRequests, setHiringRequests] = useState<HiringRequest[]>([]);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [requestToReject, setRequestToReject] = useState<HiringRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const [stockLevel, setStockLevel] = useState<EstimateStockLevelOutput | null>(null);
  const [isCheckingStock, setIsCheckingStock] = useState(false);
  
  // State for Onboarding Wizard
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState({
      locationName: '',
      locationAddress: '',
      managerName: '',
      managerEmail: '',
      contactName: '',
      contactPhone: '',
  });

  useEffect(() => {
    // Show onboarding for new users
    const isNew = sessionStorage.getItem('isNewUser');
    if (isNew === 'true') {
        setShowOnboarding(true);
    }
  
    // Load hiring requests from localStorage on mount
    const storedRequests = localStorage.getItem('hiringRequests');
    if (storedRequests) {
        setHiringRequests(JSON.parse(storedRequests));
    }
  }, []);

  useEffect(() => {
    handleFetchToastData();
    setReviewSummary(null); 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLocation]);
  
  const handleOnboardingNext = () => setOnboardingStep(prev => prev + 1);
  const handleOnboardingBack = () => setOnboardingStep(prev => prev - 1);
  
  const handleCompleteOnboarding = (e: React.FormEvent) => {
      e.preventDefault();
      // In a real app, you would save this data to Firestore
      console.log("Onboarding data submitted:", onboardingData);
      sessionStorage.removeItem('isNewUser');
      setShowOnboarding(false);
      toast({ title: 'Setup Complete!', description: 'Welcome to your SanityTrack dashboard.' });
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

      const rejectedList = JSON.parse(localStorage.getItem('rejectedHiringRequests') || '[]');
      rejectedList.push({ ...requestToReject, ownerComment: rejectionReason });
      localStorage.setItem('rejectedHiringRequests', JSON.stringify(rejectedList));
      
      const updatedRequests = hiringRequests.filter(r => r.id !== requestToReject.id);
      setHiringRequests(updatedRequests);
      localStorage.setItem('hiringRequests', JSON.stringify(updatedRequests));

      toast({ title: 'Request Rejected', description: 'The manager has been notified.' });
      setIsRejectDialogOpen(false);
      setRejectionReason('');
      setRequestToReject(null);
  };

  const renderOnboardingStep = () => {
      switch (onboardingStep) {
          case 1:
              return (
                  <div>
                      <DialogHeader>
                          <DialogTitle className="font-headline text-2xl">Step 1: Create Your First Location</DialogTitle>
                          <DialogDescription>Let's get your main business location set up.</DialogDescription>
                      </DialogHeader>
                      <div className="py-4 space-y-4">
                          <div className="grid gap-2">
                              <Label htmlFor="location-name">Location Name</Label>
                              <Input id="location-name" placeholder="e.g., Downtown Cafe" value={onboardingData.locationName} onChange={e => setOnboardingData({...onboardingData, locationName: e.target.value})} />
                          </div>
                          <div className="grid gap-2">
                              <Label htmlFor="location-address">Address</Label>
                              <Input id="location-address" placeholder="e.g., 123 Main St, Anytown, USA" value={onboardingData.locationAddress} onChange={e => setOnboardingData({...onboardingData, locationAddress: e.target.value})} />
                          </div>
                      </div>
                      <DialogFooter>
                          <Button onClick={handleOnboardingNext} disabled={!onboardingData.locationName || !onboardingData.locationAddress}>Next</Button>
                      </DialogFooter>
                  </div>
              );
          case 2:
              return (
                  <div>
                      <DialogHeader>
                          <DialogTitle className="font-headline text-2xl">Step 2: Invite Your Manager</DialogTitle>
                          <DialogDescription>Who will be managing the day-to-day operations? (This will simulate sending an invite).</DialogDescription>
                      </DialogHeader>
                      <div className="py-4 space-y-4">
                          <div className="grid gap-2">
                              <Label htmlFor="manager-name">Manager's Full Name</Label>
                              <Input id="manager-name" placeholder="e.g., Jane Smith" value={onboardingData.managerName} onChange={e => setOnboardingData({...onboardingData, managerName: e.target.value})} />
                          </div>
                          <div className="grid gap-2">
                              <Label htmlFor="manager-email">Manager's Email</Label>
                              <Input id="manager-email" type="email" placeholder="e.g., jane@example.com" value={onboardingData.managerEmail} onChange={e => setOnboardingData({...onboardingData, managerEmail: e.target.value})} />
                          </div>
                      </div>
                      <DialogFooter className="justify-between">
                          <Button variant="outline" onClick={handleOnboardingBack}>Back</Button>
                          <Button onClick={handleOnboardingNext} disabled={!onboardingData.managerName || !onboardingData.managerEmail}>Next</Button>
                      </DialogFooter>
                  </div>
              );
          case 3:
              return (
                  <form onSubmit={handleCompleteOnboarding}>
                      <DialogHeader>
                          <DialogTitle className="font-headline text-2xl">Step 3: Add a Service Contact</DialogTitle>
                          <DialogDescription>Add a critical contact like a plumber or electrician. You'll thank yourself later!</DialogDescription>
                      </DialogHeader>
                      <div className="py-4 space-y-4">
                          <div className="grid gap-2">
                              <Label htmlFor="contact-name">Contact Name</Label>
                              <Input id="contact-name" placeholder="e.g., Joe's Plumbing" value={onboardingData.contactName} onChange={e => setOnboardingData({...onboardingData, contactName: e.target.value})} />
                          </div>
                          <div className="grid gap-2">
                              <Label htmlFor="contact-phone">Phone Number</Label>
                              <Input id="contact-phone" type="tel" placeholder="e.g., 555-123-4567" value={onboardingData.contactPhone} onChange={e => setOnboardingData({...onboardingData, contactPhone: e.target.value})} />
                          </div>
                      </div>
                      <DialogFooter className="justify-between">
                          <Button variant="outline" type="button" onClick={handleOnboardingBack}>Back</Button>
                          <Button type="submit" disabled={!onboardingData.contactName || !onboardingData.contactPhone}>Complete Setup</Button>
                      </DialogFooter>
                  </form>
              );
          default:
              return null;
      }
  };

  return (
    <div className="space-y-6">
        <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
            <DialogContent onInteractOutside={(e) => e.preventDefault()} showCloseButton={false}>
                {renderOnboardingStep()}
            </DialogContent>
        </Dialog>

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

        <OwnerServiceAlertWidget locationId={selectedLocation} />
        
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
                    <CardTitle className="font-headline flex items-center gap-2"><Package /> Predictive Stock Monitoring</CardTitle>
                    <CardDescription>
                        Use AI to estimate stock levels from a camera feed of the coffee cups.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                     <div className="relative w-48 h-48 rounded-lg overflow-hidden border">
                        <Image src={cupStockImage} alt="Coffee cup stock" layout="fill" objectFit="contain" data-ai-hint="coffee cups stack" />
                    </div>
                    <Button onClick={handleCheckStock} disabled={isCheckingStock} className="w-full">
                        {isCheckingStock ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
                        Check Stock Level
                    </Button>

                    {stockLevel && (
                        <Alert className="w-full">
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
                        <Button variant="destructive" className="w-full">
                            <ShoppingCart className="mr-2 h-4 w-4" /> Add to Emergency Order
                        </Button>
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

    