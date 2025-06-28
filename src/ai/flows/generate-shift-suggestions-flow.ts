'use server';
/**
 * @fileOverview An AI flow for suggesting common restaurant shift times.
 *
 * - generateShiftSuggestions - A function that suggests common shift setups.
 * - GenerateShiftSuggestionsInput - The input type for the function.
 * - GenerateShiftSuggestionsOutput - The return type for the function.
 */
import { ai } from '@/ai/genkit';
import {
  GenerateShiftSuggestionsInputSchema,
  type GenerateShiftSuggestionsInput,
  GenerateShiftSuggestionsOutputSchema,
  type GenerateShiftSuggestionsOutput,
} from '@/ai/schemas/shift-suggestion-schemas';

export async function generateShiftSuggestions(
  input: GenerateShiftSuggestionsInput
): Promise<GenerateShiftSuggestionsOutput> {
  return generateShiftSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateShiftSuggestionsPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: { schema: GenerateShiftSuggestionsInputSchema },
  output: { schema: GenerateShiftSuggestionsOutputSchema },
  prompt: `You are an experienced restaurant operations consultant.
Your task is to suggest 3-4 common, standard shift structures for a typical restaurant.

Provide a name for each shift (e.g., "Opening Shift", "Lunch Rush", "Dinner Service", "Closing Shift") and a corresponding start and end time.
Keep the suggestions logical and cover a full day of operations.
`,
});

const generateShiftSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateShiftSuggestionsFlow',
    inputSchema: GenerateShiftSuggestionsInputSchema,
    outputSchema: GenerateShiftSuggestionsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error(
        'The AI returned an unexpected response. Please try again.'
      );
    }
    return output;
  }
);
