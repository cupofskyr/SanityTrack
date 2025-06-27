
import { z } from 'zod';

// Schema for a single rule defined by the owner
export const AgentRuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  isEnabled: z.boolean(),
  // Simple config for the demo
  config: z.record(z.string()).optional(), 
});

// Input for the master agent decision flow
export const MasterAgentInputSchema = z.object({
  rules: z.array(AgentRuleSchema).describe("The owner-defined rules the agent must follow."),
  currentState: z.object({
    cameraObservations: z.array(z.string()).describe("Observations from camera feeds, e.g., 'Spill detected on floor near counter.'"),
    stockLevels: z.array(z.object({
        item: z.string(),
        level: z.enum(['Full', 'Low', 'Critical']),
    })).describe("Current stock levels of critical items."),
    openTasks: z.array(z.string()).describe("A list of currently open high-priority tasks."),
  }).describe("The current real-time state of the business."),
});
export type MasterAgentInput = z.infer<typeof MasterAgentInputSchema>;


// Output for the master agent, describing the action it took
export const MasterAgentOutputSchema = z.object({
  actionTaken: z.string().describe("A human-readable log of the action the agent took. e.g., 'Created a high-priority cleaning task for the spill.' or 'No action taken.'"),
  reasoning: z.string().describe("A brief explanation for why the action was taken based on the rules and state."),
});
export type MasterAgentOutput = z.infer<typeof MasterAgentOutputSchema>;

// Schema for the task creation tool
export const CreateTaskToolSchema = z.object({
    description: z.string().describe("A clear, actionable description of the task to be created."),
    priority: z.enum(['High', 'Medium', 'Low']).describe("The priority level of the task."),
});
