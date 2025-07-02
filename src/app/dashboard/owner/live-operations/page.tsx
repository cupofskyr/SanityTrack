
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Wifi, WifiOff, Loader2, DollarSign, ShoppingCart, Thermometer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { fetchLiveOperationsDataAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

type LocationStatus = {
    id: string;
    name: string;
    status: 'online' | 'offline';
    alerts: number;
    tasksCompleted: number;
    totalTasks: number;
    currentVibe: 'good' | 'warning' | 'urgent';
    liveSales?: number;
    openOrders?: number;
    avgPrepTime?: number;
};

const initialLocations: Omit<LocationStatus, 'liveSales' | 'openOrders' | 'avgPrepTime'>[] = [
    { id: 'loc-1', name: 'Downtown', status: 'online', alerts: 1, tasksCompleted: 15, totalTasks: 20, currentVibe: 'urgent' },
    { id: 'loc-2', name: 'Uptown', status: 'online', alerts: 0, tasksCompleted: 18, totalTasks: 18, currentVibe: 'good' },
    { id: 'loc-3', name: 'Westside', status: 'offline', alerts: 0, tasksCompleted: 0, totalTasks: 0, currentVibe: 'good' },
];

export default function LiveOperationsPage() {
    const [locations, setLocations] = useState<LocationStatus[]>(initialLocations as LocationStatus[]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    // Simulate real-time updates
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const { data, error } = await fetchLiveOperationsDataAction();
            if (error) {
                toast({ variant: 'destructive', title: "Could not load live data." });
            } else if (data) {
                setLocations(prevLocations =>
                    prevLocations.map(loc => {
                        if (loc.status === 'offline') return loc;
                        return {
                            ...loc,
                            liveSales: data.liveSales + (Math.random() * 20 - 10), // Add some jitter
                            openOrders: data.openOrders,
                            avgPrepTime: data.avgPrepTime,
                            alerts: data.tempAlerts > 0 ? 1 : 0, // Simplified mapping
                        };
                    })
                );
            }
            setIsLoading(false);
        };
        fetchData(); // Initial fetch
        const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds

        return () => clearInterval(interval);
    }, [toast]);
    
    const getVibeInfo = (vibe: LocationStatus['currentVibe']) => {
        switch (vibe) {
            case 'good': return { text: 'Good', color: 'text-green-500', icon: <CheckCircle className="h-4 w-4"/> };
            case 'warning': return { text: 'Warning', color: 'text-yellow-500', icon: <AlertCircle className="h-4 w-4"/> };
            case 'urgent': return { text: 'Urgent', color: 'text-red-500', icon: <AlertCircle className="h-4 w-4"/> };
            default: return { text: 'Unknown', color: 'text-muted-foreground', icon: <AlertCircle className="h-4 w-4"/> };
        }
    };

    return (
        <div className="space-y-6">
             <div className="space-y-2">
                <h1 className="text-3xl font-bold font-headline">Live Operations</h1>
                <p className="text-muted-foreground">Real-time status overview of all your connected locations.</p>
            </div>
            {isLoading && locations.every(l => !l.liveSales) ? (
                 <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                 </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {locations.map(loc => {
                        const vibeInfo = getVibeInfo(loc.currentVibe);
                        return (
                            <Card key={loc.id} className={cn(loc.status === 'offline' && "bg-muted/50 opacity-60")}>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span>{loc.name}</span>
                                        <span className={cn("flex items-center gap-1.5 text-sm font-semibold", loc.status === 'online' ? 'text-green-500' : 'text-muted-foreground')}>
                                            {loc.status === 'online' ? <Wifi className="h-4 w-4"/> : <WifiOff className="h-4 w-4"/>}
                                            {loc.status === 'online' ? 'Online' : 'Offline'}
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                     <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-muted-foreground" /> <span>Sales: ${loc.liveSales?.toFixed(2) ?? 'N/A'}</span></div>
                                        <div className="flex items-center gap-2"><ShoppingCart className="h-4 w-4 text-muted-foreground" /> <span>Open Orders: {loc.openOrders ?? 'N/A'}</span></div>
                                        <div className="flex items-center gap-2"><Thermometer className="h-4 w-4 text-muted-foreground" /> <span>Temp Alerts: {loc.alerts ?? 'N/A'}</span></div>
                                        <div className="flex items-center gap-2 font-bold"><div className={cn("font-bold flex items-center gap-1.5", vibeInfo.color)}>{vibeInfo.icon} {vibeInfo.text}</div></div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Task Completion Today</Label>
                                        <div className="flex items-center gap-2">
                                            <Progress value={(loc.tasksCompleted / loc.totalTasks) * 100} className="flex-1" />
                                            <span className="text-sm font-mono">{loc.tasksCompleted}/{loc.totalTasks}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
