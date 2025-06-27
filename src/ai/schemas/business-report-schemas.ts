import { z } from 'zod';

export const GenerateBusinessReportInputSchema = z.object({
  reportTitle: z.string().describe('A descriptive title for the report, e.g., "Q3 2024 Report for Downtown" or "Q3 2024 Report for All Locations".'),
  documentSummaries: z.string().describe('A string containing summaries of all relevant logs and documents for the period.'),
});
export type GenerateBusinessReportInput = z.infer<typeof GenerateBusinessReportInputSchema>;

export const GenerateBusinessReportOutputSchema = z.object({
  executiveSummary: z.string().describe('A high-level, two-sentence summary of the business performance for the period.'),
  identifiedTrends: z.array(z.string()).describe('A list of notable positive or negative trends observed in the data.'),
  riskFactors: z.array(z.string()).describe('A list of potential risks or upcoming issues, such as expiring certificates or repeated maintenance problems.'),
  performanceHighlights: z.array(z.string()).describe('A list of standout performances, either by employees or the location as a whole.'),
});
export type GenerateBusinessReportOutput = z.infer<typeof GenerateBusinessReportOutputSchema>;
