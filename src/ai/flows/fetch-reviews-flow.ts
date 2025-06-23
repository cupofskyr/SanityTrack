'use server';
/**
 * @fileOverview An AI flow for fetching and summarizing customer reviews.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReviewSchema = z.object({
  source: z.enum(['Google', 'Yelp']),
  rating: z.number().min(1).max(5),
  author: z.string(),
  comment: z.string(),
});

// This is our mock tool. In a real app, this would call the Yelp/Google APIs.
const fetchReviewsTool = ai.defineTool(
  {
    name: 'fetchReviews',
    description: 'Fetches recent customer reviews from a specified source (Google or Yelp).',
    inputSchema: z.object({ source: z.enum(['Google', 'Yelp']) }),
    outputSchema: z.array(ReviewSchema),
  },
  async ({ source }) => {
    // Mock data simulation
    if (source === 'Google') {
      return [
        { source: 'Google', rating: 5, author: 'Chris P.', comment: 'Absolutely amazing smoothies! The staff is so friendly and the ingredients are always fresh. A must-visit!' },
        { source: 'Google', rating: 4, author: 'Alex G.', comment: 'Great spot for a healthy breakfast. It gets a bit busy in the mornings, but the wait is worth it.' },
      ];
    } else { // Yelp
      return [
        { source: 'Yelp', rating: 5, author: 'Samantha R.', comment: 'I am obsessed with this place. The "Green Detox" is my go-to. The atmosphere is also very calming.' },
        { source: 'Yelp', rating: 3, author: 'Mike T.', comment: 'Decent smoothies, but a bit pricey for the size. The service was a little slow during the lunch rush.' },
        { source: 'Yelp', rating: 4, author: 'Jessica L.', comment: 'Very clean and modern inside. I appreciate that they have non-dairy options. Will be back!' },
      ];
    }
  }
);


export const SummarizeReviewsOutputSchema = z.object({
    summary: z.string().describe("A concise, one or two sentence summary of the overall sentiment of the reviews."),
    reviews: z.array(ReviewSchema).describe("The list of reviews that were fetched.")
});
export type SummarizeReviewsOutput = z.infer<typeof SummarizeReviewsOutputSchema>;

const summarizeReviewsFlow = ai.defineFlow(
    {
        name: 'summarizeReviewsFlow',
        inputSchema: z.string().describe("The user's request, e.g., 'Show me recent Yelp reviews'"),
        outputSchema: SummarizeReviewsOutputSchema,
    },
    async (request) => {
        const llmResponse = await ai.generate({
            prompt: `The user wants to see customer reviews. Use the available tools to fetch them. The user's request is: "${request}". After fetching, provide a very brief summary of the overall sentiment and include the raw review data.`,
            model: 'googleai/gemini-2.0-flash',
            tools: [fetchReviewsTool],
            output: { schema: SummarizeReviewsOutputSchema }
        });
        
        return llmResponse.output()!;
    }
);

export async function summarizeReviews(request: string): Promise<SummarizeReviewsOutput> {
    return summarizeReviewsFlow(request);
}
