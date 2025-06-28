
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
    prompt: `You are an expert restaurant operations analyst and AI scheduler. Your task is to create the most cost-effective and efficient weekly shift schedule based on sales data and employee capabilities.

**Primary Goal:** Minimize labor costs while ensuring excellent customer service. This means staffing up for peak hours and staffing down for "dead zones."

**1. Analyze the Sales Data:**
Here is the simulated hourly transaction data for a typical week. The 'hour' represents the start of the hour (e.g., 11 means 11:00 AM - 12:00 PM).
\`\`\`json
{{{posData}}}
\`\`\`
First, identify the peak hours (highest transaction volume) and the dead zones (lowest transaction volume).

**2. Understand Employee Capabilities:**
Here are the employees, their roles, hourly rates, unavailability, and their individual productivity (transactions they can handle per hour).
{{#each employees}}
- **{{name}}** ({{role}}):
  - Rate: \${{hourlyRate}}/hr
  - Productivity: {{transactionsPerHour}} transactions/hr
  - Unavailable: {{#if unavailableDates}}{{#each unavailableDates}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None{{/if}}
{{/each}}

**3. The Open Shifts:**
These are the shifts that need to be filled for the upcoming week.
{{#each shifts}}
- Shift ID {{id}}: {{date}} from {{startTime}} to {{endTime}}
{{/each}}

**4. Your Task - Create the Schedule:**
Assign employees to the open shifts following these rules:
1.  **Match Staffing to Sales:** During peak sales hours, ensure enough staff are scheduled to handle the transaction volume. Use the employee 'transactionsPerHour' metric to guide your decision. For example, if peak hours have 60 transactions, you'll need employees whose combined productivity meets or exceeds that number.
2.  **Identify and Reduce Staff in Dead Zones:** During the quietest hours (dead zones), schedule the minimum number of employees required for basic operations (usually 1-2 people).
3.  **Respect Unavailability:** Crucially, never assign an employee to a shift on a date they are unavailable.
4.  **Prioritize Cost-Effectiveness:** When multiple employees are available and capable, prefer the one with the lower hourly rate if it doesn't compromise service quality.
5.  **Output:** Provide the final shift assignments. In your 'reasoning' field, you **MUST** first identify the peak hours and dead zones you found in the data, and then briefly explain your overall staffing strategy (e.g., "Increased staffing during the 12-2 PM lunch rush and scheduled a single employee for the 3-5 PM dead zone.").
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
