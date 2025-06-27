
'use server';
/**
 * @fileOverview An AI flow for generating an invitation email to a ghost shopper.
 *
 * - generateGhostShopperInvite - A function that drafts a professional invitation email.
 * - GenerateGhostShopperInviteInput - The input type for the function.
 * - GenerateGhostShopperInviteOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import {
    GenerateGhostShopperInviteInputSchema,
    type GenerateGhostShopperInviteInput,
    GenerateGhostShopperInviteOutputSchema,
    type GenerateGhostShopperInviteOutput
} from '@/ai/schemas/ghost-shopper-schemas';

export async function generateGhostShopperInvite(input: GenerateGhostShopperInviteInput): Promise<GenerateGhostShopperInviteOutput> {
  return generateGhostShopperInviteFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateGhostShopperInvitePrompt',
    model: 'googleai/gemini-1.5-flash-latest',
    input: { schema: GenerateGhostShopperInviteInputSchema },
    output: { schema: GenerateGhostShopperInviteOutputSchema },
    prompt: `You are a friendly and professional restaurant marketing manager.
Your task is to draft an invitation email to a potential "ghost shopper" or "secret shopper".

The goal is to invite them to visit our location, have a normal customer experience, and then provide us with their honest feedback. In return for their time and detailed report, we are offering them a reward.

Recipient Email: {{shopperEmail}}
Offer: {{offerDetails}}
Location to Visit: {{locationName}}

Draft an email that is:
1.  **Inviting and Exclusive:** Make them feel like they've been selected for a special opportunity.
2.  **Clear:** Explain what a ghost shopper is and what is expected of them (visit the location, observe things like cleanliness, staff friendliness, food quality, and wait times).
3.  **Specifies the Reward:** Clearly state the {{offerDetails}} they will receive upon submission of their feedback.
4.  **Action-Oriented:** Tell them how to accept (e.g., by replying to the email).
5.  **Professional:** Maintain a professional and courteous tone throughout.

Create a compelling subject line and the full email body.
`,
});

const generateGhostShopperInviteFlow = ai.defineFlow(
  {
    name: 'generateGhostShopperInviteFlow',
    inputSchema: GenerateGhostShopperInviteInputSchema,
    outputSchema: GenerateGhostShopperInviteOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('The AI returned an unexpected response. Please try again.');
    }
    return output;
  }
);
