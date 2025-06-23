import { z } from 'zod';

export const GenerateWarningLetterInputSchema = z.object({
  employeeName: z.string().describe('The name of the employee.'),
  latenessDetails: z.string().describe('A summary of the lateness incident, e.g., "was 15 minutes late for their shift on July 27th".'),
});
export type GenerateWarningLetterInput = z.infer<typeof GenerateWarningLetterInputSchema>;

export const GenerateWarningLetterOutputSchema = z.object({
  subject: z.string().describe('A clear and professional email subject line regarding punctuality.'),
  body: z.string().describe('The full body of a polite but firm email to the employee about the importance of being on time, referencing the specific incident.'),
});
export type GenerateWarningLetterOutput = z.infer<typeof GenerateWarningLetterOutputSchema>;
