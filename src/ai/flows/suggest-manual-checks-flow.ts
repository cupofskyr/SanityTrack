'use server';
/**
 * @fileOverview An AI flow for suggesting manual photo-verified compliance tasks.
 */
import { ai } from '@/ai/genkit';
import { ManualCheckSuggestionOutputSchema, type ManualCheckSuggestionOutput } from '@/ai/schemas/manual-check-schemas';

export async function suggestManualChecks(): Promise<ManualCheckSuggestionOutput> {
  return suggestManualChecksFlow();
}

const prompt = ai.definePrompt({
    name: 'suggestManualChecksPrompt',
    model: 'googleai/gemini-1.5-flash-latest',
    output: { schema: ManualCheckSuggestionOutputSchema },
    prompt: `You are an expert restaurant operations and safety consultant.
    A restaurant owner has opted for manual, photo-verified checks instead of automated sensors.
    Your task is to generate a list of 5-7 essential, recurring manual tasks that should be verified with a photo.

    For each task, provide a clear, actionable description and a recommended frequency.
    The frequency should be specific, like "3 times per day", "Once per shift", "At closing".

    Focus on critical areas for health, safety, and quality.
    Good examples:
    - "Photo verification of restroom cleanliness and stock levels."
    - "Photo of final locked back door at end of day."
    - "Photo evidence of line check completion before service."
    - "Temperature log photo for all coolers and freezers."
    - "Photo of clean and sanitized food preparation surfaces."

    Generate the list of tasks.
`,
});

const suggestManualChecksFlow = ai.defineFlow(
  {
    name: 'suggestManualChecksFlow',
    outputSchema: ManualCheckSuggestionOutputSchema,
  },
  async () => {
    const { output } = await prompt({});
    if (!output) {
      throw new Error('The AI returned an unexpected response. Please try again.');
    }
    return output;
  }
);
