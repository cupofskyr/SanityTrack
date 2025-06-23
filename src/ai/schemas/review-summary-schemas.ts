
import { z } from 'zod';

export const SummarizeReviewsInputSchema = z.object({
  source: z.enum(['Google', 'Yelp']),
  location: z.string().describe('The name of the location to fetch reviews for.'),
});
export type SummarizeReviewsInput = z.infer<typeof SummarizeReviewsInputSchema>;

export const ReviewSchema = z.object({
  source: z.enum(['Google', 'Yelp']),
  rating: z.number().min(1).max(5),
  author: z.string(),
  comment: z.string(),
});

export const SummarizeReviewsOutputSchema = z.object({
    summary: z.string().describe("A concise, one or two sentence summary of the overall sentiment of the reviews."),
    reviews: z.array(ReviewSchema).describe("The list of reviews that were fetched.")
});
export type SummarizeReviewsOutput = z.infer<typeof SummarizeReviewsOutputSchema>;
