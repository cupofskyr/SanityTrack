'use server';
/**
 * @fileOverview Schemas and types for the AI onboarding flows.
 */

import { z } from 'zod';

// Schemas for onboarding-interview-flow
export const OnboardingInterviewInputSchema = z.object({
    conversationHistory: z.any() 
});
export type OnboardingInterviewInput = z.infer<typeof OnboardingInterviewInputSchema>;

export const OnboardingInterviewOutputSchema = z.object({
    response: z.string().describe("The AI's next question or statement in the conversation."),
    isComplete: z.boolean().describe("Set to true only when the interview portion is complete and you are prompting for documents."),
});
export type OnboardingInterviewOutput = z.infer<typeof OnboardingInterviewOutputSchema>;


// Schemas for master-onboarding-parser-flow
export const OnboardingParserInputSchema = z.object({
    conversationTranscript: z.string().describe("The full transcript of the onboarding conversation."),
});
export type OnboardingParserInput = z.infer<typeof OnboardingParserInputSchema>;

export const OnboardingParserOutputSchema = z.object({
    menuItems: z.array(z.object({
        name: z.string(),
        description: z.string(),
    })).describe("A list of menu items extracted from the conversation."),
    recurringTasks: z.array(z.object({
        taskName: z.string(),
        frequency: z.string().default('Daily'),
    })).describe("A list of recurring operational tasks."),
    inventoryItems: z.array(z.object({
        itemName: z.string(),
        category: z.string().optional(),
    })).describe("A list of inventory items to track."),
});
export type OnboardingParserOutput = z.infer<typeof OnboardingParserOutputSchema>;
