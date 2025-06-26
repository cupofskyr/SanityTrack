'use server';
/**
 * @fileOverview An AI flow for suggesting which employee to assign a task to.
 *
 * - suggestTaskAssignment - A function that suggests an employee for a task based on role and issue.
 * - SuggestTaskAssignmentInput - The input type for the function.
 * - SuggestTaskAssignmentOutput - The return type for the function.
 */
import { configureGenkit, defineFlow } from 'genkit/flow';
import { generate } from 'genkit/ai';
import { googleAI } from '@genkit-ai/googleai';
import {
    SuggestTaskAssignmentInputSchema,
    type SuggestTaskAssignmentInput,
    SuggestTaskAssignmentOutputSchema,
    type SuggestTaskAssignmentOutput
} from '@/ai/schemas/task-assignment-schemas';

configureGenkit({
  plugins: [googleAI()],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

export async function suggestTaskAssignment(input: SuggestTaskAssignmentInput): Promise<SuggestTaskAssignmentOutput> {
  return suggestTaskAssignmentFlow(input);
}

export const suggestTaskAssignmentFlow = defineFlow(
  {
    name: 'suggestTaskAssignmentFlow',
    inputSchema: SuggestTaskAssignmentInputSchema,
    outputSchema: SuggestTaskAssignmentOutputSchema,
  },
  async (input) => {
    const llmResponse = await generate({
      model: googleAI('gemini-1.5-flash-latest'),
      prompt: `You are an expert operations director for a multi-location business.
Your goal is to delegate tasks efficiently.

An urgent issue has come up:
Issue: "{{issueDescription}}"

Here is the available team:
{{#each teamMembers}}
- {{name}} (Role: {{role}})
{{/each}}

Based on the issue and the team members' roles, suggest the most appropriate person to handle this task. Provide a brief, one-sentence reasoning for your choice. For example, if it's a plumbing issue, assign it to a manager who can call a plumber. If it's a simple cleaning task, a regular employee is fine.
`,
      input,
      output: {
        schema: SuggestTaskAssignmentOutputSchema,
      },
    });
    return llmResponse.output()!;
  }
);
