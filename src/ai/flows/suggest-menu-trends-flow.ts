
'use server';
/**
 * @fileOverview An AI flow for generating menu and marketing ideas based on a top-selling ingredient.
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

export async function generateMarketingIdeas(input: GenerateMarketingIdeasInput): Promise<GenerateMarketingIdeasOutput> {
  return generateMarketingIdeasFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateMarketingIdeasPrompt',
    model: 'googleai/gemini-1.5-flash-latest',
    input: { schema: GenerateMarketingIdeasInputSchema },
    output: { schema: GenerateMarketingIdeasOutputSchema },
    prompt: `You are a world-class menu innovation and marketing consultant for a trendy, health-focused restaurant concept specializing in "{{companyConcept}}".

The restaurant's undisputed top-selling ingredient flavor right now is "{{topSeller}}".

Your task is to leverage this sales data to create exciting new menu items and marketing strategies.

1.  **Analyze Trends**: Identify three other ingredients that are currently trending in the health-food space and would complement the "{{topSeller}}" flavor profile. Provide a brief, compelling reason for each.
2.  **Innovate Menu Items**: Invent two brand new menu items (a bowl and a shake) that feature "{{topSeller}}" and at least one of the new trending ingredients. For each item, provide:
    *   A catchy, on-brand name.
    *   A delicious-sounding description for the menu.
    *   A list of key ingredients.
    *   A smart marketing angle (e.g., "Post-workout recovery", "Limited seasonal special", "Immunity booster").

Your suggestions should be creative, on-brand, and commercially viable.
`,
});

const generateMarketingIdeasFlow = ai.defineFlow(
  {
    name: 'generateMarketingIdeasFlow',
    inputSchema: GenerateMarketingIdeasInputSchema,
    outputSchema: GenerateMarketingIdeasOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('The AI returned an unexpected response. Please try again.');
    }
    return output;
  }
);
