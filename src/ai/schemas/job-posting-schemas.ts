import { z } from 'zod';

export const JobPostingInputSchema = z.object({
  role: z.string().describe('The job title or role to post.'),
  location: z.string().describe('The physical location of the job.'),
  shiftType: z.enum(['Full-time', 'Part-time', 'Contract']).describe('The type of employment.'),
});
export type JobPostingInput = z.infer<typeof JobPostingInputSchema>;

export const JobPostingOutputSchema = z.object({
  confirmationId: z.string().describe('The confirmation ID or job posting ID from the job board.'),
  status: z.string().describe('The status of the job posting (e.g., "Posted successfully").'),
  postedTo: z.string().describe('The name of the job board it was posted to (e.g., "Indeed").'),
});
export type JobPostingOutput = z.infer<typeof JobPostingOutputSchema>;
