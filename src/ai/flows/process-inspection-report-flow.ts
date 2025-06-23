'use server';

/**
 * @fileOverview An AI flow for processing a health inspector's report.
 *
 * - processInspectionReport - A function that analyzes inspection notes to extract actionable tasks and suggest recurring compliance rules.
 * - ProcessInspectionReportInput - The input type for the function.
 * - ProcessInspectionReportOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const ProcessInspectionReportInputSchema = z.object({
  inspectionNotes: z.string().describe('The raw, free-text notes from a health inspection.'),
  locationName: z.string().describe('The name of the location that was inspected.'),
  inspectionDate: z.string().describe('The date of the inspection in YYYY-MM-DD format.'),
});
export type ProcessInspectionReportInput = z.infer<typeof ProcessInspectionReportInputSchema>;

const SuggestedRecurringTaskSchema = z.object({
  description: z.string().describe('A specific, actionable recurring task.'),
  frequency: z.enum(['Daily', 'Weekly', 'Monthly']).describe('The recommended frequency for the task.'),
});

export const ProcessInspectionReportOutputSchema = z.object({
  immediateTasks: z
    .array(z.string())
    .describe('A list of immediate, one-time tasks that must be addressed based on the inspection. These will be assigned to the owner/manager.'),
  suggestedRecurringTasks: z
    .array(SuggestedRecurringTaskSchema)
    .describe('A list of new recurring tasks suggested for the establishment to maintain compliance.'),
});
export type ProcessInspectionReportOutput = z.infer<typeof ProcessInspectionReportOutputSchema>;

export async function processInspectionReport(
  input: ProcessInspectionReportInput
): Promise<ProcessInspectionReportOutput> {
  return processInspectionReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'processInspectionReportPrompt',
  input: { schema: ProcessInspectionReportInputSchema },
  output: { schema: ProcessInspectionReportOutputSchema },
  prompt: `You are an expert health inspector supervisor reviewing a report for {{locationName}} from an inspection on {{inspectionDate}}.
Your job is to analyze the inspector's notes and extract two types of information:

1.  **Immediate Tasks**: Identify all specific, non-compliant items that need to be fixed immediately. Phrase these as clear, actionable commands. These will be sent to the restaurant owner.
2.  **Suggested Recurring Tasks**: Based on the issues found, suggest new, sensible recurring tasks (Daily, Weekly, or Monthly) that would prevent these issues in the future. These are recommendations for the Health Department to add to the location's compliance checklist.

INSPECTION NOTES:
---
{{{inspectionNotes}}}
---

Analyze the notes and provide the structured output. If there are no issues for a category, return an empty array.
`,
});

const processInspectionReportFlow = ai.defineFlow(
  {
    name: 'processInspectionReportFlow',
    inputSchema: ProcessInspectionReportInputSchema,
    outputSchema: ProcessInspectionReportOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
