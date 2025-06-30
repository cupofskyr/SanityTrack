
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from '@/components/ui/switch';
import { Label } from "@/components/ui/label";
import { Bot, AlertCircle, PlusCircle, Trash2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

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
    
    const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false);
    const [newRule, setNewRule] = useState({ name: '', description: '' });

    const handleRuleToggle = (ruleId: string) => {
        setRules(rules.map(rule => 
            rule.id === ruleId ? { ...rule, isEnabled: !rule.isEnabled } : rule
        ));
    };
    
    const handleAddRule = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRule.name || !newRule.description) {
            toast({ variant: 'destructive', title: 'Missing fields', description: 'Please provide a name and description for the rule.' });
            return;
        }

        const newRuleToAdd: AgentRule = {
            id: `custom-${Date.now()}`,
            name: newRule.name,
            description: newRule.description,
            isEnabled: true,
        };

        setRules(prev => [...prev, newRuleToAdd]);
        setIsRuleDialogOpen(false);
        setNewRule({ name: '', description: '' });
        toast({ title: 'Custom Rule Added!', description: 'The new rule is now active.' });
    };

    const handleDeleteRule = (ruleId: string) => {
        setRules(rules.filter(rule => rule.id !== ruleId));
        toast({ variant: 'secondary', title: 'Rule Deleted', description: 'The rule has been removed from the agent\'s configuration.' });
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
                <CardHeader className="flex-row items-start justify-between">
                    <div>
                        <CardTitle className="font-headline flex items-center gap-2">
                            <Bot className="h-6 w-6 text-primary" />
                            Sentinel Agent: Rules of Engagement
                        </CardTitle>
                        <CardDescription>
                            This is the master control panel for the AI agent for your business. Configure the rules for your specific locations.
                        </CardDescription>
                    </div>
                     <Dialog open={isRuleDialogOpen} onOpenChange={setIsRuleDialogOpen}>
                        <DialogTrigger asChild>
                            <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Custom Rule</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create a Custom Rule</DialogTitle>
                                <DialogDescription>
                                    Define a new rule for the AI agent in plain English. The more specific you are, the better it will perform.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleAddRule}>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="rule-name">Rule Name</Label>
                                        <Input id="rule-name" placeholder="e.g., 'Rainy Day Protocol'" value={newRule.name} onChange={(e) => setNewRule({...newRule, name: e.target.value})} required/>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="rule-description">Description (IF... THEN...)</Label>
                                        <Textarea id="rule-description" placeholder="e.g., IF the weather forecast predicts rain, THEN create a task to put out 'Wet Floor' signs near the entrance." value={newRule.description} onChange={(e) => setNewRule({...newRule, description: e.target.value})} required rows={4}/>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="secondary" onClick={() => setIsRuleDialogOpen(false)}>Cancel</Button>
                                    <Button type="submit">Save Rule</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
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
                        <CardContent className="flex justify-between items-center">
                            <div className="grid gap-2 w-2/3">
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
                            {rule.id.startsWith('custom-') && (
                                <Button variant="ghost" size="icon" className="self-end" onClick={() => handleDeleteRule(rule.id)} disabled={!isAgentEnabled}>
                                    <Trash2 className="h-5 w-5 text-destructive" />
                                </Button>
                            )}
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
