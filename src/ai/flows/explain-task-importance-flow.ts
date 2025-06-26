
'use server';
/**
 * @fileOverview An AI flow for explaining the importance of a task.
 *
 * - explainTaskImportance - A function that provides context and motivation for a task.
 * - ExplainTaskImportanceInput - The input type for the function.
 * - ExplainTaskImportanceOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import {
    ExplainTaskImportanceInputSchema,
    type ExplainTaskImportanceInput,
    ExplainTaskImportanceOutputSchema,
    type ExplainTaskImportanceOutput
} from '@/ai/schemas/task-explanation-schemas';

export async function explainTaskImportance(input: ExplainTaskImportanceInput): Promise<ExplainTaskImportanceOutput> {
  return explainTaskImportanceFlow(input);
}

const prompt = ai.definePrompt({
    name: 'explainTaskImportancePrompt',
    model: 'googleai/gemini-1.5-flash-latest',
    input: { schema: ExplainTaskImportanceInputSchema },
    output: { schema: ExplainTaskImportanceOutputSchema },
    prompt: `You are a supportive and motivational team lead. An employee wants to know why a specific task is important.
Your goal is to provide a clear, encouraging, and brief explanation.

Task Title: "{{taskTitle}}"
Task Details: "{{taskDescription}}"

Explain why this task matters. Connect it to bigger goals like guest safety, team efficiency, or maintaining a high-quality environment. Start with a positive and encouraging tone.
`,
});

const explainTaskImportanceFlow = ai.defineFlow(
  {
    name: 'explainTaskImportanceFlow',
    inputSchema: ExplainTaskImportanceInputSchema,
    outputSchema: ExplainTaskImportanceOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('The AI returned an unexpected response. Please try again.');
    }
    return output;
  }
);
