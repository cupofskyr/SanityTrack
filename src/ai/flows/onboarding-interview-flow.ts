
'use server';
/**
 * @fileOverview A conversational AI flow to guide new owners through onboarding.
 *
 * - continueOnboardingInterview - A function that manages the interview state and asks questions.
 * - OnboardingInterviewInput - The input type for the function.
 * - OnboardingInterviewOutput - The return type for the function.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
    OnboardingInterviewInputSchema,
    type OnboardingInterviewInput,
    OnboardingInterviewOutputSchema,
    type OnboardingInterviewOutput
} from '@/ai/schemas/onboarding-schemas';


export async function continueOnboardingInterview(input: OnboardingInterviewInput): Promise<OnboardingInterviewOutput> {
    return onboardingInterviewFlow(input);
}

const OnboardingStateSchema = z.object({
  currentStep: z.enum([
    'INTRODUCTION',
    'GET_RESTAURANT_NAME',
    'GET_MENU_ITEMS',
    'GET_DAILY_TASKS',
    'GET_INVENTORY_ITEMS',
    'PROMPT_FOR_DOCS',
    'COMPLETE',
  ]),
});

const questions: Record<z.infer<typeof OnboardingStateSchema>['currentStep'], string> = {
    INTRODUCTION: "Great! First, what's the name of your restaurant or business?",
    GET_RESTAURANT_NAME: "Awesome. Could you tell me about a few of your most popular menu items? For example, what are they called and what are the main ingredients?",
    GET_MENU_ITEMS: "That sounds delicious. Now, think about your daily routine. What are 2 or 3 of the most important tasks your team has to do every single day to keep things running smoothly?",
    GET_DAILY_TASKS: "Perfect. What are some of the key ingredients or supplies you have to track to make sure you never run out?",
    GET_INVENTORY_ITEMS: "This is fantastic information. I have enough to build out your initial dashboard now. To make it even more accurate, you can optionally upload any documents you have, like your full menu or inventory sheets, in the next step. Shall we finalize this initial setup?",
    PROMPT_FOR_DOCS: "This is the final step. I will now analyze our conversation to build your system.",
    COMPLETE: "Setup is complete."
};

const prompt = ai.definePrompt({
    name: 'onboardingInterviewPrompt',
    model: 'googleai/gemini-1.5-flash-latest',
    input: { schema: z.object({ historyAsString: z.string() }) },
    output: { schema: z.object({ nextStep: OnboardingStateSchema.shape.currentStep }) },
    prompt: `You are a friendly and efficient onboarding assistant for a restaurant software called SanityTrack. 
      Your goal is to guide a new user through a setup interview. You have a list of steps to follow.
      Based on the conversation history, determine the NEXT step in the process.
      
      CONVERSATION HISTORY:
      {{{historyAsString}}}

      INTERVIEW STEPS:
      1. INTRODUCTION (User agrees to start) -> Ask for RESTAURANT_NAME
      2. GET_RESTAURANT_NAME -> Ask for MENU_ITEMS
      3. GET_MENU_ITEMS -> Ask for DAILY_TASKS
      4. GET_DAILY_TASKS -> Ask for INVENTORY_ITEMS
      5. GET_INVENTORY_ITEMS -> PROMPT_FOR_DOCS (Tell them you have enough info and can finalize, but they can upload docs for more detail).
      
      Your task: Analyze the history, figure out which step was just completed, and determine the next step.
      `,
});

const onboardingInterviewFlow = ai.defineFlow(
  {
    name: 'onboardingInterviewFlow',
    inputSchema: OnboardingInterviewInputSchema,
    outputSchema: OnboardingInterviewOutputSchema,
  },
  async ({ conversationHistory }) => {
    const historyAsString = JSON.stringify(conversationHistory);

    const { output } = await prompt({ historyAsString });
    const nextStep = output?.nextStep || 'COMPLETE';
    
    return {
        response: questions[nextStep],
        isComplete: nextStep === 'PROMPT_FOR_DOCS'
    };
  }
);
