import { z } from 'zod';

export const FetchToastDataInputSchema = z.object({
    location: z.string().describe('The name or ID of the location to fetch data for.'),
});
export type FetchToastDataInput = z.infer<typeof FetchToastDataInputSchema>;


export const ToastPOSDataSchema = z.object({
  liveSalesToday: z.number().describe("The live, up-to-the-minute sales revenue for today."),
  salesThisMonth: z.number().describe("The total sales revenue for the current month so far."),
});
export type ToastPOSData = z.infer<typeof ToastPOSDataSchema>;
