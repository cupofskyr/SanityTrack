
"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

const chartConfig = {
    score: {
        label: "Compliance Score",
        color: "hsl(var(--primary))",
    },
}

type ComplianceChartProps = {
    data: { month: string; score: number }[];
};

export default function ComplianceChart({ data }: ComplianceChartProps) {
    return (
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart accessibilityLayer data={data}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis domain={[70, 100]}/>
                <RechartsTooltip cursor={false} content={<ChartTooltipContent />} />
                <Bar dataKey="score" fill="var(--color-score)" radius={4} />
            </BarChart>
        </ChartContainer>
    );
}
