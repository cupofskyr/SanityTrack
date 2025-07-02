
"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip, Line, LineChart } from 'recharts';
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, CheckCircle, Bot, AlertTriangle, FileDown } from "lucide-react";
import { Button } from '@/components/ui/button';

const complianceData = [
  { month: "Jan", score: 92 },
  { month: "Feb", score: 95 },
  { month: "Mar", score: 88 },
  { month: "Apr", score: 91 },
  { month: "May", score: 96 },
  { month: "Jun", score: 94 },
];

const taskCompletionData = [
  { date: "07-01", completed: 150, overdue: 12 },
  { date: "07-02", completed: 160, overdue: 8 },
  { date: "07-03", completed: 155, overdue: 15 },
  { date: "07-04", completed: 140, overdue: 5 },
  { date: "07-05", completed: 170, overdue: 3 },
  { date: "07-06", completed: 165, overdue: 7 },
  { date: "07-07", completed: 180, overdue: 2 },
];

const topAiInteractions = [
    { feature: "AI Shift Planner", interactions: 1024, successRate: "98%" },
    { feature: "AI Quality Control", interactions: 750, successRate: "95%" },
    { feature: "AI Issue Analyzer", interactions: 512, successRate: "99%" },
    { feature: "Company Brain", interactions: 340, successRate: "92%" },
];

const chartConfigCompliance = {
    score: { label: "Compliance Score", color: "hsl(var(--primary))" },
};

const chartConfigTasks = {
    completed: { label: "Completed", color: "hsl(var(--primary))" },
    overdue: { label: "Overdue", color: "hsl(var(--destructive))" },
};

export default function AnalyticsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-headline flex items-center gap-2"><TrendingUp /> Usage Analytics</h1>
                    <p className="text-muted-foreground mt-2">
                        Key metrics on operational efficiency, team performance, and AI system usage.
                    </p>
                </div>
                <Button>
                    <FileDown className="mr-2 h-4 w-4" />
                    Export Full Report
                </Button>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><CheckCircle /> Compliance Score Trend</CardTitle>
                        <CardDescription>Monthly average compliance scores across all locations.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfigCompliance} className="h-[250px] w-full">
                            <BarChart accessibilityLayer data={complianceData}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                                <YAxis domain={[0, 100]} />
                                <RechartsTooltip cursor={false} content={<ChartTooltipContent />} />
                                <Bar dataKey="score" fill="var(--color-score)" radius={4} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><AlertTriangle /> Daily Task Completion vs. Overdue</CardTitle>
                        <CardDescription>Daily task status for the past week.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfigTasks} className="h-[250px] w-full">
                            <LineChart accessibilityLayer data={taskCompletionData} margin={{ left: 12, right: 12 }}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                                <YAxis />
                                <RechartsTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                <Line dataKey="completed" type="monotone" stroke="var(--color-completed)" strokeWidth={2} dot={false} />
                                <Line dataKey="overdue" type="monotone" stroke="var(--color-overdue)" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Bot /> Top AI Feature Interactions</CardTitle>
                    <CardDescription>Usage statistics for the most popular AI-powered features.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Feature</TableHead>
                                <TableHead className="text-right">Total Interactions</TableHead>
                                <TableHead className="text-right">Success Rate</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {topAiInteractions.map(interaction => (
                                <TableRow key={interaction.feature}>
                                    <TableCell className="font-medium">{interaction.feature}</TableCell>
                                    <TableCell className="text-right">{interaction.interactions.toLocaleString()}</TableCell>
                                    <TableCell className="text-right"><Badge variant="outline">{interaction.successRate}</Badge></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
