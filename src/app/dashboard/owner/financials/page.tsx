
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { fetchToastDataAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, DollarSign, FileText, Link as LinkIcon } from 'lucide-react';

const locations = [
    { name: 'All Locations' },
    { name: 'Downtown' },
    { name: 'Uptown' },
    { name: 'Westside' },
];

const mockPnlData = [
    { month: 'Jan', revenue: 4000, profit: 2400 },
    { month: 'Feb', revenue: 3000, profit: 1398 },
    { month: 'Mar', revenue: 5000, profit: 3800 },
];

const chartConfig = {
    revenue: { label: "Revenue", color: "hsl(var(--primary))" },
    profit: { label: "Profit", color: "hsl(var(--chart-2))" },
};

export default function FinancialsPage() {
    const { toast } = useToast();
    const [selectedLocation, setSelectedLocation] = useState('All Locations');
    const [isLoading, setIsLoading] = useState(false);
    
    useEffect(() => {
        const fetchDataForLocation = async () => {
            setIsLoading(true);
            // Simulate fetching new data for the selected location
            await new Promise(resolve => setTimeout(resolve, 500));
            toast({
                title: `Data loaded for ${selectedLocation}`,
            });
            setIsLoading(false);
        };
        fetchDataForLocation();
    }, [selectedLocation, toast]);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <CardTitle className="font-headline flex items-center gap-2">
                                <DollarSign /> Financial Dashboard
                            </CardTitle>
                            <CardDescription>
                                High-level financial reports for your enterprise.
                            </CardDescription>
                        </div>
                        <div className="w-full md:w-auto">
                            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select location..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {locations.map(loc => <SelectItem key={loc.name} value={loc.name}>{loc.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                             <FileText className="h-5 w-5"/> Profit & Loss
                        </CardTitle>
                        <CardDescription>
                            Summary for {selectedLocation}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center items-center h-[250px]"><Loader2 className="h-8 w-8 animate-spin" /></div>
                        ) : (
                             <ChartContainer config={chartConfig} className="h-[250px] w-full">
                                <BarChart accessibilityLayer data={mockPnlData}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                                    <YAxis />
                                    <RechartsTooltip cursor={false} content={<ChartTooltipContent />} />
                                    <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                                    <Bar dataKey="profit" fill="var(--color-profit)" radius={4} />
                                </BarChart>
                            </ChartContainer>
                        )}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5"/> Balance Sheet
                        </CardTitle>
                        <CardDescription>
                            Summary for {selectedLocation}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center items-center h-[250px]"><Loader2 className="h-8 w-8 animate-spin" /></div>
                        ) : (
                             <div className="flex justify-center items-center h-[250px] border-2 border-dashed rounded-md">
                                <p className="text-muted-foreground">Balance Sheet Data Unavailable</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">QuickBooks Online Integration</CardTitle>
                    <CardDescription>Connect your QuickBooks account to automate expense reporting and streamline your financial operations.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-4 rounded-lg border bg-muted p-4">
                        <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">Status: Not Connected</p>
                            <p className="text-sm text-muted-foreground">Link your account to enable automated features.</p>
                        </div>
                        <Button>
                            <LinkIcon className="mr-2 h-4 w-4" />
                            Connect to QuickBooks
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
