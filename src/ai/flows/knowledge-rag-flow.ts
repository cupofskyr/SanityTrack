
'use server';
/**
 * @fileOverview An AI flow for answering questions using a knowledge base context (RAG).
 *
 * - queryKnowledgeBase - A function that answers a question based on provided context.
 * - QueryKnowledgeBaseInput - The input type for the function.
 * - QueryKnowledgeBaseOutput - The return type for the function.
 */
import { ai } from '@/ai/genkit';
import {
    QueryKnowledgeBaseInputSchema,
    type QueryKnowledgeBaseInput,
    QueryKnowledgeBaseOutputSchema,
    type QueryKnowledgeBaseOutput
} from '@/ai/schemas/knowledge-rag-schemas';

export async function queryKnowledgeBase(input: QueryKnowledgeBaseInput): Promise<QueryKnowledgeBaseOutput> {
  return queryKnowledgeBaseFlow(input);
}

const prompt = ai.definePrompt({
    name: 'queryKnowledgeBasePrompt',
    model: 'googleai/gemini-1.5-flash-latest',
    input: { schema: QueryKnowledgeBaseInputSchema },
    output: { schema: QueryKnowledgeBaseOutputSchema },
    prompt: `You are an assistant for a restaurant manager. Your task is to answer the user's question accurately and concisely, using ONLY the context provided from the company's internal documents. Do not use any external knowledge. If the answer is not in the context, state that you cannot find the information in the documents.

Context from internal documents:
---
{{{context}}}
---

User's Question:
"{{{question}}}"
`,
});

const queryKnowledgeBaseFlow = ai.defineFlow(
  {
    name: 'queryKnowledgeBaseFlow',
    inputSchema: QueryKnowledgeBaseInputSchema,
    outputSchema: QueryKnowledgeBaseOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('The AI returned an unexpected response. Please try again.');
    }
    return output;
  }
);
