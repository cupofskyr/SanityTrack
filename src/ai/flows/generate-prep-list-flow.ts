
'use server';

/**
 * @fileOverview An AI flow for generating an intelligent food prep list for a restaurant.
 *
 * - generatePrepList - A function that creates a prep list based on various operational factors.
 * - GeneratePrepListInput - The input type for the function.
 * - GeneratePrepListOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import {
    GeneratePrepListInputSchema,
    type GeneratePrepListInput,
    GeneratePrepListOutputSchema,
    type GeneratePrepListOutput
} from '@/ai/schemas/prep-list-schemas';


export async function generatePrepList(input: GeneratePrepListInput): Promise<GeneratePrepListOutput> {
  return generatePrepListFlow(input);
}


const prompt = ai.definePrompt({
    name: 'generatePrepListPrompt',
    model: 'googleai/gemini-1.5-flash-latest',
    input: { schema: GeneratePrepListInputSchema },
    output: { schema: GeneratePrepListOutputSchema },
    prompt: `You are an expert Head Chef and Operations Manager for a restaurant. Your task is to create a highly accurate and efficient food preparation list for the kitchen staff.

Analyze all the following factors to determine the precise quantities for each prep item. Your goal is to minimize waste while ensuring you do not run out of popular items during service.

**CONTEXTUAL FACTORS:**
- **Restaurant Type:** {{restaurantType}} (This will determine the style and volume of food).
- **Day of the Week:** {{dayOfWeek}} (Fridays and Saturdays are typically busier).
- **Weather Forecast:** {{weather}} (e.g., Hot weather boosts salad and cold drink sales; cold weather boosts soup and hot meal sales).
- **Local Events/Bookings:** {{events}} (e.g., A local concert or large party booking will significantly increase traffic).

**HISTORICAL DATA:**
- **Past Sales Trends for a similar day:**
{{{historicalSales}}}

**YOUR TASK:**
1.  Synthesize all the above information.
2.  Generate a prep list with specific items and quantities (e.g., "Caesar Salad Dressing: 5 liters", "Burger Patties: 120 each").
3.  Provide a brief, one-sentence summary of your reasoning, explaining the most critical factors for your decision (e.g., "Increased patty count due to the downtown concert, but reduced soup prep because of the hot weather forecast.").

Produce the final output in the required structured format.
`,
});

const generatePrepListFlow = ai.defineFlow(
  {
    name: 'generatePrepListFlow',
    inputSchema: GeneratePrepListInputSchema,
    outputSchema: GeneratePrepListOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('The AI returned an unexpected response. Please try rephrasing your request.');
    }
    return output;
  }
);
