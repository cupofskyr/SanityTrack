
import { z } from 'zod';

export const QueryKnowledgeBaseInputSchema = z.object({
  question: z.string().describe("The user's question."),
  context: z.string().describe("The relevant context retrieved from the knowledge base documents."),
});
export type QueryKnowledgeBaseInput = z.infer<typeof QueryKnowledgeBaseInputSchema>;

export const QueryKnowledgeBaseOutputSchema = z.object({
  answer: z.string().describe("The answer to the user's question, based *only* on the provided context."),
});
export type QueryKnowledgeBaseOutput = z.infer<typeof QueryKnowledgeBaseOutputSchema>;
