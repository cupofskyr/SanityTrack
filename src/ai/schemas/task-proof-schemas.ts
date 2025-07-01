
import { z } from 'zod';

export const VerifyTaskProofInputSchema = z.object({
  photoDataUri: z.string().describe("A photo of the completed task as a data URI."),
  taskDescription: z.string().describe("The description of the task that was completed."),
});
export type VerifyTaskProofInput = z.infer<typeof VerifyTaskProofInputSchema>;

export const VerifyTaskProofOutputSchema = z.object({
  isApproved: z.boolean().describe("Whether the proof is automatically approved by the AI."),
  confidence: z.number().min(0).max(1).describe("The AI's confidence score (0-1) in the validity of the proof."),
  feedback: z.string().describe("A concise feedback message for the employee regarding their submission."),
});
export type VerifyTaskProofOutput = z.infer<typeof VerifyTaskProofOutputSchema>;
