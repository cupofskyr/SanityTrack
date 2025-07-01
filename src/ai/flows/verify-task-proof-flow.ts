
'use server';
/**
 * @fileOverview An AI flow for verifying task completion photo proof.
 *
 * This flow simulates a vision model analyzing an image to determine
 * if a task was completed correctly. In a real application, this would
 * involve a more sophisticated vision model and logic.
 */

import { ai } from '@/ai/genkit';
import {
  VerifyTaskProofInputSchema,
  type VerifyTaskProofInput,
  VerifyTaskProofOutputSchema,
  type VerifyTaskProofOutput,
} from '@/ai/schemas/task-proof-schemas';

export async function verifyTaskProof(
  input: VerifyTaskProofInput
): Promise<VerifyTaskProofOutput> {
  return verifyTaskProofFlow(input);
}

const verifyTaskProofFlow = ai.defineFlow(
  {
    name: 'verifyTaskProofFlow',
    inputSchema: VerifyTaskProofInputSchema,
    outputSchema: VerifyTaskProofOutputSchema,
  },
  async (input) => {
    // This is a simulation of a more complex AI analysis.
    // We use a simple, deterministic check for demonstration purposes.
    // A real implementation would use a vision model to check for objects, cleanliness, etc.

    let confidence = Math.random() * 0.5 + 0.4; // Base confidence between 0.4 and 0.9
    let isApproved = false;
    let feedback = `Proof for '${input.taskDescription}' is pending manager review.`;

    // Simulate a check for a blurry image (e.g., small data URI size)
    if (input.photoDataUri.length < 50000) { // less than ~50KB
        confidence = 0.3;
        feedback = `The image for '${input.taskDescription}' seems blurry or too small. Please try again with a clearer photo.`;
    } else {
        // Simulate a check for a valid task
        if(input.taskDescription.toLowerCase().includes('clean')) {
            confidence = Math.random() * 0.2 + 0.8; // Higher confidence for "clean" tasks
        }
        
        if (confidence > 0.85) {
            isApproved = true;
            feedback = `Great job on '${input.taskDescription}'! Proof accepted.`;
        } else {
            feedback = `Proof for '${input.taskDescription}' looks okay, but will require manager approval.`
        }
    }


    return { isApproved, confidence, feedback };
  }
);
