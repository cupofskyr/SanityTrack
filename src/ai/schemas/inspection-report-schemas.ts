
import { z } from 'zod';

export const ProcessInspectionReportInputSchema = z.object({
  inspectionNotes: z.string().describe('The raw, free-text notes from a health inspection.'),
  locationName: z.string().describe('The name of the location that was inspected.'),
  inspectionDate: z.string().describe('The date of the inspection in YYYY-MM-DD format.'),
});
export type ProcessInspectionReportInput = z.infer<typeof ProcessInspectionReportInputSchema>;

export const SuggestedRecurringTaskSchema = z.object({
  description: z.string().describe('A specific, actionable recurring task.'),
  frequency: z.enum(['Daily', 'Weekly', 'Monthly']).describe('The recommended frequency for the task.'),
});

export const ProcessInspectionReportOutputSchema = z.object({
  immediateTasks: z
    .array(z.string())
    .describe('A list of immediate, one-time tasks that must be addressed based on the inspection. These will be assigned to the owner/manager.'),
  suggestedRecurringTasks: z
    .array(SuggestedRecurringTaskSchema)
    .describe('A list of new recurring tasks suggested for the establishment to maintain compliance.'),
});
export type ProcessInspectionReportOutput = z.infer<typeof ProcessInspectionReportOutputSchema>;
