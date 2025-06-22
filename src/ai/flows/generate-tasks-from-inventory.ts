'use server';

/**
 * @fileOverview An AI flow for generating a list of recurring tasks based on restaurant inventory.
 *
 * - generateTasksFromInventory - A function that suggests cleaning and maintenance tasks.
 * - GenerateTasksFromInventoryInput - The input type for the function.
 * - GenerateTasksFromInventoryOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const GenerateTasksFromInventoryInputSchema = z.object({
  coolers: z.number().int().min(0).describe('Number of coolers/refrigerators.'),
  sinks: z.number().int().min(0).describe('Number of sinks.'),
  toilets: z.number().int().min(0).describe('Number of toilets.'),
  trashBins: z.number().int().min(0).describe('Number of trash bins.'),
  fryers: z.number().int().min(0).describe('Number of deep fryers.'),
  additionalDetails: z.string().optional().describe('Any other details about the restaurant layout or equipment.'),
});
export type GenerateTasksFromInventoryInput = z.infer<typeof GenerateTasksFromInventoryInputSchema>;

const TaskSchema = z.object({
    description: z.string().describe("A specific, actionable task description. If there are multiple items (e.g. 3 coolers), create a numbered task for each one (e.g., 'Wipe down Cooler 1 exterior')."),
    frequency: z.enum(["Daily", "Weekly", "Monthly"]).describe("The recommended frequency for the task."),
});

export const GenerateTasksFromInventoryOutputSchema = z.object({
  tasks: z.array(TaskSchema).describe('A list of generated cleaning and maintenance tasks.'),
  setupInstructions: z.string().describe("A friendly message to the manager, instructing them to label their equipment (e.g., 'Cooler 1', 'Sink 2') to make these tasks trackable.")
});
export type GenerateTasksFromInventoryOutput = z.infer<typeof GenerateTasksFromInventoryOutputSchema>;

export async function generateTasksFromInventory(input: GenerateTasksFromInventoryInput): Promise<GenerateTasksFromInventoryOutput> {
  return generateTasksFromInventoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTasksFromInventoryPrompt',
  input: {schema: GenerateTasksFromInventoryInputSchema},
  output: {schema: GenerateTasksFromInventoryOutputSchema},
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
});

const generateTasksFromInventoryFlow = ai.defineFlow(
  {
    name: 'generateTasksFromInventoryFlow',
    inputSchema: GenerateTasksFromInventoryInputSchema,
    outputSchema: GenerateTasksFromInventoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
