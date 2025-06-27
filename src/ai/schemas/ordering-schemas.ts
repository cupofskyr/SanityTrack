
import { z } from 'zod';

export const ShoppingListItemSchema = z.object({
  name: z.string().describe("The name of the item to purchase."),
  quantity: z.string().describe("The desired quantity, e.g., '10 lbs', '2 cases', '5 heads'."),
});
export type ShoppingListItem = z.infer<typeof ShoppingListItemSchema>;


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
