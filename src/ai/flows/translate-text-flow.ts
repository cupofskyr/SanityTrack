'use server';
/**
 * @fileOverview An AI flow for translating text into different languages.
 */

import { ai } from '@/ai/genkit';
import {
  TranslateTextInputSchema,
  type TranslateTextInput,
  TranslateTextOutputSchema,
  type TranslateTextOutput,
} from '@/ai/schemas/translation-schemas';

export async function translateText(input: TranslateTextInput): Promise<TranslateTextOutput> {
  return translateTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateTextPrompt',
  input: { schema: TranslateTextInputSchema },
  output: { schema: TranslateTextOutputSchema },
  prompt: `Translate the following text to {{targetLanguage}}.
Do not add any preamble, conversational text, or additional formatting. Return only the translated text itself.

Text to translate:
"{{{text}}}"`,
});

const translateTextFlow = ai.defineFlow(
  {
    name: 'translateTextFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: TranslateTextOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
