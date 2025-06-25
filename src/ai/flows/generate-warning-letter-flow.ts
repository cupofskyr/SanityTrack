'use server';
/**
 * @fileOverview An AI flow for generating a warning letter about punctuality.
 */
import { defineFlow } from 'genkit/flow';
import { generate } from 'genkit/ai';
import { googleAI } from '@genkit-ai/googleai';
import {
  GenerateWarningLetterInputSchema,
  type GenerateWarningLetterInput,
  GenerateWarningLetterOutputSchema,
  type GenerateWarningLetterOutput,
} from '@/ai/schemas/warning-letter-schemas';

export async function generateWarningLetter(input: GenerateWarningLetterInput): Promise<GenerateWarningLetterOutput> {
  return generateWarningLetterFlow.run(input);
}

export const generateWarningLetterFlow = defineFlow(
  {
    name: 'generateWarningLetterFlow',
    inputSchema: GenerateWarningLetterInputSchema,
    outputSchema: GenerateWarningLetterOutputSchema,
  },
  async (input) => {
    const llmResponse = await generate({
      model: googleAI.model('gemini-2.0-flash'),
      prompt: `You are a professional and fair HR manager. Your task is to draft a formal warning email to an employee regarding their punctuality. The tone should be firm and clear, but not overly aggressive. It should serve as a formal record.

Employee Name: {{employeeName}}
Incident: {{latenessDetails}}

The email should:
1.  Have a clear, professional subject line (e.g., "Regarding Your Recent Punctuality").
2.  State the specific incident clearly and professionally.
3.  Briefly reiterate the company policy on the importance of punctuality for team operations.
4.  Politely ask the employee to ensure they adhere to their schedule going forward.
5.  End on a professional note, suggesting they speak to their manager if they have any issues preventing them from being on time.
`,
      templateContext: input,
      output: {
        schema: GenerateWarningLetterOutputSchema,
      },
    });
    return llmResponse.output();
  }
);
