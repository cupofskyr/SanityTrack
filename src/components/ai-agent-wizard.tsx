
"use client";

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { ArrowLeft, ArrowRight, Check, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

type Step = 'info' | 'data' | 'rules' | 'actions' | 'review';

const dataSources = [
    { id: 'task_logs', label: 'Task Logs' },
    { id: 'attendance', label: 'Employee Attendance' },
    { id: 'sensors', label: 'IoT Sensor Inputs' },
    { id: 'pos_data', label: 'POS Data Stream' },
    { id: 'camera_events', label: 'Camera AI Events' },
];

export default function AiAgentWizard() {
    const { toast } = useToast();
    const router = useRouter();
    const [step, setStep] = useState<Step>('info');
    const [formData, setFormData] = useState({
        name: '',
        purpose: '',
        dataSources: [] as string[],
        ruleThreshold: '',
        ruleTimeWindow: '',
        alertChannel: '',
        aiAction: '',
    });

    const handleNext = () => {
        const steps: Step[] = ['info', 'data', 'rules', 'actions', 'review'];
        const currentIndex = steps.indexOf(step);
        if (currentIndex < steps.length - 1) {
            setStep(steps[currentIndex + 1]);
        }
    };

    const handleBack = () => {
        const steps: Step[] = ['info', 'data', 'rules', 'actions', 'review'];
        const currentIndex = steps.indexOf(step);
        if (currentIndex > 0) {
            setStep(steps[currentIndex - 1]);
        }
    };
    
    const handleDeploy = () => {
        toast({
            title: "Agent Deployment Initiated (Simulated)",
            description: `Your new agent "${formData.name}" is now being deployed.`
        });
        router.push('/dashboard/owner/agents');
    }

    const progress = (['info', 'data', 'rules', 'actions', 'review'].indexOf(step) + 1) * 20;

    return (
        <div className="space-y-8">
            <Progress value={progress} />

            {step === 'info' && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Step 1: Basic Information</h3>
                    <div className="grid gap-2"><Label htmlFor="name">Agent Name</Label><Input id="name" placeholder="e.g., Temperature Compliance Agent" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
                    <div className="grid gap-2"><Label htmlFor="purpose">Purpose/Description</Label><Textarea id="purpose" placeholder="e.g., Monitors all refrigeration units and alerts if temperatures exceed health code limits." value={formData.purpose} onChange={e => setFormData({...formData, purpose: e.target.value})} /></div>
                </div>
            )}
            
            {step === 'data' && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Step 2: Data Sources</h3>
                    <p className="text-sm text-muted-foreground">Select the data streams this agent should monitor.</p>
                    <div className="grid gap-2">
                        {dataSources.map(source => (
                             <div key={source.id} className="flex items-center space-x-2">
                                <Checkbox id={source.id} onCheckedChange={(checked) => {
                                    setFormData(prev => ({ ...prev, dataSources: checked ? [...prev.dataSources, source.label] : prev.dataSources.filter(s => s !== source.label) }))
                                }} />
                                <Label htmlFor={source.id} className="font-normal">{source.label}</Label>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {step === 'rules' && (
                 <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Step 3: Rules & Alerts</h3>
                    <p className="text-sm text-muted-foreground">Define the condition that will trigger an alert.</p>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="grid gap-2"><Label htmlFor="threshold">Alert Threshold</Label><Input id="threshold" placeholder="e.g., Temperature > 41°F" value={formData.ruleThreshold} onChange={e => setFormData({...formData, ruleThreshold: e.target.value})} /></div>
                        <div className="grid gap-2"><Label htmlFor="time-window">Time Window</Label><Input id="time-window" placeholder="e.g., for 15 minutes" value={formData.ruleTimeWindow} onChange={e => setFormData({...formData, ruleTimeWindow: e.target.value})} /></div>
                    </div>
                     <div className="grid gap-2"><Label htmlFor="alert-channel">Alert Channel</Label>
                        <Select value={formData.alertChannel} onValueChange={val => setFormData({...formData, alertChannel: val})}><SelectTrigger><SelectValue placeholder="Select how to be notified..." /></SelectTrigger>
                            <SelectContent><SelectItem value="dashboard">Dashboard Alert</SelectItem><SelectItem value="email">Email to Owner</SelectItem><SelectItem value="sms">SMS to Manager</SelectItem></SelectContent>
                        </Select>
                    </div>
                </div>
            )}
            
            {step === 'actions' && (
                 <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Step 4: AI Behavior & Actions</h3>
                    <p className="text-sm text-muted-foreground">Define what the agent should do when an alert is triggered.</p>
                     <div className="grid gap-2"><Label htmlFor="ai-action">Automated Action</Label>
                        <Select value={formData.aiAction} onValueChange={val => setFormData({...formData, aiAction: val})}><SelectTrigger><SelectValue placeholder="Select an automated action..." /></SelectTrigger>
                            <SelectContent><SelectItem value="create_task">Create High-Priority Task</SelectItem><SelectItem value="suggest_contact">Suggest Service Contact</SelectItem><SelectItem value="none">No Action (Alert Only)</SelectItem></SelectContent>
                        </Select>
                    </div>
                </div>
            )}
            
            {step === 'review' && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Step 5: Review & Deploy</h3>
                    <div className="p-4 border rounded-md bg-muted/50 space-y-2 text-sm">
                        <p><strong>Name:</strong> {formData.name}</p>
                        <p><strong>Purpose:</strong> {formData.purpose}</p>
                        <p><strong>Data Sources:</strong> {formData.dataSources.join(', ')}</p>
                        <p><strong>Rule:</strong> IF {formData.ruleThreshold} {formData.ruleTimeWindow}</p>
                        <p><strong>Alert via:</strong> {formData.alertChannel}</p>
                        <p><strong>Action:</strong> {formData.aiAction}</p>
                    </div>
                </div>
            )}


            <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={handleBack} disabled={step === 'info'}><ArrowLeft className="mr-2"/> Back</Button>
                {step !== 'review' ? (
                     <Button onClick={handleNext}>Next <ArrowRight className="ml-2"/></Button>
                ) : (
                    <Button onClick={handleDeploy}><Bot className="mr-2"/> Deploy Agent</Button>
                )}
            </div>
        </div>
    );
}
