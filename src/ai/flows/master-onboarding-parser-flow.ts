
'use server';
/**
 * @fileOverview An AI flow to parse the full transcript of an onboarding interview.
 *
 * - masterOnboardingParser - A function that extracts structured data from a conversation.
 * - OnboardingParserInput - The input type for the function.
 * - OnboardingParserOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const OnboardingParserInputSchema = z.object({
    conversationTranscript: z.string().describe("The full transcript of the onboarding conversation."),
});
export type OnboardingParserInput = z.infer<typeof OnboardingParserInputSchema>;

export const OnboardingParserOutputSchema = z.object({
    menuItems: z.array(z.object({
        name: z.string(),
        description: z.string(),
    })).describe("A list of menu items extracted from the conversation."),
    recurringTasks: z.array(z.object({
        taskName: z.string(),
        frequency: z.string().default('Daily'),
    })).describe("A list of recurring operational tasks."),
    inventoryItems: z.array(z.object({
        itemName: z.string(),
        category: z.string().optional(),
    })).describe("A list of inventory items to track."),
});
export type OnboardingParserOutput = z.infer<typeof OnboardingParserOutputSchema>;

export async function masterOnboardingParser(input: OnboardingParserInput): Promise<OnboardingParserOutput> {
    return masterOnboardingParserFlow(input);
}

const prompt = ai.definePrompt({
    name: 'masterOnboardingParserPrompt',
    model: 'googleai/gemini-1.5-flash-latest',
    input: { schema: OnboardingParserInputSchema },
    output: { schema: OnboardingParserOutputSchema },
    prompt: `You are an expert business consultant setting up an operations management system for a new restaurant.
        You have been given the full transcript of an onboarding interview with the new owner.
        Your task is to analyze this entire block of text and extract three distinct categories of information:
        1.  **Menu Items**: Identify every dish or drink mentioned.
        2.  **Recurring Tasks**: Identify all daily, weekly, or time-based operational tasks.
        3.  **Inventory Items**: Identify all physical goods, supplies, or ingredients that need to be tracked.
        
        Filter out conversational filler. Focus only on the concrete data provided by the user.
        Structure your final output as a single, clean JSON object.
        
        TRANSCRIPT:
        ---
        {{{conversationTranscript}}}
        ---
        `,
});

const masterOnboardingParserFlow = ai.defineFlow(
  {
    name: 'masterOnboardingParserFlow',
    inputSchema: OnboardingParserInputSchema,
    outputSchema: OnboardingParserOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error("The AI failed to parse the conversation.");
    }
    return output;
  }
);
