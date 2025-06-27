
'use server';

/**
 * @fileOverview An AI flow for optimizing a shopping order across multiple suppliers.
 *
 * - optimizeOrder - A function that suggests the best supplier for each item on a shopping list to minimize cost.
 * - ShoppingListItem - The input type for the shopping list items.
 * - OptimizeOrderOutput - The return type for the function.
 */
import { ai } from '@/ai/genkit';
import {
    ShoppingListItemSchema,
    OptimizeOrderOutputSchema,
    type OptimizeOrderOutput,
} from '@/ai/schemas/ordering-schemas';
import { z } from 'zod';

export async function optimizeOrder(input: z.infer<typeof OptimizeOrderInputSchema>): Promise<OptimizeOrderOutput> {
    return optimizeOrderFlow(input);
}

const OptimizeOrderInputSchema = z.object({
    shoppingList: z.array(ShoppingListItemSchema),
});


const prompt = ai.definePrompt({
    name: 'optimizeOrderPrompt',
    model: 'googleai/gemini-1.5-flash-latest',
    input: { schema: z.object({ shoppingList: z.array(ShoppingListItemSchema), prices: z.string() }) },
    output: { schema: OptimizeOrderOutputSchema },
    prompt: `You are a brilliant cost-optimization expert for restaurants.
Your task is to analyze a shopping list and a set of prices from two different suppliers: Sysco (a major distributor) and Costco (a local warehouse store).
Your goal is to decide which items should be bought from which supplier to achieve the LOWEST TOTAL COST.

**Pricing Data (Simulated):**
{{{prices}}}

**Rules:**
1.  Analyze the user's shopping list.
2.  For each item, compare the prices from Sysco and Costco.
3.  Pay close attention to units. Some items are sold per unit (lb, head), while others are in packages. You must calculate the most cost-effective option.
4.  Create a "smart-split" recommendation, grouping the items by the supplier they should be ordered from.
5.  Calculate the total cost for each supplier's order.
6.  Provide a total savings estimate and a brief, insightful reasoning for your choices (e.g., "Split the order to leverage Costco's better pricing on fresh produce and Sysco's bulk pricing on dry goods.").
7.  Return the final recommendation in the required JSON format.

**User's Shopping List:**
{{#each shoppingList}}
- {{name}} (Quantity: {{quantity}})
{{/each}}
`,
});


const optimizeOrderFlow = ai.defineFlow(
  {
    name: 'optimizeOrderFlow',
    inputSchema: OptimizeOrderInputSchema,
    outputSchema: OptimizeOrderOutputSchema,
  },
  async ({ shoppingList }) => {
    // In a real app, this data would be fetched from a database that is updated regularly.
    const mockPrices = {
        Sysco: {
            'Ground Beef': { price: 4.50, unit: 'lb' },
            'Romaine Lettuce': { price: 2.50, unit: 'head' },
            'Takeout Containers': { price: 25.00, unit: 'case' },
            'Ketchup': { price: 12.00, unit: 'gallon' },
            'Avocados': { price: 2.00, unit: 'each' },
        },
        Costco: {
            'Ground Beef': { price: 15.71, unit: '3.5 lb package', pricePerUnit: 4.49 },
            'Romaine Lettuce': { price: 9.00, unit: '6-pack', pricePerUnit: 1.50 },
            'Takeout Containers': { price: 35.00, unit: 'case' },
            'Ketchup': { price: 7.00, unit: 'gallon' },
            'Avocados': { price: 6.99, unit: 'bag of 5', pricePerUnit: 1.40 },
        }
    };
    
    const augmentedInput = {
        shoppingList,
        prices: JSON.stringify(mockPrices, null, 2),
    };

    const { output } = await prompt(augmentedInput);
    if (!output) {
      throw new Error('The AI returned an unexpected response. Please try again.');
    }
    return output;
  }
);
