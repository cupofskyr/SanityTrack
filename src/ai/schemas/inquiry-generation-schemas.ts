import { z } from 'zod';

export const GenerateInquiryInputSchema = z.object({
  guestReport: z.string().describe('The content of the guest report or complaint.'),
  locationName: z.string().describe('The name of the location the report is about.'),
  ownerName: z.string().describe('The name of the location owner or manager.'),
});
export type GenerateInquiryInput = z.infer<typeof GenerateInquiryInputSchema>;

export const GenerateInquiryOutputSchema = z.object({
  subject: z.string().describe('A clear and professional email subject line.'),
  messageBody: z.string().describe('The body of the email. It should politely inquire about the issue, state that it was from a guest report, ask if it has been resolved, and request confirmation. It should also state that this has been logged as a mandatory action item.'),
});
export type GenerateInquiryOutput = z.infer<typeof GenerateInquiryOutputSchema>;
