
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award, BarChart, CheckCircle } from "lucide-react";

type PerformanceCardProps = {
    xpEarned: number;
};

export default function PerformanceCard({ xpEarned }: PerformanceCardProps) {
    return (
        <Card id="performance-card">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><BarChart /> My Performance</CardTitle>
                <CardDescription>Your stats for this week.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-1">
                    <div className="flex justify-between text-sm font-medium">
                        <span>XP Earned Today</span>
                        <span>{xpEarned} XP</span>
                    </div>
                    <Progress value={(xpEarned / 500) * 100} className="h-2" />
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between text-sm font-medium">
                        <span>Task Completion Rate</span>
                        <span>92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                </div>
                 <div className="space-y-1">
                    <div className="flex justify-between text-sm font-medium">
                        <span>Shoutouts Received</span>
                        <span>3</span>
                    </div>
                </div>
                 <div className="space-y-1">
                    <p className="text-sm font-medium mb-2">Badges Unlocked</p>
                    <div className="flex gap-2">
                        <Award className="h-8 w-8 text-amber-500" title="Top Performer" />
                        <CheckCircle className="h-8 w-8 text-green-500" title="Perfect Attendance" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
