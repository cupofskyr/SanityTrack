"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Lightbulb, ListChecks } from "lucide-react";
import { recommendTasks, type RecommendTasksOutput } from "@/ai/flows/ai-task-recommendation";

const formSchema = z.object({
  employeeSkills: z.string().min(1, "Please enter at least one skill."),
  availableTasks: z.string().min(1, "Please enter at least one available task."),
  pastTasks: z.string(),
  currentIssues: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AIRecommendationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RecommendTasksOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeSkills: "Cleaning, Restocking, Basic Maintenance",
      availableTasks: "Sanitize dining area, Deep clean restrooms, Fix wobbly table leg, Reorganize stockroom",
      pastTasks: "Cleaned kitchen grease trap, Managed inventory for a week",
      currentIssues: "Customer complaint about sticky tables, Health inspector visit next week",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const input = {
        employeeSkills: values.employeeSkills.split(',').map(s => s.trim()),
        availableTasks: values.availableTasks.split(',').map(s => s.trim()),
        pastTasks: values.pastTasks.split(',').map(s => s.trim()).filter(s => s),
        currentIssues: values.currentIssues.split(',').map(s => s.trim()).filter(s => s),
      };

      const response = await recommendTasks(input);
      setResult(response);
    } catch (e) {
      setError("Failed to get recommendations. Please try again.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="employeeSkills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee Skills (comma-separated)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Cleaning, Restocking" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="availableTasks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Available Tasks (comma-separated)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Mop floors, Clean windows" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="pastTasks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Past Tasks (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Deep cleaned kitchen" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="currentIssues"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Issues (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Leaky faucet in restroom" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Get Recommendations
          </Button>
        </form>
      </Form>

      {error && <p className="mt-4 text-destructive">{error}</p>}

      {result && (
        <Card className="mt-6 border-primary bg-primary/5">
          <CardHeader>
            <CardTitle className="font-headline text-primary">AI-Powered Suggestions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
                <h3 className="font-semibold flex items-center gap-2"><ListChecks /> Recommended Tasks</h3>
                <ul className="list-disc pl-5 mt-2 text-sm">
                    {result.recommendedTasks.map((task, index) => <li key={index}>{task}</li>)}
                </ul>
            </div>
             <div>
                <h3 className="font-semibold flex items-center gap-2"><Lightbulb /> Reasoning</h3>
                <p className="text-sm mt-2 text-muted-foreground">{result.reasoning}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
