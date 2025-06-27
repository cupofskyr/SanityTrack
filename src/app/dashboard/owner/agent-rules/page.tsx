
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from '@/components/ui/switch';
import { Label } from "@/components/ui/label";
import { Bot, AlertCircle } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type AgentRule = {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
};

const initialRules: AgentRule[] = [
    { id: 'auto-spill-cleaner', name: 'Auto-Tasker for Spills', description: 'IF a camera detects a spill, THEN automatically create a high-priority cleaning task.', isEnabled: true },
    { id: 'auto-restock-alerter', name: 'Proactive Restock Alerter', description: 'IF inventory of a critical item is low, THEN automatically email the manager.', isEnabled: true },
    { id: 'overtime-approver', name: 'Overtime Request Approver', description: 'IF an employee requests overtime for a valid reason, THEN automatically approve it.', isEnabled: false },
];


export default function AgentRulesPage() {
    const { toast } = useToast();
    const [isAgentEnabled, setIsAgentEnabled] = useState(true);
    const [rules, setRules] = useState<AgentRule[]>(initialRules);

    const handleRuleToggle = (ruleId: string) => {
        setRules(rules.map(rule => 
            rule.id === ruleId ? { ...rule, isEnabled: !rule.isEnabled } : rule
        ));
    };

    const handleSave = () => {
        // In a real app, this would save the state to Firestore
        console.log({ isAgentEnabled, rules });
        toast({
            title: "Rules of Engagement Saved",
            description: "The Sentinel Agent's configuration has been updated."
        });
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Bot className="h-6 w-6 text-primary" />
                        Sentinel Agent: Rules of Engagement
                    </CardTitle>
                    <CardDescription>
                        This is the master control panel for the AI agent. Enable or disable its autonomous capabilities here.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center space-x-4 rounded-lg border p-4">
                        <div className="flex-1 space-y-1">
                            <p className="text-lg font-medium">Master Switch</p>
                            <p className="text-sm text-muted-foreground">
                                {isAgentEnabled ? "The Sentinel Agent is currently active." : "The Sentinel Agent is currently disabled."}
                            </p>
                        </div>
                        <Switch
                            checked={isAgentEnabled}
                            onCheckedChange={setIsAgentEnabled}
                            aria-readonly
                        />
                    </div>
                     <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Use with Caution</AlertTitle>
                        <AlertDescription>
                            Enabling the Sentinel Agent allows the AI to take actions on your behalf, such as creating tasks or sending notifications. Review all actions in the Agent Activity Log on your main dashboard.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rules.map(rule => (
                    <Card key={rule.id} className={!isAgentEnabled || !rule.isEnabled ? 'bg-muted/50' : ''}>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between text-lg">
                                <span>{rule.name}</span>
                                <Switch
                                    checked={rule.isEnabled}
                                    onCheckedChange={() => handleRuleToggle(rule.id)}
                                    disabled={!isAgentEnabled}
                                />
                            </CardTitle>
                            <CardDescription>{rule.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Example of a simple configuration dropdown */}
                             <div className="grid gap-2">
                                <Label>Action Priority</Label>
                                <Select defaultValue="High" disabled={!isAgentEnabled || !rule.isEnabled}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="High">High</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="Low">Low</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex justify-end">
                <Button onClick={handleSave}>Save Configuration</Button>
            </div>
        </div>
    );
}
