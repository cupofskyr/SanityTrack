import { z } from 'zod';

const ManualCheckTaskSchema = z.object({
    description: z.string().describe("A clear, actionable description of the manual check task to be performed and verified with a photo."),
    frequency: z.string().describe("The recommended frequency for the task, e.g., '3 times per day', 'At closing'."),
});
export type ManualCheckTask = z.infer<typeof ManualCheckTaskSchema>;

export const ManualCheckSuggestionOutputSchema = z.object({
  tasks: z.array(ManualCheckTaskSchema).describe('A list of suggested manual photo-verified tasks.'),
});
export type ManualCheckSuggestionOutput = z.infer<typeof ManualCheckSuggestionOutputSchema>;
