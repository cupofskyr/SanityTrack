import { z } from 'zod';

export const GenerateShiftSuggestionsInputSchema = z.object({
  // For now, no specific input is needed, but we can add things like
  // restaurant type or operating hours later for more tailored suggestions.
});
export type GenerateShiftSuggestionsInput = z.infer<
  typeof GenerateShiftSuggestionsInputSchema
>;

const ShiftSuggestionSchema = z.object({
  name: z.string().describe('The name of the shift, e.g., "Opening Shift".'),
  startTime: z.string().describe('The suggested start time, e.g., "08:00".'),
  endTime: z.string().describe('The suggested end time, e.g., "16:00".'),
});
export type ShiftSuggestion = z.infer<typeof ShiftSuggestionSchema>;

export const GenerateShiftSuggestionsOutputSchema = z.object({
  suggestions: z
    .array(ShiftSuggestionSchema)
    .describe('A list of 3-4 common restaurant shift structures.'),
});
export type GenerateShiftSuggestionsOutput = z.infer<
  typeof GenerateShiftSuggestionsOutputSchema
>;
