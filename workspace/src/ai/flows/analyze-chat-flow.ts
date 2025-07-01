
'use server';

/**
 * @fileOverview An AI flow to analyze employee chat messages and take appropriate action using tools.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
    AnalyzeChatInputSchema,
    AnalyzeChatOutputSchema,
    CreateShiftCoverageRequestToolSchema,
    NotifyManagerToolSchema,
    PlaceEmergencyOrderItemToolSchema,
    type AnalyzeChatInput,
    type AnalyzeChatOutput,
} from '@/ai/schemas/chat-analysis-schemas';
import { placeEmergencyOrderAction } from '@/app/actions';
import { format } from 'date-fns';


// Tool to open up a shift for coverage.
const createShiftCoverageRequestTool = ai.defineTool(
  {
    name: 'createShiftCoverageRequest',
    description: "Use this when an employee says they are sick, can't come in, or need someone to cover their shift. This makes their currently assigned shift available for others to claim.",
    inputSchema: CreateShiftCoverageRequestToolSchema,
    outputSchema: z.string(),
  },
  async ({ reason }, context) => {
    // In a real app, you'd have the flow context with the employee's ID.
    // For this demo, we'll get the employee name from the flow's input.
    const employeeName = (context?.flow.input as AnalyzeChatInput).employeeName;
    if (!employeeName) return "Could not identify the employee to open their shift.";
    
    // Simulate finding and updating the shift in a database (using localStorage for demo)
    const allShifts = JSON.parse(localStorage.getItem('published-schedule') || '[]');
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    let shiftUpdated = false;

    const updatedShifts = allShifts.map((shift: any) => {
        if (shift.date === todayStr && shift.assignedTo === employeeName) {
            shiftUpdated = true;
            return { ...shift, assignedTo: undefined, status: 'up-for-grabs' };
        }
        return shift;
    });

    if (shiftUpdated) {
        localStorage.setItem('published-schedule', JSON.stringify(updatedShifts));
        return `Successfully opened up ${employeeName}'s shift for coverage due to: ${reason}.`;
    }
    return `${employeeName} does not appear to have a shift assigned today that can be opened for coverage.`;
  }
);


// Tool to place an emergency order for a single item.
const placeEmergencyOrderItemTool = ai.defineTool(
    {
        name: 'placeEmergencyOrderItem',
        description: 'Use this tool when an employee reports that a single, critical supply item has run out and is needed urgently.',
        inputSchema: PlaceEmergencyOrderItemToolSchema,
        outputSchema: z.string(),
    },
    async ({ itemName }) => {
        // This tool calls the existing, more complex emergency order action.
        const result = await placeEmergencyOrderAction({
            itemDescription: `Urgent stockout of ${itemName} reported by an employee.`,
            locationName: 'Downtown', // In a real app, this would come from flow context
        });

        if (result.error || !result.data) {
            return `There was an error placing the emergency order for ${itemName}.`;
        }
        return result.data.confirmationMessage;
    }
);

// A general-purpose tool to notify a manager of an issue that doesn't fit other tools.
const notifyManagerTool = ai.defineTool(
    {
        name: 'notifyManager',
        description: 'Use this for general issues, questions, or comments from an employee that require a manager\'s attention but do not involve shift coverage or a stockout.',
        inputSchema: NotifyManagerToolSchema,
        outputSchema: z.string(),
    },
    async ({ notification }) => {
        // In a real app, this would trigger a push notification, email, or an entry in the manager's dashboard.
        console.log(`MANAGER NOTIFICATION: ${notification}`);
        return `I have notified the manager about the following: "${notification}".`;
    }
);


export async function analyzeChatMessage(input: AnalyzeChatInput): Promise<AnalyzeChatOutput> {
  return analyzeChatMessageFlow(input);
}


const analyzeChatMessageFlow = ai.defineFlow(
  {
    name: 'analyzeChatMessageFlow',
    inputSchema: AnalyzeChatInputSchema,
    outputSchema: AnalyzeChatOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
        model: 'googleai/gemini-1.5-flash-latest',
        tools: [createShiftCoverageRequestTool, placeEmergencyOrderItemTool, notifyManagerTool],
        prompt: `You are an AI operations assistant monitoring the employee chat. It is currently ${format(new Date(), 'PPPP p')}.
        Analyze the following message from employee "${input.employeeName}" and decide which, if any, tool is appropriate to use.

        - If they say they are sick, can't come in, or explicitly ask for shift coverage, use the 'createShiftCoverageRequest' tool.
        - If they report a specific, urgent stockout (e.g., "we are out of milk," "we need lemons now"), use the 'placeEmergencyOrderItem' tool.
        - For any other operational issue, question, or comment that needs a manager's review, use the 'notifyManager' tool.
        - If the message is just social chatter (e.g., "good morning," "great shift everyone"), do not use any tool and just respond with a friendly, encouraging message.
        
        Employee Message: "${input.message}"
        `,
    });
    
    // If the model calls a tool
    if (output.toolRequests.length > 0) {
        const toolResponse = await output.toolRequests[0].run();
        return {
            summary: toolResponse as string,
            actionTaken: true,
        };
    }
    
    // If the model decides no tool is needed
    return {
        summary: output.text || "Thanks for the update!",
        actionTaken: false,
    };
  }
);
