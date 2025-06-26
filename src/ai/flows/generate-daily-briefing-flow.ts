'use server';
/**
 * @fileOverview An AI flow for generating a daily briefing for staff.
 *
 * - generateDailyBriefing - A function that generates a daily message for staff.
 * - GenerateDailyBriefingOutput - The return type for the function.
 */
import { configureGenkit, defineFlow } from 'genkit';
import { generate } from 'genkit/ai';
import { googleAI } from '@genkit-ai/googleai';
import { GenerateDailyBriefingOutputSchema, type GenerateDailyBriefingOutput } from '@/ai/schemas/daily-briefing-schemas';
import { format } from 'date-fns';

configureGenkit({
  plugins: [googleAI()],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

export async function generateDailyBriefing(): Promise<GenerateDailyBriefingOutput> {
  return generateDailyBriefingFlow();
}

export const generateDailyBriefingFlow = defineFlow(
  {
    name: 'generateDailyBriefingFlow',
    outputSchema: GenerateDailyBriefingOutputSchema,
  },
  async () => {
    const currentDate = format(new Date(), 'EEEE, MMMM do, yyyy');
    const llmResponse = await generate({
      model: googleAI('gemini-1.5-flash-latest'),
      prompt: `You are a positive and effective restaurant manager starting the day. 
  Today's date is {{currentDate}}.

  Your task is to generate a short, motivational "Daily Briefing" for your staff.
  
  1.  Create a friendly title for the briefing.
  2.  Write a positive and encouraging message for the team. Keep it brief and professional.
  3.  Suggest 2-3 simple, actionable focus tasks for the day. These should be general tasks related to restaurant quality, like "Double-check table cleanliness" or "Upsell our daily special".

  This message will be posted on the employee dashboard to align the team for the day.
  `,
      input: { currentDate },
      output: {
        schema: GenerateDailyBriefingOutputSchema,
      },
    });
    return llmResponse.output()!;
  }
);
