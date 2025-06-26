
import { z } from 'zod';

export const EstimateStockLevelInputSchema = z.object({
  currentStockImageUri: z.string().describe("An image of the current stock level as a data URI."),
});
export type EstimateStockLevelInput = z.infer<typeof EstimateStockLevelInputSchema>;

export const EstimateStockLevelOutputSchema = z.object({
  level: z.enum(["Full", "Low", "Critical"]).describe("The classified stock level."),
  estimatedPercentage: z.number().min(0).max(100).describe("An estimated percentage of how full the stock is."),
  recommendation: z.string().describe("A recommended action, e.g., 'No action needed.' or 'Add to reorder list immediately.'"),
});
export type EstimateStockLevelOutput = z.infer<typeof EstimateStockLevelOutputSchema>;
