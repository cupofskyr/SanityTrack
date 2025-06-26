
'use server';
/**
 * @fileOverview An AI flow for analyzing and categorizing maintenance issues.
 *
 * - analyzeIssue - A function that categorizes an issue and determines its urgency.
 * - AnalyzeIssueInput - The input type for the analyzeIssue function.
 * - AnalyzeIssueOutput - The return type for the analyzeIssue function.
 */
import { ai } from '@/ai/genkit';
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
    input: { schema: AnalyzeIssueInputSchema },
    output: { schema: AnalyzeIssueOutputSchema },
    prompt: `You are a building maintenance supervisor and health code expert. Your task is to analyze a reported issue, categorize it, determine its urgency, and suggest the right professional to call.

Available categories are: Plumbing, Electrical, Pest Control, HVAC, General Maintenance, Cleaning, Safety, or Unknown.
- Use "Cleaning" for tasks like spills, grime, or full trash cans.
- Use "Maintenance" or a more specific category for anything that is broken, malfunctioning, or requires repair.

An issue is an emergency if it poses an immediate threat to health, safety, or property (e.g., major leaks, sparks, fire hazards).
Urgency should be rated High, Medium, or Low. High for emergencies or significant health code risks (pests, no hot water). Medium for important but not immediate issues (broken but non-critical equipment). Low for minor cosmetic issues or simple cleaning tasks.

For the 'suggestedContact', provide the type of professional needed (e.g., Plumber, Electrician). For simple 'Cleaning' tasks, suggest 'On-site staff'.

Issue Description:
"{{{description}}}"

Analyze the issue and provide the category, emergency status, urgency, suggested contact type, and a suggested action for the inspector.
`,
});

export const analyzeIssueFlow = ai.defineFlow(
  {
    name: 'analyzeIssueFlow',
    inputSchema: AnalyzeIssueInputSchema,
    outputSchema: AnalyzeIssueOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
