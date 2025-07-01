
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Bot, PlusCircle, MoreHorizontal, Play, Pause, Trash2, Copy, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

type Agent = {
  id: string;
  name: string;
  purpose: string;
  status: 'Running' | 'Paused';
  lastActivity: Date;
  alertCount: number;
};

const initialAgents: Agent[] = [
  { id: 'compliance-monitor', name: 'Compliance Monitor', purpose: 'Monitors temperature logs and task completions for health code compliance.', status: 'Running', lastActivity: new Date(Date.now() - 5 * 60 * 1000), alertCount: 2 },
  { id: 'inventory-sentinel', name: 'Inventory Sentinel', purpose: 'Tracks critical inventory levels and predicts stockouts.', status: 'Running', lastActivity: new Date(Date.now() - 2 * 60 * 1000), alertCount: 5 },
  { id: 'staff-tracker', name: 'Staffing & Punctuality Agent', purpose: 'Analyzes clock-in data and predicts potential overtime.', status: 'Paused', lastActivity: new Date(Date.now() - 60 * 60 * 1000), alertCount: 0 },
  { id: 'cx-sentinel', name: 'Customer Experience Sentinel', purpose: 'Scans camera feeds for long lines and service delays.', status: 'Running', lastActivity: new Date(Date.now() - 15 * 60 * 1000), alertCount: 1 },
];

export default function AgentsDashboardPage() {
    const { toast } = useToast();
    const [agents, setAgents] = useState<Agent[]>(initialAgents);

    const toggleStatus = (agentId: string) => {
        setAgents(agents.map(agent => 
            agent.id === agentId ? { ...agent, status: agent.status === 'Running' ? 'Paused' : 'Running' } : agent
        ));
    };
    
    const cloneAgent = (agentId: string) => {
        const agentToClone = agents.find(a => a.id === agentId);
        if (agentToClone) {
             toast({ title: 'Agent Cloned (Simulated)', description: `${agentToClone.name} was cloned.`});
        }
    };
    
    const deleteAgent = (agentId: string) => {
        const agentToDelete = agents.find(a => a.id === agentId);
        if (agentToDelete) {
             setAgents(agents.filter(a => a.id !== agentId));
             toast({ variant: 'secondary', title: 'Agent Deleted', description: `${agentToDelete.name} was deleted.`});
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex-row items-start justify-between">
                    <div>
                        <CardTitle className="font-headline flex items-center gap-2"><Bot /> AI Agent Dashboard</CardTitle>
                        <CardDescription>Manage your team of autonomous AI agents that monitor and optimize your operations.</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild><Link href="/dashboard/owner/agents/templates">View Templates</Link></Button>
                        <Button asChild><Link href="/dashboard/owner/agents/new"><PlusCircle className="mr-2 h-4 w-4" /> Create New Agent</Link></Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Agent Name</TableHead>
                                <TableHead className="hidden md:table-cell">Purpose</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="hidden lg:table-cell">Last Activity</TableHead>
                                <TableHead>Alerts</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {agents.map(agent => (
                                <TableRow key={agent.id}>
                                    <TableCell className="font-semibold">{agent.name}</TableCell>
                                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-sm truncate">{agent.purpose}</TableCell>
                                    <TableCell>
                                        <Badge variant={agent.status === 'Running' ? 'default' : 'secondary'}>
                                            <div className="flex items-center gap-1">
                                                <span className={`h-2 w-2 rounded-full ${agent.status === 'Running' ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                                                {agent.status}
                                            </div>
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell text-xs">{formatDistanceToNow(agent.lastActivity, { addSuffix: true })}</TableCell>
                                    <TableCell>
                                         <Button variant="link" size="sm" className="p-0 h-auto" asChild>
                                            <Link href={`/dashboard/owner/agents/${agent.id}`}>{agent.alertCount}</Link>
                                        </Button>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem asChild><Link href={`/dashboard/owner/agents/${agent.id}`}><Pencil className="mr-2" />Edit</Link></DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => cloneAgent(agent.id)}><Copy className="mr-2" />Clone</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => toggleStatus(agent.id)}>
                                                    {agent.status === 'Running' ? <Pause className="mr-2" /> : <Play className="mr-2" />}
                                                    {agent.status === 'Running' ? 'Pause' : 'Resume'}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={() => deleteAgent(agent.id)}><Trash2 className="mr-2" />Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
