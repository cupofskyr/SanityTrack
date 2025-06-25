'use server';

/**
 * @fileOverview An AI flow for processing a health inspector's report.
 *
 * - processInspectionReport - A function that analyzes inspection notes to extract actionable tasks and suggest recurring compliance rules.
 * - ProcessInspectionReportInput - The input type for the function.
 * - ProcessInspectionReportOutput - The return type for the function.
 */
import { defineFlow } from 'genkit/flow';
import { generate } from 'genkit/ai';
import { googleAI } from '@genkit-ai/googleai';
import {
  ProcessInspectionReportInputSchema,
  type ProcessInspectionReportInput,
  ProcessInspectionReportOutputSchema,
  type ProcessInspectionReportOutput,
} from '@/ai/schemas/inspection-report-schemas';

export async function processInspectionReport(
  input: ProcessInspectionReportInput
): Promise<ProcessInspectionReportOutput> {
  return processInspectionReportFlow.run(input);
}

export const processInspectionReportFlow = defineFlow(
  {
    name: 'processInspectionReportFlow',
    inputSchema: ProcessInspectionReportInputSchema,
    outputSchema: ProcessInspectionReportOutputSchema,
  },
  async (input) => {
    const llmResponse = await generate({
      model: googleAI.model('gemini-2.0-flash'),
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
      templateContext: input,
      output: {
        schema: ProcessInspectionReportOutputSchema,
      },
    });
    return llmResponse.output();
  }
);
