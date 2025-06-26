
'use server';
/**
 * @fileOverview An AI flow for translating text into different languages.
 */
import { configureGenkit, defineFlow } from 'genkit';
import { generate } from 'genkit/ai';
import { googleAI } from '@genkit-ai/googleai';
import {
  TranslateTextInputSchema,
  type TranslateTextInput,
  TranslateTextOutputSchema,
  type TranslateTextOutput,
} from '@/ai/schemas/translation-schemas';

configureGenkit({
  plugins: [googleAI()],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

export async function translateText(input: TranslateTextInput): Promise<TranslateTextOutput> {
  return translateTextFlow(input);
}

export const translateTextFlow = defineFlow(
  {
    name: 'translateTextFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: TranslateTextOutputSchema,
  },
  async (input) => {
    const llmResponse = await generate({
      model: googleAI('gemini-1.5-flash-latest'),
      prompt: `Translate the following text to {{targetLanguage}}.
Do not add any preamble, conversational text, or additional formatting. Return only the translated text itself.

Text to translate:
"{{{text}}}"`,
      input,
      output: {
        schema: TranslateTextOutputSchema,
      },
    });
    return llmResponse.output()!;
  }
);
