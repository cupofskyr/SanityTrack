import { z } from 'zod';

export const GenerateDailyBriefingOutputSchema = z.object({
  title: z.string().describe('A short, catchy title for the daily briefing.'),
  message: z.string().describe('A friendly and motivational message for the staff for the day.'),
  suggestedTasks: z.array(z.string()).describe('A short list of 2-3 optional focus tasks for the team for the day.'),
});
export type GenerateDailyBriefingOutput = z.infer<typeof GenerateDailyBriefingOutputSchema>;
