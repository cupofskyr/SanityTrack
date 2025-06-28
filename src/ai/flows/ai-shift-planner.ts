
'use server';

/**
 * @fileOverview An AI flow for generating a weekly shift schedule.
 *
 * - generateSchedule - A function that assigns employees to shifts based on their availability.
 * - GenerateScheduleInput - The input type for the generateSchedule function.
 * - GenerateScheduleOutput - The return type for the generateSchedule function.
 */
import { ai } from '@/ai/genkit';
import {
    GenerateScheduleInputSchema,
    type GenerateScheduleInput,
    GenerateScheduleOutputSchema,
    type GenerateScheduleOutput,
} from '@/ai/schemas/ai-shift-planner-schemas';

export async function generateSchedule(input: GenerateScheduleInput): Promise<GenerateScheduleOutput> {
  return generateScheduleFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateSchedulePrompt',
    model: 'googleai/gemini-1.5-flash-latest',
    input: { schema: GenerateScheduleInputSchema },
    output: { schema: GenerateScheduleOutputSchema },
    prompt: `You are an intelligent shift scheduling assistant for a restaurant manager.
Your task is to create a fair and balanced shift schedule.

Here are the employees and the dates they are NOT available:
{{#each employees}}
- {{name}}: Unavailable on {{#if unavailableDates}}{{#each unavailableDates}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}No unavailable dates{{/if}}
{{/each}}

Here are the open shifts that need to be filled:
{{#each shifts}}
- Shift ID {{id}}: {{date}} from {{startTime}} to {{endTime}}
{{/each}}

Your goal is to assign each shift to an employee. Follow these rules:
1.  **Crucially, do not assign an employee to a shift on a date they have marked as unavailable.**
2.  Try to distribute the shifts as evenly as possible among the employees.
3.  If a shift cannot be assigned because no one is available, list it in the 'unassignedShifts' field.
4.  Provide a brief reasoning for your assignment decisions.
`,
});

const generateScheduleFlow = ai.defineFlow(
  {
    name: 'generateScheduleFlow',
    inputSchema: GenerateScheduleInputSchema,
    outputSchema: GenerateScheduleOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('The AI returned an unexpected response. Please try again.');
    }
    return output;
  }
);
