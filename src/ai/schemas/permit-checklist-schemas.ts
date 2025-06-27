import { z } from 'zod';

export const GeneratePermitChecklistInputSchema = z.object({
  county: z.string().describe('The Arizona county where the restaurant will be located.'),
  scenario: z.enum(['new-shell', 'existing-location']).describe('The type of restaurant project: a brand new shell space or taking over an existing location.'),
});
export type GeneratePermitChecklistInput = z.infer<typeof GeneratePermitChecklistInputSchema>;

const ChecklistItemSchema = z.object({
  title: z.string().describe('The specific document or action required.'),
  details: z.string().describe('A brief explanation of why this item is important and what it entails.'),
});

const PermitPhaseSchema = z.object({
  phaseNumber: z.number().describe('The step number in the process, e.g., 1.'),
  phaseName: z.string().describe('The name of the application phase, e.g., "Initial Planning & Research".'),
  description: z.string().describe('A summary of the objective for this phase.'),
  checklist: z.array(ChecklistItemSchema).describe('A list of required documents and actions for this phase.'),
});

export const GeneratePermitChecklistOutputSchema = z.object({
  fullPlan: z.array(PermitPhaseSchema).describe('A complete, step-by-step plan for the permit application process.'),
  criticalAdvice: z.string().describe('The single most important piece of advice for the user based on their scenario, to be displayed prominently.'),
});
export type GeneratePermitChecklistOutput = z.infer<typeof GeneratePermitChecklistOutputSchema>;
