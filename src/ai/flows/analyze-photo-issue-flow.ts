'use server';

/**
 * @fileOverview An AI flow for analyzing a photo to suggest a maintenance or cleaning issue.
 *
 * - analyzePhotoIssue - A function that takes a photo and suggests what issue it depicts.
 * - AnalyzePhotoInput - The input type for the function.
 * - AnalyzePhotoOutput - The return type for the function.
 */
import { defineFlow } from 'genkit/flow';
import { generate } from 'genkit/ai';
import { googleAI } from '@genkit-ai/googleai';
import {
    AnalyzePhotoInputSchema,
    type AnalyzePhotoInput,
    AnalyzePhotoOutputSchema,
    type AnalyzePhotoOutput,
} from '@/ai/schemas/photo-analysis-schemas';


export async function analyzePhotoIssue(input: AnalyzePhotoInput): Promise<AnalyzePhotoOutput> {
    return analyzePhotoIssueFlow.run(input);
}


export const analyzePhotoIssueFlow = defineFlow(
  {
    name: 'analyzePhotoIssueFlow',
    inputSchema: AnalyzePhotoInputSchema,
    outputSchema: AnalyzePhotoOutputSchema,
  },
  async (input) => {
    const llmResponse = await generate({
      model: googleAI.model('gemini-2.0-flash'),
      prompt: `You are an AI assistant for a facility management application. Your task is to analyze the provided photo and generate a short, clear, and actionable description of the maintenance or sanitation issue it depicts.

Focus on what needs to be done. Be direct.

Good examples:
- "The toilet is clogged and overflowing."
- "The trash can is full and needs to be emptied."
- "There is a large water puddle on the floor that needs to be cleaned up."
- "The sink is dirty and requires sanitization."
- "A light fixture is flickering and may need a new bulb or electrical check."

Analyze this image:
{{media url=photoDataUri}}
`,
      templateContext: input,
      output: {
        schema: AnalyzePhotoOutputSchema,
      },
    });
    return llmResponse.output();
  }
);
