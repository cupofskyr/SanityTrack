
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, AlertTriangle, CheckCircle } from 'lucide-react';
import { generatePermitChecklistAction } from '@/app/actions';
import type { GeneratePermitChecklistOutput } from '@/ai/schemas/permit-checklist-schemas';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const arizonaCounties = [
  "Apache", "Cochise", "Coconino", "Gila", "Graham", "Greenlee", "La Paz",
  "Maricopa", "Mohave", "Navajo", "Pima", "Pinal", "Santa Cruz", "Yavapai", "Yuma"
];

export default function PermitApplicationPage() {
    const { toast } = useToast();
    const [county, setCounty] = useState('');
    const [scenario, setScenario] = useState<'new-shell' | 'existing-location'>('new-shell');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<GeneratePermitChecklistOutput | null>(null);

    const handleGeneratePlan = async () => {
        if (!county || !scenario) {
            toast({
                variant: 'destructive',
                title: 'Missing Information',
                description: 'Please select a county and project scenario.',
            });
            return;
        }

        setIsLoading(true);
        setResult(null);

        try {
            const response = await generatePermitChecklistAction({ county, scenario });
            if (response.error || !response.data) {
                throw new Error(response.error || 'Failed to generate the permit plan.');
            }
            setResult(response.data);
            toast({
                title: 'Your Permit Plan is Ready!',
                description: `AI has generated a custom plan for ${county}.`,
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'AI Error',
                description: error.message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="border-primary bg-primary/5">
                <CardHeader>
                    <CardTitle className="font-headline text-primary flex items-center gap-2">
                        <Sparkles /> AI Permit Planner
                    </CardTitle>
                    <CardDescription>
                        Navigate Arizona's complex restaurant permitting process with a personalized, AI-generated action plan. Select your county and project type to begin.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <Label>What county is your project in?</Label>
                            <Select value={county} onValueChange={setCounty}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an Arizona county..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {arizonaCounties.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>What is your project scenario?</Label>
                            <RadioGroup value={scenario} onValueChange={(val) => setScenario(val as any)} className="flex gap-4 pt-2">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="new-shell" id="s-new" />
                                    <Label htmlFor="s-new" className="font-normal">New Build / Shell Space</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="existing-location" id="s-existing" />
                                    <Label htmlFor="s-existing" className="font-normal">Existing Location / Remodel</Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>
                    <Button onClick={handleGeneratePlan} disabled={isLoading || !county}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Generate My Permit Plan
                    </Button>
                </CardContent>
            </Card>

            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Your Custom Permit Action Plan</CardTitle>
                        <CardDescription>Follow these steps for a successful permit application in {county}.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Critical Advice - Read First!</AlertTitle>
                            <AlertDescription>{result.criticalAdvice}</AlertDescription>
                        </Alert>

                        <Accordion type="multiple" defaultValue={['item-0']} className="w-full">
                            {result.fullPlan.map((phase, index) => (
                                <AccordionItem value={`item-${index}`} key={index}>
                                    <AccordionTrigger>
                                        <div className='flex items-center gap-4'>
                                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold">
                                                {phase.phaseNumber}
                                            </div>
                                            <div className='text-left'>
                                                <h4 className="font-semibold">{phase.phaseName}</h4>
                                                <p className="text-sm text-muted-foreground">{phase.description}</p>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pl-16 pr-4 space-y-4">
                                        {phase.checklist.map((item, itemIndex) => (
                                            <div key={itemIndex} className="flex items-start gap-3 p-3 border rounded-md bg-muted/50">
                                                <CheckCircle className="h-5 w-5 mt-1 text-green-600 shrink-0" />
                                                <div>
                                                    <p className="font-semibold">{item.title}</p>
                                                    <p className="text-xs text-muted-foreground">{item.details}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
