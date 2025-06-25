'use server';
/**
 * @fileOverview An AI flow for fetching and summarizing customer reviews for a specific location.
 */
import { defineFlow } from 'genkit/flow';
import { generate } from 'genkit/ai';
import { defineTool } from 'genkit/tool';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';
import {
    ReviewSchema,
    SummarizeReviewsInputSchema,
    type SummarizeReviewsInput,
    SummarizeReviewsOutputSchema,
    type SummarizeReviewsOutput,
} from '@/ai/schemas/review-summary-schemas';

// This is our mock tool. In a real app, this would call the Yelp/Google APIs.
const fetchReviewsTool = defineTool(
  {
    name: 'fetchReviews',
    description: 'Fetches recent customer reviews from a specified source (Google or Yelp) for a specific location.',
    inputSchema: SummarizeReviewsInputSchema, // Use the shared input schema
    outputSchema: z.array(ReviewSchema),
  },
  async ({ source, location }) => {
    // Mock data simulation that varies based on location
    console.log(`Fetching reviews for ${location} from ${source}`);
    if (source === 'Google') {
        if (location.includes("Downtown")) {
            return [
                { source: 'Google', rating: 5, author: 'Chris P.', comment: 'Absolutely amazing smoothies! The staff is so friendly and the ingredients are always fresh. A must-visit!' },
                { source: 'Google', rating: 4, author: 'Alex G.', comment: 'Great spot for a healthy breakfast. It gets a bit busy in the mornings, but the wait is worth it.' },
            ];
        }
        return [ // Default/other location Google reviews
            { source: 'Google', rating: 3, author: 'Pat K.', comment: 'This place was just okay. Nothing special to write home about.'},
            { source: 'Google', rating: 5, author: 'Jamie B.', comment: 'Five stars! The new menu items are fantastic.'},
        ];
    } else { // Yelp
         if (location.includes("Downtown")) {
            return [
                { source: 'Yelp', rating: 5, author: 'Samantha R.', comment: 'I am obsessed with this place. The "Green Detox" is my go-to. The atmosphere is also very calming.' },
                { source: 'Yelp', rating: 3, author: 'Mike T.', comment: 'Decent smoothies, but a bit pricey for the size. The service was a little slow during the lunch rush.' },
                { source: 'Yelp', rating: 4, author: 'Jessica L.', comment: 'Very clean and modern inside. I appreciate that they have non-dairy options. Will be back!' },
            ];
        }
        return [ // Default/other location Yelp reviews
            { source: 'Yelp', rating: 2, author: 'Terry S.', comment: 'Service was slow and my order was wrong. Not coming back.'},
            { source: 'Yelp', rating: 4, author: 'Linda F.', comment: 'A solid choice for a quick lunch, pretty reliable.'},
        ]
    }
  }
);


export type { SummarizeReviewsOutput, SummarizeReviewsInput };

export const summarizeReviewsFlow = defineFlow(
    {
        name: 'summarizeReviewsFlow',
        inputSchema: SummarizeReviewsInputSchema,
        outputSchema: SummarizeReviewsOutputSchema,
    },
    async (input) => {
        const llmResponse = await generate({
            prompt: `The user wants to see customer reviews for the "${input.location}" location from ${input.source}. Use the available tools to fetch them. After fetching, provide a very brief summary of the overall sentiment and include the raw review data.`,
            model: googleAI.model('gemini-2.0-flash'),
            tools: [fetchReviewsTool],
            output: { schema: SummarizeReviewsOutputSchema }
        });
        
        return llmResponse.output();
    }
);

export async function summarizeReviews(input: SummarizeReviewsInput): Promise<SummarizeReviewsOutput> {
    return summarizeReviewsFlow.run(input);
}
