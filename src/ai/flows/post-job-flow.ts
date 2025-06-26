'use server';
/**
 * @fileOverview An AI flow for simulating posting a job to a job board.
 */
import { configureGenkit, defineFlow, defineTool } from 'genkit';
import { generate } from 'genkit/ai';
import { googleAI } from '@genkit-ai/googleai';
import { JobPostingInputSchema, JobPostingOutputSchema, type JobPostingInput, type JobPostingOutput } from '@/ai/schemas/job-posting-schemas';

configureGenkit({
  plugins: [googleAI()],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

// This is our mock tool. In a real app, this would call the Indeed/Workable API.
const postToJobBoardTool = defineTool(
  {
    name: 'postToJobBoard',
    description: 'Posts a job listing to an external job board like Indeed.',
    inputSchema: JobPostingInputSchema,
    outputSchema: JobPostingOutputSchema,
  },
  async ({ role, location, shiftType }) => {
    // Simulate API call
    console.log(`Simulating job post to Indeed for ${role} at ${location} (${shiftType}).`);
    
    // Generate a fake confirmation ID
    const confirmationId = `INDEED-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    
    return {
      confirmationId,
      status: `Successfully posted "${role}" position to the job board.`,
      postedTo: 'Indeed (Simulated)',
    };
  }
);


export async function postJob(input: JobPostingInput): Promise<JobPostingOutput> {
  return postJobFlow(input);
}


export const postJobFlow = defineFlow(
    {
        name: 'postJobFlow',
        inputSchema: JobPostingInputSchema,
        outputSchema: JobPostingOutputSchema,
    },
    async (input) => {
        console.log('Initiating job posting flow for:', input);
        const llmResponse = await generate({
            prompt: `The user wants to post a job for a {{role}} at {{location}}. Use the available tools to post this job.`,
            model: googleAI('gemini-1.5-flash-latest'),
            tools: [postToJobBoardTool],
            output: { schema: JobPostingOutputSchema },
            input,
        });

        const output = llmResponse.output();
        if (!output) {
            throw new Error("The AI could not post the job. No output was returned.");
        }
        
        return output;
    }
);
