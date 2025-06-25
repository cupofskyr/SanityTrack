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

export const translateTextFlow = ai.defineFlow(
  {
    name: 'translateTextFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: TranslateTextOutputSchema,
  },
  async (input) => {
    const llmResponse = await ai.generate({
      model: 'googleai/gemini-1.5-flash-latest',
      prompt: `Translate the following text to {{targetLanguage}}.
Do not add any preamble, conversational text, or additional formatting. Return only the translated text itself.

Text to translate:
"{{{text}}}"`,
      input,
      output: {
        schema: TranslateTextOutputSchema,
      },
    });
    return llmResponse.output!;
  }
);
