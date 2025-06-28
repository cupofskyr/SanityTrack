
'use server';
/**
 * @fileOverview An AI flow for generating menu and marketing ideas based on a top-selling ingredient and seasonal trends.
 *
 * - generateMarketingIdeas - A function that suggests new menu items and marketing angles.
 * - GenerateMarketingIdeasInput - The input type for the function.
 * - GenerateMarketingIdeasOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import {
    GenerateMarketingIdeasInputSchema,
    type GenerateMarketingIdeasInput,
    GenerateMarketingIdeasOutputSchema,
    type GenerateMarketingIdeasOutput,
} from '@/ai/schemas/menu-trends-schemas';
import { format } from 'date-fns';
import { z } from 'zod';

export async function generateMarketingIdeas(input: GenerateMarketingIdeasInput): Promise<GenerateMarketingIdeasOutput> {
  return generateMarketingIdeasFlow(input);
}

// Internal schema for the prompt, including the current date
const PromptInputSchema = GenerateMarketingIdeasInputSchema.extend({
    currentDate: z.string().describe("The current date to consider for seasonal ideas.")
});

const prompt = ai.definePrompt({
    name: 'generateMarketingIdeasPrompt',
    model: 'googleai/gemini-1.5-flash-latest',
    input: { schema: PromptInputSchema },
    output: { schema: GenerateMarketingIdeasOutputSchema },
    prompt: `You are a world-class menu innovation and marketing consultant for a trendy, health-focused restaurant concept specializing in "{{companyConcept}}".

The current date is {{currentDate}}. Be aware of any upcoming holidays, events, or seasons.

The restaurant's undisputed top-selling ingredient flavor right now is "{{topSeller}}".

Your task is to leverage this sales data and seasonal context to create exciting new menu items and marketing strategies.

1.  **Analyze Trends**: Identify three other ingredients that are currently trending in the health-food space and would complement the "{{topSeller}}" flavor profile.
2.  **Innovate Menu Items**: Invent two brand new menu items (a bowl and a shake).
    *   These items should feature "{{topSeller}}" and at least one of the new trending ingredients.
    *   **Crucially, if there is a relevant upcoming holiday or season, give the menu items a thematic twist.** For example, for Halloween, suggest a spooky name and use ingredients like pumpkin. For summer, suggest something refreshing.
    *   For each item, provide:
        *   A catchy, on-brand name.
        *   A delicious-sounding description for the menu.
        *   A list of key ingredients.
        *   A smart marketing angle (e.g., "Limited time Halloween special!", "Perfect summer cooldown").

Your suggestions should be creative, timely, on-brand, and commercially viable.
`,
});

const generateMarketingIdeasFlow = ai.defineFlow(
  {
    name: 'generateMarketingIdeasFlow',
    inputSchema: GenerateMarketingIdeasInputSchema,
    outputSchema: GenerateMarketingIdeasOutputSchema,
  },
  async (input) => {
    const currentDate = format(new Date(), 'MMMM do, yyyy');
    const augmentedInput = { ...input, currentDate };

    const { output } = await prompt(augmentedInput);
    if (!output) {
      throw new Error('The AI returned an unexpected response. Please try again.');
    }
    return output;
  }
);
