
'use server';

/**
 * @fileOverview An AI flow for generating a shopping list from inventory data.
 *
 * - generateShoppingList - A function that creates a shopping list based on items below par.
 * - GenerateShoppingListInput - The input type for the function.
 * - GenerateShoppingListOutput - The return type for the function.
 */
import { ai } from '@/ai/genkit';
import { 
    GenerateShoppingListInputSchema,
    type GenerateShoppingListInput,
    GenerateShoppingListOutputSchema,
    type GenerateShoppingListOutput
} from '@/ai/schemas/shopping-list-schemas';
import { z } from 'zod';

export async function generateShoppingList(input: GenerateShoppingListInput): Promise<GenerateShoppingListOutput> {
  return generateShoppingListFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateShoppingListPrompt',
    model: 'googleai/gemini-1.5-flash-latest',
    input: { schema: GenerateShoppingListInputSchema.extend({ currentDate: z.string() }) },
    output: { schema: GenerateShoppingListOutputSchema },
    prompt: `You are an efficient restaurant supply chain assistant. Your task is to generate a shopping list and an email subject line based on a list of inventory items that are below their par (ideal) stock level.

Today's date is {{currentDate}}.

Here are the items that need reordering:
{{#each items}}
- {{name}}: Currently have {{currentCount}}, but need {{par}}.
{{/each}}

First, create a subject line for an order email. It should be concise and include today's date.

Next, create a clear, formatted shopping list. For each item, calculate the exact quantity to order to reach its par level (par - current).

Example format for the shopping list:
*   Item Name: Order X units
*   Another Item: Order Y units

Do not add any conversational text or introductions to the shopping list itself.
`,
});

const generateShoppingListFlow = ai.defineFlow(
  {
    name: 'generateShoppingListFlow',
    inputSchema: GenerateShoppingListInputSchema,
    outputSchema: GenerateShoppingListOutputSchema,
  },
  async (input) => {
    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const augmentedInput = { ...input, currentDate };

    const { output } = await prompt(augmentedInput);
    if (!output) {
      throw new Error('The AI returned an unexpected response. Please try again.');
    }
    return output;
  }
);
