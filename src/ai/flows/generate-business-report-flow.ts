'use server';
/**
 * @fileOverview An AI flow for generating a periodic business analysis report.
 *
 * - generateBusinessReport - Analyzes a collection of documents to identify trends, risks, and highlights.
 * - GenerateBusinessReportInput - The input type for the function.
 * - GenerateBusinessReportOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import {
    GenerateBusinessReportInputSchema,
    type GenerateBusinessReportInput,
    GenerateBusinessReportOutputSchema,
    type GenerateBusinessReportOutput
} from '@/ai/schemas/business-report-schemas';

export async function generateBusinessReport(input: GenerateBusinessReportInput): Promise<GenerateBusinessReportOutput> {
  return generateBusinessReportFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateBusinessReportPrompt',
    model: 'googleai/gemini-1.5-flash-latest',
    input: { schema: GenerateBusinessReportInputSchema },
    output: { schema: GenerateBusinessReportOutputSchema },
    prompt: `You are an expert business analyst and operations consultant for a restaurant chain.
    Your task is to analyze a collection of operational documents for a specific location over a given period and generate a concise, insightful report for the owner.

    Location: {{location}}
    Date Range: {{dateRange}}

    DOCUMENT DATA:
    ---
    {{{documentSummaries}}}
    ---

    Based on the provided data, please perform the following analysis:
    1.  **Executive Summary:** Write a brief, high-level summary of the key takeaways from this period.
    2.  **Trends:** Identify any notable patterns or trends. Examples: "Increase in plumbing-related maintenance tickets," "Decrease in average QA scores on weekends," "Consistent on-time clock-ins by all employees."
    3.  **Risk Factors:** Pinpoint potential risks that require attention. Examples: "An employee's food handler certificate is expiring soon," "Repeat failures on a specific quality check," "Low inventory levels of a critical item."
    4.  **Performance Highlights:** Call out any exceptional performance. Examples: "Jane Smith successfully resolved 3 high-priority issues," "The kitchen team maintained a 98% average on quality checks."

    Focus only on the information provided in the documents. Be factual and actionable.
    `,
});

const generateBusinessReportFlow = ai.defineFlow(
  {
    name: 'generateBusinessReportFlow',
    inputSchema: GenerateBusinessReportInputSchema,
    outputSchema: GenerateBusinessReportOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('The AI returned an unexpected response. Please try again.');
    }
    return output;
  }
);
