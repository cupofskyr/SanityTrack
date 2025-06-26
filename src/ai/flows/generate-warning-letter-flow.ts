
/**
 * @fileOverview An AI flow for generating a warning letter about punctuality.
 */
import { ai } from '@/ai/genkit';
import {
  GenerateWarningLetterInputSchema,
  type GenerateWarningLetterInput,
  GenerateWarningLetterOutputSchema,
  type GenerateWarningLetterOutput,
} from '@/ai/schemas/warning-letter-schemas';

export async function generateWarningLetter(input: GenerateWarningLetterInput): Promise<GenerateWarningLetterOutput> {
  return generateWarningLetterFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateWarningLetterPrompt',
    model: 'googleai/gemini-1.5-flash-latest',
    input: { schema: GenerateWarningLetterInputSchema },
    output: { schema: GenerateWarningLetterOutputSchema },
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
});

const generateWarningLetterFlow = ai.defineFlow(
  {
    name: 'generateWarningLetterFlow',
    inputSchema: GenerateWarningLetterInputSchema,
    outputSchema: GenerateWarningLetterOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('The AI returned an unexpected response. Please try again.');
    }
    return output;
  }
);
