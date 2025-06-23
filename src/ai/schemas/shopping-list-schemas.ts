import { z } from 'zod';

const InventoryItemSchema = z.object({
  name: z.string().describe('The name of the inventory item.'),
  par: z.number().describe('The ideal or par level for this item.'),
  currentCount: z.number().describe('The current count of this item.'),
});

export const GenerateShoppingListInputSchema = z.object({
    items: z.array(InventoryItemSchema).describe('A list of inventory items that are below their par level.'),
});
export type GenerateShoppingListInput = z.infer<typeof GenerateShoppingListInputSchema>;


export const GenerateShoppingListOutputSchema = z.object({
    subject: z.string().describe("A concise email subject line for the inventory order. e.g., 'Inventory Reorder for [Date]'"),
    shoppingList: z.string().describe("A formatted, easy-to-read shopping list string. For each item, clearly state the quantity to order (par level - current count)."),
});
export type GenerateShoppingListOutput = z.infer<typeof GenerateShoppingListOutputSchema>;
