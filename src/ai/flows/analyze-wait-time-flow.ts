
'use server';
/**
 * @fileOverview An AI flow for analyzing customer wait times from a camera image.
 *
 * - analyzeWaitTime - A function that estimates customer count and wait time, and determines if an alert is needed.
 * - WaitTimeAnalysisOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { WaitTimeAnalysisSchema } from '@/ai/schemas/service-alert-schemas';
export type { WaitTimeAnalysisOutput } from '@/ai/schemas/service-alert-schemas';


const AnalyzeWaitTimeInputSchema = z.object({
  imageUrl: z.string().url().describe('The URL of the camera image to analyze.'),
});
export type AnalyzeWaitTimeInput = z.infer<typeof AnalyzeWaitTimeInputSchema>;


export async function analyzeWaitTime(input: AnalyzeWaitTimeInput): Promise<WaitTimeAnalysisOutput> {
  return analyzeWaitTimeFlow(input);
}

const prompt = ai.definePrompt({
    name: 'analyzeWaitTimePrompt',
    model: 'googleai/gemini-1.5-flash-latest',
    input: { schema: AnalyzeWaitTimeInputSchema },
    output: { schema: WaitTimeAnalysisSchema },
    prompt: `You are a service operations analyst for a restaurant. Your task is to analyze the queue in the provided image.
    
    - Count the number of customers currently waiting in line.
    - Estimate the wait time in minutes for the next customer. Assume each customer takes roughly 45 seconds to serve.
    - You MUST trigger an alert if the line has more than 4 people OR if the estimated wait time is over 3 minutes.
    
    Analyze the image and provide your response in the requested format.
    
    Image to analyze:
    {{media url=imageUrl}}
    `,
});

const analyzeWaitTimeFlow = ai.defineFlow(
  {
    name: 'analyzeWaitTimeFlow',
    inputSchema: AnalyzeWaitTimeInputSchema,
    outputSchema: WaitTimeAnalysisSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('The AI returned an unexpected response. Please try again.');
    }
    return output;
  }
);
