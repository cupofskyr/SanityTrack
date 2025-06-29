
import { z } from 'zod';

export const CameraAnalysisInputSchema = z.object({
  imageUrl: z.string().url().describe('The public URL of the image to analyze.'),
  analysisPrompt: z.string().describe("The user-defined focus for the analysis."),
});
export type CameraAnalysisInput = z.infer<typeof CameraAnalysisInputSchema>;

export const CameraAnalysisOutputSchema = z.object({
  reportTitle: z.string().describe("A title for the analysis based on the user's prompt."),
  observations: z.array(z.string()).describe('A list of key observations from the image.'),
  data: z.record(z.any()).describe('Structured data extraction (e.g., counts, times).'),
});
export type CameraAnalysisOutput = z.infer<typeof CameraAnalysisOutputSchema>;
