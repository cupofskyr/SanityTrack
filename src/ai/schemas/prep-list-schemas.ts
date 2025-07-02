
import { z } from 'zod';

export const GeneratePrepListInputSchema = z.object({
  restaurantType: z.enum(['fast-food', 'fine-dining', 'casual-dining']).describe('The type of restaurant, which heavily influences portioning and item popularity.'),
  dayOfWeek: z.string().describe('The day of the week for the prep list (e.g., "Friday").'),
  weather: z.string().optional().describe('The weather forecast, as certain conditions affect what customers order (e.g., "Sunny and hot", "Cold and rainy").'),
  events: z.string().optional().describe('Any local events or holidays that might affect customer traffic (e.g., "Downtown concert tonight", "Christmas Eve").'),
  historicalSales: z.string().describe('A summary of historical sales data for similar days, indicating which items are most popular.'),
});
export type GeneratePrepListInput = z.infer<typeof GeneratePrepListInputSchema>;


const PrepListItemSchema = z.object({
    item: z.string().describe('The name of the food item to be prepped.'),
    quantity: z.string().describe('The specific quantity to prepare, including units (e.g., "50 portions", "20 lbs", "5 gallons").'),
});

export const GeneratePrepListOutputSchema = z.object({
  prepList: z.array(PrepListItemSchema).describe('The generated list of items and quantities to be prepared.'),
  reasoning: z.string().describe('A brief, high-level summary explaining the key factors that influenced the generated prep list quantities.'),
});
export type GeneratePrepListOutput = z.infer<typeof GeneratePrepListOutputSchema>;
