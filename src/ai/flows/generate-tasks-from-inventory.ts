'use server';

/**
 * @fileOverview An AI flow for generating a list of recurring tasks based on restaurant inventory.
 *
 * - generateTasksFromInventory - A function that suggests cleaning and maintenance tasks.
 * - GenerateTasksFromInventoryInput - The input type for the function.
 * - GenerateTasksFromInventoryOutput - The return type for the function.
 */
import { configureGenkit, defineFlow } from 'genkit';
import { generate } from 'genkit/ai';
import { googleAI } from '@genkit-ai/googleai';
import {
    GenerateTasksFromInventoryInputSchema, 
    type GenerateTasksFromInventoryInput,
    GenerateTasksFromInventoryOutputSchema,
    type GenerateTasksFromInventoryOutput
} from '@/ai/schemas/task-generation-schemas';

configureGenkit({
  plugins: [googleAI()],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

export async function generateTasksFromInventory(input: GenerateTasksFromInventoryInput): Promise<GenerateTasksFromInventoryOutput> {
  return generateTasksFromInventoryFlow(input);
}

export const generateTasksFromInventoryFlow = defineFlow(
  {
    name: 'generateTasksFromInventoryFlow',
    inputSchema: GenerateTasksFromInventoryInputSchema,
    outputSchema: GenerateTasksFromInventoryOutputSchema,
  },
  async (input) => {
    const llmResponse = await generate({
      model: googleAI('gemini-1.5-flash-latest'),
      prompt: `You are an expert restaurant operations consultant. A new manager is setting up their cleaning and maintenance schedule.
Your task is to generate a comprehensive list of recurring tasks based on the inventory of their restaurant.

First, create a friendly message for the manager explaining that they should label their equipment with numbers to make tracking easier. For example: "Cooler 1", "Cooler 2", "Fryer 1".

Next, based on the following inventory, create a list of specific, actionable cleaning and maintenance tasks.
For items with a count greater than one, create a separate, numbered task for each item. For example, if there are 2 toilets, create tasks for "Toilet 1" and "Toilet 2".

Inventory:
- Coolers: {{coolers}}
- Sinks: {{sinks}}
- Toilets: {{toilets}}
- Trash Bins: {{trashBins}}
- Fryers: {{fryers}}
{{#if additionalDetails}}- Additional Details: {{{additionalDetails}}}{{/if}}

For each task, provide a recommended frequency: Daily, Weekly, or Monthly.
Focus on standard, essential sanitation and maintenance tasks for a restaurant.

Example Task:
{ description: "Deep clean Fryer 1 and change oil", frequency: "Weekly" }
`,
      input,
      output: {
        schema: GenerateTasksFromInventoryOutputSchema,
      },
    });
    return llmResponse.output()!;
  }
);
