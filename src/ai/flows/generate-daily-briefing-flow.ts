'use server';
/**
 * @fileOverview An AI flow for generating a daily briefing for staff.
 *
 * - generateDailyBriefing - A function that generates a daily message for staff.
 * - GenerateDailyBriefingOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { GenerateDailyBriefingOutputSchema, type GenerateDailyBriefingOutput } from '@/ai/schemas/daily-briefing-schemas';
import { z } from 'zod';
import { format } from 'date-fns';

// No specific input needed, but we can pass the date to the prompt.
const DailyBriefingInputSchema = z.object({
  currentDate: z.string(),
});

export async function generateDailyBriefing(): Promise<GenerateDailyBriefingOutput> {
  return generateDailyBriefingFlow();
}

const prompt = ai.definePrompt({
  name: 'generateDailyBriefingPrompt',
  input: { schema: DailyBriefingInputSchema },
  output: { schema: GenerateDailyBriefingOutputSchema },
  prompt: `You are a positive and effective restaurant manager starting the day. 
  Today's date is {{currentDate}}.

  Your task is to generate a short, motivational "Daily Briefing" for your staff.
  
  1.  Create a friendly title for the briefing.
  2.  Write a positive and encouraging message for the team. Keep it brief and professional.
  3.  Suggest 2-3 simple, actionable focus tasks for the day. These should be general tasks related to restaurant quality, like "Double-check table cleanliness" or "Upsell our daily special".

  This message will be posted on the employee dashboard to align the team for the day.
  `,
});

const generateDailyBriefingFlow = ai.defineFlow(
  {
    name: 'generateDailyBriefingFlow',
    outputSchema: GenerateDailyBriefingOutputSchema,
  },
  async () => {
    const currentDate = format(new Date(), 'EEEE, MMMM do, yyyy');
    const { output } = await prompt({ currentDate });
    return output!;
  }
);
