
'use server';
/**
 * @fileOverview The master decision-making flow for the Sentinel Agent.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { CreateTaskToolSchema, MasterAgentInputSchema, MasterAgentOutputSchema } from '@/ai/schemas/agent-schemas';

// Tool to create a new task in the system. In a real app, this would write to a database.
const createTaskTool = ai.defineTool(
    {
        name: 'createTask',
        description: 'Creates a new task and assigns it for completion.',
        inputSchema: CreateTaskToolSchema,
        outputSchema: z.string(),
    },
    async ({ description, priority }) => {
        // In a real app, this would write to Firestore. Here we just log it.
        console.log(`SENTINEL AGENT: Creating task - Priority: ${priority}, Description: "${description}"`);
        return `Successfully created a ${priority.toLowerCase()} priority task: "${description}"`;
    }
);

// Tool to send an email. In a real app, this would use an email service.
const sendEmailTool = ai.defineTool(
    {
        name: 'sendEmail',
        description: 'Sends an email notification to a manager or owner.',
        inputSchema: z.object({
            recipient: z.string().describe("The email address of the recipient."),
            subject: z.string().describe("The subject line of the email."),
            body: z.string().describe("The body content of the email."),
        }),
        outputSchema: z.string(),
    },
    async ({ recipient, subject, body }) => {
        console.log(`SENTINEL AGENT: Sending email to ${recipient} - Subject: "${subject}"`);
        return `Successfully sent email to ${recipient}.`;
    }
);

export async function runMasterAgentDecision(input: z.infer<typeof MasterAgentInputSchema>): Promise<z.infer<typeof MasterAgentOutputSchema>> {
    return masterAgentDecisionFlow(input);
}


const masterAgentDecisionFlow = ai.defineFlow(
    {
        name: 'masterAgentDecisionFlow',
        inputSchema: MasterAgentInputSchema,
        outputSchema: MasterAgentOutputSchema,
    },
    async (input) => {
        const enabledRules = input.rules.filter(rule => rule.isEnabled);
        if (enabledRules.length === 0) {
            return {
                actionTaken: "No action taken.",
                reasoning: "The Sentinel Agent is enabled, but no specific rules are active."
            };
        }

        const { output } = await ai.generate({
            model: 'googleai/gemini-1.5-flash-latest',
            tools: [createTaskTool, sendEmailTool],
            prompt: `You are the Sentinel Agent, an autonomous operations director for a business.
            Your goal is to proactively manage the business based on a set of rules defined by the owner.
            Analyze the current state of the business and the owner's rules.
            Decide on the single best action to take right now. If no action is needed, do nothing.

            OWNER'S RULES:
            {{#each rules}}
            - {{name}}: {{description}}
            {{/each}}

            CURRENT STATE:
            - Camera Observations: {{#if currentState.cameraObservations}} {{#each currentState.cameraObservations}}"{{this}}"{{#unless @last}}, {{/unless}}{{/each}} {{else}}None{{/if}}
            - Stock Levels: {{#if currentState.stockLevels}} {{#each currentState.stockLevels}}{{item}} is {{level}}{{#unless @last}}, {{/unless}}{{/each}} {{else}}All OK{{/if}}
            - Open High-Priority Tasks: {{#if currentState.openTasks}} {{#each currentState.openTasks}}"{{this}}"{{#unless @last}}, {{/unless}}{{/each}} {{else}}None{{/if}}

            Based on the rules and the current state, what is the next best action? Choose a tool if appropriate.
            If you take an action, provide a brief reasoning for your choice. If you do not take an action, explain why not.
            `,
            input: { rules: enabledRules, currentState: input.currentState },
        });

        if (!output) {
             return {
                actionTaken: "No action taken.",
                reasoning: "The AI returned an empty response."
            };
        }
        
        // This flow is designed for a single tool call per run, simplifying the agent loop.
        const toolRequest = output.toolRequests[0];
        if (toolRequest) {
            const toolResponse = await toolRequest.run();
            return {
                actionTaken: toolResponse as string,
                reasoning: output.text || "Decided based on current state and active rules."
            };
        }
        
        return {
            actionTaken: "No action taken.",
            reasoning: output.text || "No conditions met for autonomous action based on current rules."
        };
    }
);
