
"use client";

import { useState, useEffect } from 'react';
import LiveReviews from '@/components/live-reviews';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DollarSign, ShieldCheck, TrendingUp, AlertTriangle, CheckCircle, XCircle, RefreshCw, Loader2, MapPin, UserCog, Building, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { fetchToastData, type ToastPOSData } from '@/ai/flows/fetch-toast-data-flow';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// --- MOCK DATA ---
const locations = [
  { id: 'loc_1', name: "Downtown Cafe", manager: "Alex Ray" },
  { id: 'loc_2', name: "Uptown Bistro", manager: "Casey Lee" },
  { id: 'loc_3', name: "Seaside Smoothies", manager: "Jordan Pat" },
];

const initialRequests = [
  { id: 1, type: "Shift Change", description: "Manager proposed 45 shifts for the upcoming week.", details: "Mon-Fri, 9am-5pm", manager: "Alex Ray", location: "Downtown Cafe" },
  { id: 2, type: "Overtime", description: "John Doe requested 2 hours of overtime.", details: "Reason: Deep clean kitchen after busy weekend.", manager: "Alex Ray", location: "Downtown Cafe" },
  { id: 3, type: "Overtime", description: "Sam Smith requested 3 hours of overtime.", details: "Reason: Cover for sick colleague.", manager: "Casey Lee", location: "Uptown Bistro" },
];
// --- END MOCK DATA ---

export default function OwnerDashboard() {
    const { toast } = useToast();
    const [selectedLocation, setSelectedLocation] = useState(locations[0]);
    const [requests, setRequests] = useState(initialRequests);
    const [revenueData, setRevenueData] = useState<ToastPOSData | null>(null);
    const [isLoadingRevenue, setIsLoadingRevenue] = useState(true);

    const handleFetchRevenue = async (locationName: string) => {
        setIsLoadingRevenue(true);
        setRevenueData(null);
        try {
            const data = await fetchToastData({ location: locationName });
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
        if (selectedLocation) {
            handleFetchRevenue(selectedLocation.name);
        }
    }, [selectedLocation]);

    const handleRequest = (requestId: number, approved: boolean) => {
        const request = requests.find(r => r.id === requestId);
        if (!request) return;

        setRequests(requests.filter(r => r.id !== requestId));
        toast({
            title: `Request ${approved ? 'Approved' : 'Rejected'}`,
            description: `The "${request.description}" request has been ${approved ? 'approved' : 'rejected'}.`,
        });
    };

    const filteredRequests = requests.filter(r => r.location === selectedLocation.name);

    return (
        <TooltipProvider>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><Building /> My Locations</CardTitle>
                        <CardDescription>Select a location to view its specific dashboard. In a full app, you could add or edit locations here.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {locations.map(loc => (
                             <Card 
                                key={loc.id}
                                className={cn(
                                    "cursor-pointer hover:shadow-md transition-shadow",
                                    selectedLocation.id === loc.id && "ring-2 ring-primary shadow-lg"
                                )}
                                onClick={() => setSelectedLocation(loc)}
                             >
                                <CardHeader className="flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-lg font-medium">{loc.name}</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">Managed by: {loc.manager}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </CardContent>
                </Card>

                <h2 className="text-2xl font-bold font-headline">Dashboard for: <span className="text-primary">{selectedLocation.name}</span></h2>
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Revenue (Live)
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleFetchRevenue(selectedLocation.name)} disabled={isLoadingRevenue}>
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
                            <CardTitle className="font-headline flex items-center gap-2"><AlertTriangle className="text-accent"/> Pending Approvals for this Location</CardTitle>
                            <CardDescription>
                                Review and approve or reject requests from your team. Hover over an item for more details.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {filteredRequests.length > 0 ? (
                                filteredRequests.map((request) => (
                                    <Tooltip key={request.id}>
                                        <TooltipTrigger asChild>
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors cursor-default">
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
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <div className="grid gap-2 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-semibold">Location:</span>
                                                    <span>{request.location}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <UserCog className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-semibold">Manager:</span>
                                                    <span>{request.manager}</span>
                                                </div>
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No pending approvals for {selectedLocation.name}.</p>
                            )}
                        </CardContent>
                    </Card>

                    <div className="lg:col-span-3">
                        <LiveReviews location={selectedLocation.name} />
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
            </div>
        </TooltipProvider>
    );
}
