'use server';
/**
 * @fileOverview An AI flow for translating text into different languages.
 */
import { defineFlow } from 'genkit/flow';
import { generate } from 'genkit/ai';
import { googleAI } from '@genkit-ai/googleai';
import {
  TranslateTextInputSchema,
  type TranslateTextInput,
  TranslateTextOutputSchema,
  type TranslateTextOutput,
} from '@/ai/schemas/translation-schemas';

export async function translateText(input: TranslateTextInput): Promise<TranslateTextOutput> {
  return translateTextFlow.run(input);
}

export const translateTextFlow = defineFlow(
  {
    name: 'translateTextFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: TranslateTextOutputSchema,
  },
  async (input) => {
    const llmResponse = await generate({
      model: googleAI.model('gemini-2.0-flash'),
      prompt: `Translate the following text to {{targetLanguage}}.
Do not add any preamble, conversational text, or additional formatting. Return only the translated text itself.

Text to translate:
"{{{text}}}"`,
      templateContext: input,
      output: {
        schema: TranslateTextOutputSchema,
      },
    });
    return llmResponse.output();
  }
);
