
'use server';
/**
 * @fileOverview An AI flow for comparing a food item to a "golden standard" image.
 *
 * - compareFoodQuality - A function that analyzes a dish's presentation against a reference photo.
 * - CompareFoodQualityInput - The input type for the function.
 * - CompareFoodQualityOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import {
    CompareFoodQualityInputSchema,
    type CompareFoodQualityInput,
    CompareFoodQualityOutputSchema,
    type CompareFoodQualityOutput
} from '@/ai/schemas/food-quality-schemas';

export async function compareFoodQuality(input: CompareFoodQualityInput): Promise<CompareFoodQualityOutput> {
  return compareFoodQualityFlow(input);
}

const prompt = ai.definePrompt({
    name: 'compareFoodQualityPrompt',
    model: 'googleai/gemini-1.5-flash-latest',
    input: { schema: CompareFoodQualityInputSchema },
    output: { schema: CompareFoodQualityOutputSchema },
    prompt: `You are a meticulous Head Chef and Quality Control expert for a high-end restaurant chain. Your task is to ensure every dish meets our exacting presentation standards.

You will be given a "golden standard" reference photo for a menu item, and a photo of the dish a cook just prepared.
Your job is to compare the prepared dish to the standard.

Menu Item: "{{itemName}}"
Golden Standard Photo: {{media url=standardImageUri}}
Prepared Dish Photo: {{media url=actualImageUri}}

Analyze the prepared dish and provide:
1. A similarity score from 1 (very different) to 10 (identical).
2. A list of specific, actionable deviations (e.g., "Garnish is on the wrong side," "Fries are undercooked," "Burger is tilted"). If it's perfect, return an empty array.
3. A short, constructive feedback message for the cook.

Be precise and fair. Your feedback helps us maintain excellence.
`,
});

const compareFoodQualityFlow = ai.defineFlow(
  {
    name: 'compareFoodQualityFlow',
    inputSchema: CompareFoodQualityInputSchema,
    outputSchema: CompareFoodQualityOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('The AI returned an unexpected response. Please try again.');
    }
    return output;
  }
);
