import { z } from 'zod';

export const AnalyzePhotoInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a potential issue, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzePhotoInput = z.infer<typeof AnalyzePhotoInputSchema>;


export const AnalyzePhotoOutputSchema = z.object({
  suggestion: z.string().describe("A concise, actionable description of the issue shown in the photo. For example: 'The toilet is dirty and requires cleaning.' or 'There is a water leak on the floor from the sink.'"),
});
export type AnalyzePhotoOutput = z.infer<typeof AnalyzePhotoOutputSchema>;
