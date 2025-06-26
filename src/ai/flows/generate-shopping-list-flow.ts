'use server';

/**
 * @fileOverview An AI flow for generating a shopping list from inventory data.
 *
 * - generateShoppingList - A function that creates a shopping list based on items below par.
 * - GenerateShoppingListInput - The input type for the function.
 * - GenerateShoppingListOutput - The return type for the function.
 */
import { configureGenkit, defineFlow } from 'genkit/flow';
import { generate } from 'genkit/ai';
import { googleAI } from '@genkit-ai/googleai';
import { 
    GenerateShoppingListInputSchema,
    type GenerateShoppingListInput,
    GenerateShoppingListOutputSchema,
    type GenerateShoppingListOutput
} from '@/ai/schemas/shopping-list-schemas';

configureGenkit({
  plugins: [googleAI()],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

export async function generateShoppingList(input: GenerateShoppingListInput): Promise<GenerateShoppingListOutput> {
  return generateShoppingListFlow(input);
}

export const generateShoppingListFlow = defineFlow(
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

    const llmResponse = await generate({
      model: googleAI('gemini-1.5-flash-latest'),
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
      input: augmentedInput,
      output: {
        schema: GenerateShoppingListOutputSchema,
      },
    });
    return llmResponse.output()!;
  }
);
