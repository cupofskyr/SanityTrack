"use client";

import { useEffect, useState } from "react"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { Loader2 } from "lucide-react";

const chartConfig = {
  triggers: {
    label: "Triggers",
    color: "hsl(var(--primary))",
  },
};

export default function AnalyticsPanel() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
        try {
            // In a real app, this would be an API call to /api/ai/analytics.
            // For this demo, we'll simulate a successful response with mock data.
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network latency
            
            // Mock data for the last 24 hours
            const mockData = Array.from({ length: 24 }, (_, i) => ({
                hour: `${i}:00`,
                triggers: Math.floor(Math.random() * (i < 6 || i > 20 ? 5 : 20) + 5), // Simulate peak hours
            }));
            
            setData(mockData as any);
        } catch (err) {
            setError("Failed to fetch analytics data.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }
    fetchData();
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>📊 System Triggers (Last 24h)</CardTitle>
        <CardDescription>Number of AI agent rules triggered per hour.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading && <div className="flex items-center justify-center h-[300px]"><Loader2 className="h-8 w-8 animate-spin" /></div>}
        {error && <p className="text-destructive text-center">{error}</p>}
        {!loading && !error && (
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <LineChart data={data}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="hour" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis />
                    <RechartsTooltip content={<ChartTooltipContent />} />
                    <Line
                        dataKey="triggers"
                        type="monotone"
                        stroke="var(--color-triggers)"
                        strokeWidth={2}
                        dot={false}
                    />
                </LineChart>
            </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
