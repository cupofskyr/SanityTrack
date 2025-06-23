
'use server';

/**
 * @fileOverview An AI flow for fetching simulated sales data from a Toast POS.
 *
 * - fetchToastData - A function that returns simulated revenue data.
 * - ToastPOSData - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ToastPOSDataSchema = z.object({
  totalRevenue: z.number().describe('The total revenue for the given period.'),
  changeFromLastMonth: z.number().describe('The percentage change in revenue from the previous month.'),
});
export type ToastPOSData = z.infer<typeof ToastPOSDataSchema>;

// This is a placeholder for a real API call.
async function getSimulatedToastData(): Promise<ToastPOSData> {
    // In a real application, you would make an API call to Toast here.
    // This mock data simulates a successful response.
    const randomRevenue = 40000 + Math.random() * 15000; // between 40k and 55k
    const randomChange = (Math.random() * 10) + 15; // between 15% and 25%
    return {
        totalRevenue: parseFloat(randomRevenue.toFixed(2)),
        changeFromLastMonth: parseFloat(randomChange.toFixed(1)),
    };
}


const fetchToastDataFlow = ai.defineFlow(
  {
    name: 'fetchToastDataFlow',
    inputSchema: z.void(),
    outputSchema: ToastPOSDataSchema,
  },
  async () => {
    // In a real-world scenario, you might have the AI analyze the data
    // or format it, but for this simulation, we just fetch and return.
    return await getSimulatedToastData();
  }
);


export async function fetchToastData(): Promise<ToastPOSData> {
  return fetchToastDataFlow();
}

