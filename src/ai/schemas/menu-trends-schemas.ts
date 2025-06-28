
import { z } from 'zod';

export const GenerateMarketingIdeasInputSchema = z.object({
  topSeller: z.string().describe('The top-selling ingredient or flavor profile, e.g., "Yuzu".'),
  companyConcept: z.string().describe('A brief description of the company concept, e.g., "Skyr bowls and shakes".'),
});
export type GenerateMarketingIdeasInput = z.infer<typeof GenerateMarketingIdeasInputSchema>;

const TrendingIngredientSchema = z.object({
    name: z.string().describe("The name of the trending ingredient."),
    reason: z.string().describe("A brief explanation of why this ingredient is trending and how it complements the top seller."),
});

const MenuItemIdeaSchema = z.object({
    name: z.string().describe("A catchy, on-brand name for the new menu item."),
    type: z.enum(["Bowl", "Shake"]).describe("The type of menu item."),
    description: z.string().describe("A delicious-sounding menu description."),
    keyIngredients: z.array(z.string()).describe("A list of the key ingredients for this new item."),
    marketingAngle: z.string().describe("A smart marketing angle for promoting the item, e.g., 'Limited Time Offer', 'Post-Workout Power-Up'."),
});


export const GenerateMarketingIdeasOutputSchema = z.object({
    trendingIngredients: z.array(TrendingIngredientSchema).describe("A list of complementary trending ingredients."),
    menuIdeas: z.array(MenuItemIdeaSchema).describe("A list of concrete new menu item ideas."),
});
export type GenerateMarketingIdeasOutput = z.infer<typeof GenerateMarketingIdeasOutputSchema>;
