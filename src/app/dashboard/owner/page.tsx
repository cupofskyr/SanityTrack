
"use client";

import LiveReviews from '@/components/live-reviews';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DollarSign, ShieldCheck, TrendingUp } from 'lucide-react';

export default function OwnerDashboard() {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">$45,231.89</div>
                <p className="text-xs text-muted-foreground">
                    +20.1% from last month
                </p>
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
