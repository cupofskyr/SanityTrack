// src/ai/flows/ai-task-recommendation.ts
'use server';

/**
 * @fileOverview AI-powered task recommendation flow for managers.
 *
 * - recommendTasks - A function that suggests tasks to employees based on learned patterns and available information.
 * - RecommendTasksInput - The input type for the recommendTasks function.
 * - RecommendTasksOutput - The return type for the recommendTasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendTasksInputSchema = z.object({
  employeeSkills: z
    .array(z.string())
    .describe('List of skills possessed by the employee.'),
  availableTasks: z
    .array(z.string())
    .describe('List of available tasks that need to be assigned.'),
  pastTasks: z
    .array(z.string())
    .describe('List of tasks previously completed by the employee.'),
  currentIssues: z
    .array(z.string())
    .describe('List of current issues or problems that need attention.'),
});
export type RecommendTasksInput = z.infer<typeof RecommendTasksInputSchema>;

const RecommendTasksOutputSchema = z.object({
  recommendedTasks: z
    .array(z.string())
    .describe('List of recommended tasks for the employee.'),
  reasoning: z
    .string()
    .describe('Explanation of why these tasks were recommended.'),
});
export type RecommendTasksOutput = z.infer<typeof RecommendTasksOutputSchema>;

export async function recommendTasks(input: RecommendTasksInput): Promise<RecommendTasksOutput> {
  return recommendTasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendTasksPrompt',
  input: {schema: RecommendTasksInputSchema},
  output: {schema: RecommendTasksOutputSchema},
  prompt: `You are an AI task recommendation system designed to suggest tasks to employees based on their skills, available tasks, past tasks, and current issues.

  Consider the following information about the employee:
  Skills: {{#if employeeSkills}}{{#each employeeSkills}}- {{{this}}}{{/each}}{{else}}None{{/if}}
  Past Tasks: {{#if pastTasks}}{{#each pastTasks}}- {{{this}}}{{/each}}{{else}}None{{/if}}

  Consider the following available tasks:
  {{#if availableTasks}}{{#each availableTasks}}- {{{this}}}{{/each}}{{else}}None{{/if}}

  Consider the following current issues:
  {{#if currentIssues}}{{#each currentIssues}}- {{{this}}}{{/each}}{{else}}None{{/if}}

  Based on this information, recommend a list of tasks for the employee to complete. Provide a reasoning for why you are recommending these tasks.
  Ensure that the tasks are relevant to the employee's skills and experience, and address the current issues.

  Output the recommended tasks and reasoning in the following format:
  Recommended Tasks: [task1, task2, ...]
  Reasoning: [explanation]`, 
});

const recommendTasksFlow = ai.defineFlow(
  {
    name: 'recommendTasksFlow',
    inputSchema: RecommendTasksInputSchema,
    outputSchema: RecommendTasksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
