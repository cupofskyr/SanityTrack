
/**
 * @fileOverview Schemas for the chat analysis flow.
 */
import { z } from 'zod';

export const AnalyzeChatInputSchema = z.object({
  message: z.string().describe("The employee's chat message."),
  employeeName: z.string().describe('The name of the employee sending the message.'),
  // In a real app, you might pass the shift ID directly if known
});
export type AnalyzeChatInput = z.infer<typeof AnalyzeChatInputSchema>;


export const AnalyzeChatOutputSchema = z.object({
  summary: z.string().describe("A summary of the action taken or the issue detected by the AI."),
  actionTaken: z.boolean().describe("Whether the AI took a direct action (e.g., opened a shift for coverage)."),
});
export type AnalyzeChatOutput = z.infer<typeof AnalyzeChatOutputSchema>;


// Tool Schemas
export const CreateShiftCoverageRequestToolSchema = z.object({
  reason: z.string().describe("The reason the employee cannot work, extracted from their message."),
});

export const PlaceEmergencyOrderItemToolSchema = z.object({
    itemName: z.string().describe("The specific, single item that is out of stock, e.g., 'milk', 'napkins', 'lemons'."),
});

export const NotifyManagerToolSchema = z.object({
    notification: z.string().describe("A concise summary of the issue to send to the manager."),
});
