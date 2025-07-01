
"use client";

import AiAgentChat from '@/components/ai-agent-chat';
import ComplianceChart from '@/components/compliance-chart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, Bot, Settings, BarChart2 } from 'lucide-react';

const mockAgent = {
  id: 'compliance-monitor',
  name: 'Compliance Monitor',
  purpose: 'Monitors temperature logs and task completions for health code compliance.',
  status: 'Running' as 'Running' | 'Paused',
};

const chartData = [
  { month: "Jan", score: 92 },
  { month: "Feb", score: 95 },
  { month: "Mar", score: 88 },
  { month: "Apr", score: 91 },
  { month: "May", score: 96 },
  { month: "Jun", score: 94 },
];

export default function AgentDetailPage({ params }: { params: { agentId: string } }) {
    // In a real app, you would fetch the agent data based on params.agentId
    const agent = mockAgent;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex-row items-center justify-between">
                    <div>
                        <CardTitle className="font-headline flex items-center gap-3">
                            <Bot className="h-8 w-8 text-primary" />
                            {agent.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                             <Badge variant={agent.status === 'Running' ? 'default' : 'secondary'}>
                                <div className="flex items-center gap-1">
                                    <span className={`h-2 w-2 rounded-full ${agent.status === 'Running' ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                                    {agent.status}
                                </div>
                            </Badge>
                            <p className="text-sm text-muted-foreground">{agent.purpose}</p>
                        </div>
                    </div>
                    <Button variant="outline">
                        {agent.status === 'Running' ? <Pause className="mr-2" /> : <Play className="mr-2" />}
                        {agent.status === 'Running' ? 'Pause Agent' : 'Resume Agent'}
                    </Button>
                </CardHeader>
            </Card>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <AiAgentChat agentName={agent.name} />
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><BarChart2 /> Performance Analytics</CardTitle>
                            <CardDescription>Historical performance data for this agent.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ComplianceChart data={chartData} />
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card>
                         <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Settings /> Configuration</CardTitle>
                            <CardDescription>Current rules and data sources for this agent.</CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                           <p><strong>Data Sources:</strong> Temperature Logs, Task System</p>
                           <p><strong>Rule 1:</strong> IF Cooler Temp > 41°F for 10 mins, THEN create High-Priority Alert.</p>
                           <p><strong>Rule 2:</strong> IF 'Sanitize Surface' task overdue > 2 hours, THEN notify Manager.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
