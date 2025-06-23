
"use client";

import { useState, useEffect } from 'react';
import LiveReviews from '@/components/live-reviews';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DollarSign, ShieldCheck, TrendingUp, AlertTriangle, CheckCircle, XCircle, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { fetchToastData, type ToastPOSData } from '@/ai/flows/fetch-toast-data-flow';
import { Skeleton } from '@/components/ui/skeleton';


const initialRequests = [
  { id: 1, type: "Shift Change", description: "Manager proposed 45 shifts for the upcoming week.", details: "Mon-Fri, 9am-5pm" },
  { id: 2, type: "Overtime", description: "John Doe requested 2 hours of overtime.", details: "Reason: Deep clean kitchen after busy weekend." },
];


export default function OwnerDashboard() {
    const { toast } = useToast();
    const [requests, setRequests] = useState(initialRequests);
    const [revenueData, setRevenueData] = useState<ToastPOSData | null>(null);
    const [isLoadingRevenue, setIsLoadingRevenue] = useState(true);

    const handleFetchRevenue = async () => {
        setIsLoadingRevenue(true);
        try {
            const data = await fetchToastData();
            setRevenueData(data);
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Failed to fetch revenue data',
                description: 'Could not connect to the POS system.',
            })
        } finally {
            setIsLoadingRevenue(false);
        }
    };

    useEffect(() => {
        handleFetchRevenue();
    }, []);

    const handleRequest = (requestId: number, approved: boolean) => {
        const request = requests.find(r => r.id === requestId);
        if (!request) return;

        setRequests(requests.filter(r => r.id !== requestId));
        toast({
            title: `Request ${approved ? 'Approved' : 'Rejected'}`,
            description: `The "${request.description}" request has been ${approved ? 'approved' : 'rejected'}.`,
        });
    };

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Revenue (Live)
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleFetchRevenue} disabled={isLoadingRevenue}>
                            {isLoadingRevenue ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                            <span className="sr-only">Refresh Revenue Data</span>
                        </Button>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoadingRevenue ? (
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    ) : revenueData ? (
                        <>
                            <div className="text-2xl font-bold">
                                ${revenueData.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                +{revenueData.changeFromLastMonth}% from last month
                            </p>
                        </>
                    ) : (
                        <div className="text-sm text-destructive">Could not load data.</div>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    Overall Compliance
                </CardTitle>
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">92.5%</div>
                <p className="text-xs text-muted-foreground">
                    +2.1% from last month
                </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">4.8/5 Stars</div>
                <p className="text-xs text-muted-foreground">
                    Based on recent reviews
                </p>
                </CardContent>
            </Card>

            <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><AlertTriangle className="text-accent"/> Pending Approvals</CardTitle>
                    <CardDescription>
                        Review and approve or reject requests from your team.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {requests.length > 0 ? (
                        requests.map((request) => (
                             <div key={request.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border p-4">
                                <div className="mb-4 sm:mb-0">
                                    <div className="flex items-center gap-3">
                                        <Badge variant={request.type === 'Overtime' ? 'secondary' : 'default'}>{request.type}</Badge>
                                        <p className="font-semibold">{request.description}</p>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1 pl-1">{request.details}</p>
                                </div>
                                <div className="flex gap-2 self-end sm:self-center">
                                    <Button size="sm" onClick={() => handleRequest(request.id, true)}>
                                        <CheckCircle className="mr-2 h-4 w-4"/> Approve
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => handleRequest(request.id, false)}>
                                        <XCircle className="mr-2 h-4 w-4"/> Reject
                                    </Button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No pending approvals.</p>
                    )}
                </CardContent>
            </Card>


            <div className="lg:col-span-3">
                <LiveReviews />
            </div>

            <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle className="font-headline">Future Feature: Approve Reviews</CardTitle>
                    <CardDescription>
                        Once reviews are fetched, you'll be able to select which ones to display on the employee dashboard to motivate your team.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">This feature would involve saving approved reviews to a database and then fetching them on the employee page. This creates a curated list of feedback to share with your staff.</p>
                </CardContent>
            </Card>
        </div>
    );
}
