
"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Wand2, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { generateTasksFromInventory } from "@/app/actions";
import { GenerateTasksFromInventoryInputSchema } from "@/ai/schemas/task-generation-schemas";
import type { GenerateTasksFromInventoryOutput, GenerateTasksFromInventoryInput } from "@/ai/schemas/task-generation-schemas";


type AISetupAssistantProps = {
    onTasksSuggested: (tasks: GenerateTasksFromInventoryOutput['tasks']) => void;
};

export default function AISetupAssistant({ onTasksSuggested }: AISetupAssistantProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [setupInstructions, setSetupInstructions] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<GenerateTasksFromInventoryInput>({
    resolver: zodResolver(GenerateTasksFromInventoryInputSchema),
    defaultValues: {
      coolers: 3,
      sinks: 4,
      toilets: 2,
      trashBins: 5,
      fryers: 2,
      additionalDetails: "We have a walk-in freezer and a pizza oven.",
    },
  });

  async function onSubmit(values: GenerateTasksFromInventoryInput) {
    setIsLoading(true);
    setSetupInstructions(null);
    setError(null);

    try {
      const response = await generateTasksFromInventory(values);
      setSetupInstructions(response.setupInstructions);
      onTasksSuggested(response.tasks);
    } catch (e) {
      setError("Failed to generate tasks. Please try again.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="lg:col-span-3 border-primary bg-primary/5">
        <CardHeader>
            <CardTitle className="font-headline text-primary flex items-center gap-2"><Wand2 /> AI Setup Assistant</CardTitle>
            <CardDescription>Answer a few questions about your facility, and let AI generate a starter checklist of recurring tasks for your team.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <FormField
                        control={form.control}
                        name="coolers"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel># of Coolers</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="sinks"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel># of Sinks</FormLabel>
                            <FormControl>
                               <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="toilets"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel># of Toilets</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="trashBins"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel># of Trash Bins</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="fryers"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel># of Fryers</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                 <FormField
                    control={form.control}
                    name="additionalDetails"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Additional Equipment or Areas (Optional)</FormLabel>
                        <FormControl>
                            <Textarea placeholder="e.g., We have a patio seating area, a soft-serve machine..." {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Generate Task Suggestions
                </Button>
                </form>
            </Form>

            {error && <p className="mt-4 text-destructive">{error}</p>}

            {setupInstructions && (
                 <Alert className="mt-6">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Setup Recommendation</AlertTitle>
                    <AlertDescription>{setupInstructions}</AlertDescription>
                </Alert>
            )}
        </CardContent>
    </Card>
  );
}
