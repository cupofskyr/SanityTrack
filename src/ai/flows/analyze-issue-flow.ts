'use server';
/**
 * @fileOverview An AI flow for analyzing and categorizing maintenance issues.
 *
 * - analyzeIssue - A function that categorizes an issue and determines its urgency.
 * - AnalyzeIssueInput - The input type for the analyzeIssue function.
 * - AnalyzeIssueOutput - The return type for the analyzeIssue function.
 */

import {ai} from '@/ai/genkit';
import {
    AnalyzeIssueInputSchema, 
    type AnalyzeIssueInput,
    AnalyzeIssueOutputSchema,
    type AnalyzeIssueOutput
} from '@/ai/schemas/issue-analysis-schemas';

export async function analyzeIssue(input: AnalyzeIssueInput): Promise<AnalyzeIssueOutput> {
  return analyzeIssueFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeIssuePrompt',
  input: {schema: AnalyzeIssueInputSchema},
  output: {schema: AnalyzeIssueOutputSchema},
  prompt: `You are a building maintenance supervisor. Your task is to analyze a reported issue, categorize it, determine if it's an emergency, and suggest the right professional to call.

Available categories are: Plumbing, Electrical, Pest Control, HVAC, General Maintenance, Safety, or Unknown.
An issue is an emergency if it poses an immediate threat to health, safety, or property (e.g., major leaks, sparks, fire hazards).

Issue Description:
"{{{description}}}"

Analyze the issue and provide the category, emergency status, and suggested contact type.
`,
});

const analyzeIssueFlow = ai.defineFlow(
  {
    name: 'analyzeIssueFlow',
    inputSchema: AnalyzeIssueInputSchema,
    outputSchema: AnalyzeIssueOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
