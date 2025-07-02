
      import { z } from 'zod';

export const ShoppingListItemSchema = z.object({
  name: z.string().describe("The name of the item to purchase."),
  quantity: z.string().describe("The desired quantity, e.g., '10 lbs', '2 cases', '5 heads'."),
});
export type ShoppingListItem = z.infer<typeof ShoppingListItemSchema>;

export const OptimizeOrderInputSchema = z.object({
    shoppingList: z.array(ShoppingListItemSchema),
});
export type OptimizeOrderInput = z.infer<typeof OptimizeOrderInputSchema>;


const OptimizedItemSchema = z.object({
    name: z.string().describe("The name of the item."),
    quantity: z.string().describe("The quantity to purchase from this supplier."),
    priceInfo: z.string().describe("A brief summary of the price, e.g., '$4.50/lb' or '$9.00/6-pack'."),
    totalPrice: z.number().describe("The total calculated price for this item at this quantity."),
});

const SupplierSplitSchema = z.object({
    supplierName: z.string().describe("The name of the supplier, e.g., 'Sysco' or 'Costco'."),
    items: z.array(OptimizedItemSchema).describe("A list of items to purchase from this supplier."),
    totalCost: z.number().describe("The total cost of all items from this supplier."),
});

export const OptimizeOrderOutputSchema = z.object({
    recommendation: z.array(SupplierSplitSchema).describe("The AI's smart-split recommendation, with one entry per supplier."),
    totalSavings: z.number().describe("The total estimated savings compared to ordering from a single, non-optimal supplier."),
    reasoning: z.string().describe("A brief, one-sentence explanation of the optimization strategy."),
});

export type OptimizeOrderOutput = z.infer<typeof OptimizeOrderOutputSchema>;


// Schemas for the new suggest-order-flow
const InventoryItemForSuggestionSchema = z.object({
    itemName: z.string(),
    currentStock: z.number(),
    reorderThreshold: z.number(),
    avgDailyUsage: z.number(),
});

export const SuggestOrderInputSchema = z.object({
    inventory: z.array(InventoryItemForSuggestionSchema).describe("A list of current inventory items."),
    deliveryBufferDays: z.number().describe("The number of days to buffer for delivery."),
});
export type SuggestOrderInput = z.infer<typeof SuggestOrderInputSchema>;

export const SuggestedItemSchema = z.object({
    itemName: z.string().describe("The name of the item to order."),
    suggestedQty: z.number().describe("The AI-suggested quantity to order."),
});

export const SuggestOrderOutputSchema = z.object({
    reasoning: z.string().describe("A brief, one-sentence explanation for the suggestions."),
    suggestions: z.array(SuggestedItemSchema).describe("The list of items and suggested order quantities."),
});
export type SuggestOrderOutput = z.infer<typeof SuggestOrderOutputSchema>;

    