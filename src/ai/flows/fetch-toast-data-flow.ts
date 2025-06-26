
'use server';

/**
 * @fileOverview An AI flow for fetching simulated sales data from a Toast POS for a specific location.
 *
 * - fetchToastData - A function that returns simulated revenue data for a location.
 * - FetchToastDataInput - The input type for the function.
 * - ToastPOSData - The return type for the function.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const FetchToastDataInputSchema = z.object({
    location: z.string().describe('The name or ID of the location to fetch data for.'),
});
export type FetchToastDataInput = z.infer<typeof FetchToastDataInputSchema>;


const ToastPOSDataSchema = z.object({
  liveSalesToday: z.number().describe("The live, up-to-the-minute sales revenue for today."),
  salesThisMonth: z.number().describe("The total sales revenue for the current month so far."),
});
export type ToastPOSData = z.infer<typeof ToastPOSDataSchema>;

// This is a placeholder for a real API call.
async function getSimulatedToastData(input: FetchToastDataInput): Promise<ToastPOSData> {
    // In a real application, you would make an API call to Toast using the location.
    // This mock data simulates a successful response, with slight variation based on location name length.
    const baseSales = 2000 + (input.location.length * 100);
    const liveSalesToday = baseSales + Math.random() * 500;
    const salesThisMonth = (baseSales * 20) + Math.random() * 5000;
    
    return {
        liveSalesToday: parseFloat(liveSalesToday.toFixed(2)),
        salesThisMonth: parseFloat(salesThisMonth.toFixed(2)),
    };
}


const fetchToastDataFlow = ai.defineFlow(
  {
    name: 'fetchToastDataFlow',
    inputSchema: FetchToastDataInputSchema,
    outputSchema: ToastPOSDataSchema,
  },
  async (input) => {
    // In a real-world scenario, you might have the AI analyze the data
    // or format it, but for this simulation, we just fetch and return.
    return await getSimulatedToastData(input);
  }
);


export async function fetchToastData(input: FetchToastDataInput): Promise<ToastPOSData> {
  return fetchToastDataFlow(input);
}
