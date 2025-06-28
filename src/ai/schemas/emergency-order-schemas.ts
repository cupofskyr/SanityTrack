
import { z } from 'zod';

export const PlaceEmergencyOrderInputSchema = z.object({
  itemDescription: z.string().describe('A description of the item(s) that are urgently needed, e.g., "We are completely out of milk for the coffee machine."'),
  locationName: z.string().describe('The name of the location requesting the order.'),
});
export type PlaceEmergencyOrderInput = z.infer<typeof PlaceEmergencyOrderInputSchema>;

export const PlaceEmergencyOrderOutputSchema = z.object({
  confirmationMessage: z.string().describe("A confirmation message for the employee, including what was ordered and an estimated delivery time."),
});
export type PlaceEmergencyOrderOutput = z.infer<typeof PlaceEmergencyOrderOutputSchema>;

// Schema for the tool
export const InstacartToolInputSchema = z.object({
    itemName: z.string().describe("The specific item to order, e.g., 'Whole Milk' or 'Dozen Eggs'."),
    location: z.string().describe("The location to deliver to."),
});
