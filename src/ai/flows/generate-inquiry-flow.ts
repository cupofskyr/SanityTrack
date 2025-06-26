'use server';
/**
 * @fileOverview An AI flow for generating an inquiry to a business owner about a guest complaint.
 *
 * - generateInquiry - A function that drafts a professional message about a guest report.
 * - GenerateInquiryInput - The input type for the function.
 * - GenerateInquiryOutput - The return type for the function.
 */
import { configureGenkit, defineFlow } from 'genkit';
import { generate } from 'genkit/ai';
import { googleAI } from '@genkit-ai/googleai';
import {
  GenerateInquiryInputSchema,
  type GenerateInquiryInput,
  GenerateInquiryOutputSchema,
  type GenerateInquiryOutput,
} from '@/ai/schemas/inquiry-generation-schemas';

configureGenkit({
  plugins: [googleAI()],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

export async function generateInquiry(input: GenerateInquiryInput): Promise<GenerateInquiryOutput> {
  return generateInquiryFlow(input);
}

export const generateInquiryFlow = defineFlow(
  {
    name: 'generateInquiryFlow',
    inputSchema: GenerateInquiryInputSchema,
    outputSchema: GenerateInquiryOutputSchema,
  },
  async (input) => {
    const llmResponse = await generate({
      model: googleAI('gemini-1.5-flash-latest'),
      prompt: `You are a Health Department Agent. Your task is to draft a professional email to a business owner, {{ownerName}}, regarding a guest complaint about their location, {{locationName}}.

The guest reported the following issue:
"{{{guestReport}}}"

Your goals are:
1. Create a clear subject line for the email.
2. Write a polite but firm message body.
3. Clearly state that the issue was reported by a guest.
4. Inquire if the issue has been addressed and resolved.
5. Request confirmation of resolution (e.g., a photo or a description of the action taken).
6. Inform the owner that this has been logged as a mandatory task that requires a formal response.
`,
      input,
      output: {
        schema: GenerateInquiryOutputSchema,
      },
    });
    return llmResponse.output()!;
  }
);
