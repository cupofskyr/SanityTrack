import { z } from 'zod';

export const IssueCategorySchema = z.enum([
    "Plumbing", 
    "Electrical", 
    "Pest Control", 
    "HVAC", 
    "General Maintenance", 
    "Cleaning",
    "Safety",
    "Unknown"
]);
export type IssueCategory = z.infer<typeof IssueCategorySchema>;


export const AnalyzeIssueInputSchema = z.object({
  description: z.string().describe('A description of the maintenance issue reported.'),
  photoDataUri: z.string().optional().describe("An optional photo of the issue as a data URI."),
});
export type AnalyzeIssueInput = z.infer<typeof AnalyzeIssueInputSchema>;

export const AnalyzeIssueOutputSchema = z.object({
  category: IssueCategorySchema.describe("The category of the issue."),
  isEmergency: z.boolean().describe('Whether the issue is an emergency requiring immediate attention.'),
  suggestedContact: z.string().describe('The type of professional to contact (e.g., Plumber, Electrician, On-site staff).'),
  urgency: z.enum(["High", "Medium", "Low"]).describe("The urgency level based on potential health code violations."),
  suggestedAction: z.string().describe("A suggested action for the health inspector based on the urgency and category."),
});
export type AnalyzeIssueOutput = z.infer<typeof AnalyzeIssueOutputSchema>;
