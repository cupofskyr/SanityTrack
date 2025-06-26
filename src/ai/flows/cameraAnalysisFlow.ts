
import { ai } from '@/ai/genkit';
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

export async function analyzeCamera(input: CameraAnalysisInput): Promise<CameraAnalysisOutput> {
  return cameraAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'cameraAnalysisPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: { schema: CameraAnalysisInputSchema },
  output: { schema: CameraAnalysisOutputSchema },
  prompt: `You are a hyper-observant operations and safety analyst. Your task is to analyze the
  provided image from a store's camera feed and report on the specific focus requested by the user.
  
  User's analysis focus: "{{analysisPrompt}}"
  
  Based ONLY on the image, provide your analysis. Extract key metrics as structured data where possible.
  Be factual and concise.
  
  Image to analyze: {{media url=imageUrl}}`
});

const cameraAnalysisFlow = ai.defineFlow(
  {
    name: 'cameraAnalysisFlow',
    inputSchema: CameraAnalysisInputSchema,
    outputSchema: CameraAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('The AI returned an unexpected response. Please try again.');
    }
    return output;
  }
);
