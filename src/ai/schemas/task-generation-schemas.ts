
import { z } from 'zod';

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
