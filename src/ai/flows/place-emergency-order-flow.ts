
'use server';
/**
 * @fileOverview An AI flow for placing an emergency order via a simulated Instacart integration.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { 
    PlaceEmergencyOrderInputSchema,
    PlaceEmergencyOrderOutputSchema,
    InstacartToolInputSchema,
    type PlaceEmergencyOrderInput,
    type PlaceEmergencyOrderOutput
} from '@/ai/schemas/emergency-order-schemas';

// This is our mock tool. In a real app, this would call the Instacart API.
const placeInstacartOrderTool = ai.defineTool(
  {
    name: 'placeInstacartOrder',
    description: 'Places a priority delivery order for a single, essential item via the owner\'s Instacart account.',
    inputSchema: InstacartToolInputSchema,
    outputSchema: z.string(),
  },
  async ({ itemName, location }) => {
    // Simulate API call to Instacart
    console.log(`PLACING PRIORITY INSTACART ORDER: Item: "${itemName}", Location: "${location}"`);
    
    // Simulate a successful order placement
    const estimatedTime = Math.floor(Math.random() * 25) + 35; // 35-60 minutes
    return `Order for '${itemName}' placed successfully via Instacart Priority. The owner has been notified. Estimated delivery is in ${estimatedTime} minutes.`;
  }
);


export async function placeEmergencyOrder(input: PlaceEmergencyOrderInput): Promise<PlaceEmergencyOrderOutput> {
  return placeEmergencyOrderFlow(input);
}


const placeEmergencyOrderFlow = ai.defineFlow(
    {
        name: 'placeEmergencyOrderFlow',
        inputSchema: PlaceEmergencyOrderInputSchema,
        outputSchema: PlaceEmergencyOrderOutputSchema,
    },
    async ({ itemDescription, locationName }) => {
        const { output } = await ai.generate({
            prompt: `An employee at the "${locationName}" location has reported an urgent stockout.
            Their report is: "${itemDescription}".
            Your task is to identify the single most critical item from their report and use the available tool to place an emergency order for it.
            After the tool runs, use its output to form the final confirmation message.`,
            model: 'googleai/gemini-1.5-flash-latest',
            tools: [placeInstacartOrderTool],
        });

        if (!output || !output.toolRequests.length) {
            throw new Error("The AI could not determine which item to order.");
        }

        const toolResponse = await output.toolRequests[0].run();

        return {
            confirmationMessage: toolResponse as string,
        };
    }
);
