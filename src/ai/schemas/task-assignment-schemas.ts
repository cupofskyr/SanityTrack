import { z } from 'zod';

const TeamMemberSchema = z.object({
    name: z.string().describe("The full name of the team member."),
    role: z.enum(["Manager", "Employee"]).describe("The role of the team member."),
});

export const SuggestTaskAssignmentInputSchema = z.object({
  issueDescription: z.string().describe('A description of the issue or task to be assigned.'),
  teamMembers: z.array(TeamMemberSchema).describe("A list of available team members."),
});
export type SuggestTaskAssignmentInput = z.infer<typeof SuggestTaskAssignmentInputSchema>;

export const SuggestTaskAssignmentOutputSchema = z.object({
  suggestedAssignee: z.string().describe("The name of the employee who should be assigned the task."),
  reasoning: z.string().describe("A brief, one-sentence explanation for the suggestion."),
});
export type SuggestTaskAssignmentOutput = z.infer<typeof SuggestTaskAssignmentOutputSchema>;
