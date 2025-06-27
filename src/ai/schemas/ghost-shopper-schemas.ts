
import { z } from 'zod';

export const GenerateGhostShopperInviteInputSchema = z.object({
  shopperEmail: z.string().email().describe('The email address of the potential ghost shopper.'),
  offerDetails: z.string().describe('The reward being offered for their feedback, e.g., "$25 Gift Card".'),
  locationName: z.string().describe('The name of the restaurant location they should visit.'),
});
export type GenerateGhostShopperInviteInput = z.infer<typeof GenerateGhostShopperInviteInputSchema>;

export const GenerateGhostShopperInviteOutputSchema = z.object({
  subject: z.string().describe('A compelling and professional email subject line.'),
  body: z.string().describe('The full body of the email inviting the person to be a ghost shopper. It should be friendly, explain the offer, and clarify what is expected (visit, observe, and provide feedback).'),
});
export type GenerateGhostShopperInviteOutput = z.infer<typeof GenerateGhostShopperInviteOutputSchema>;
