
'use server';

/**
 * @fileOverview An AI flow for suggesting order quantities based on inventory data and usage.
 *
 * - suggestOrder - A function that suggests order quantities.
 * - SuggestOrderInput - The input type for the function.
 * - SuggestOrderOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import {
    SuggestOrderInputSchema,
    type SuggestOrderInput,
    SuggestOrderOutputSchema,
    type SuggestOrderOutput,
} from '@/ai/schemas/ordering-schemas';


export async function suggestOrder(input: SuggestOrderInput): Promise<SuggestOrderOutput> {
  return suggestOrderFlow(input);
}

const prompt = ai.definePrompt({
    name: 'suggestOrderPrompt',
    model: 'googleai/gemini-1.5-flash-latest',
    input: { schema: SuggestOrderInputSchema },
    output: { schema: SuggestOrderOutputSchema },
    prompt: `You are an expert restaurant supply chain analyst. Your task is to generate a smart reorder list based on the provided inventory data.

The goal is to reorder enough stock to last for the specified delivery buffer period, plus a small safety margin, without overstocking.

**Inventory Data:**
{{#each inventory}}
- **{{itemName}}**:
  - Current Stock: {{currentStock}}
  - Reorder Threshold: {{reorderThreshold}}
  - Average Daily Usage: {{avgDailyUsage}}
{{/each}}

**Delivery Buffer:** {{deliveryBufferDays}} days

**Calculation Logic:**
For each item, calculate the suggested order quantity using this formula:
*Suggested Quantity = (Reorder Threshold + (Average Daily Usage * Delivery Buffer Days)) - Current Stock*
If the result is negative, the suggested quantity should be 0. Round up to the nearest whole number.

Provide a brief, one-sentence reasoning for your overall suggestions. Then, provide the list of suggested items and quantities.
`,
});

const suggestOrderFlow = ai.defineFlow(
  {
    name: 'suggestOrderFlow',
    inputSchema: SuggestOrderInputSchema,
    outputSchema: SuggestOrderOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('The AI returned an unexpected response. Please try again.');
    }
    return output;
  }
);
