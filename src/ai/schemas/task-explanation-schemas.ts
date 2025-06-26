
import { z } from 'zod';

export const ExplainTaskImportanceInputSchema = z.object({
  taskTitle: z.string().describe("The title of the task."),
  taskDescription: z.string().describe("The detailed description of the task."),
});
export type ExplainTaskImportanceInput = z.infer<typeof ExplainTaskImportanceInputSchema>;

export const ExplainTaskImportanceOutputSchema = z.object({
  explanation: z.string().describe("A helpful and motivational explanation of why the task is important."),
});
export type ExplainTaskImportanceOutput = z.infer<typeof ExplainTaskImportanceOutputSchema>;
