
import { z } from 'zod';

export const CompareFoodQualityInputSchema = z.object({
  standardImageUri: z.string().describe("The 'golden standard' image of the menu item as a data URI."),
  actualImageUri: z.string().describe("The image of the dish just produced as a data URI."),
  itemName: z.string().describe("The name of the menu item."),
});
export type CompareFoodQualityInput = z.infer<typeof CompareFoodQualityInputSchema>;

export const CompareFoodQualityOutputSchema = z.object({
  score: z.number().min(1).max(10).describe("A score from 1-10 indicating the similarity of the produced dish to the standard."),
  deviations: z.array(z.string()).describe("A list of specific differences or deviations from the standard. E.g., 'Missing garnish', 'Bun is not toasted enough'."),
  feedback: z.string().describe("A brief, constructive feedback statement for the kitchen staff."),
});
export type CompareFoodQualityOutput = z.infer<typeof CompareFoodQualityOutputSchema>;
