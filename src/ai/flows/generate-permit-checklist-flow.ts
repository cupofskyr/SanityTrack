
'use server';

/**
 * @fileOverview An AI flow for generating a custom restaurant permit application plan for Arizona.
 *
 * - generatePermitChecklist - A function that creates a tailored, step-by-step checklist for restaurant permit applicants.
 * - GeneratePermitChecklistInput - The input type for the function.
 * - GeneratePermitChecklistOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import {
    GeneratePermitChecklistInputSchema,
    type GeneratePermitChecklistInput,
    GeneratePermitChecklistOutputSchema,
    type GeneratePermitChecklistOutput
} from '@/ai/schemas/permit-checklist-schemas';

export async function generatePermitChecklist(input: GeneratePermitChecklistInput): Promise<GeneratePermitChecklistOutput> {
  return generatePermitChecklistFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generatePermitChecklistPrompt',
    model: 'googleai/gemini-1.5-flash-latest',
    input: { schema: GeneratePermitChecklistInputSchema },
    output: { schema: GeneratePermitChecklistOutputSchema },
    prompt: `You are an expert regulatory consultant specializing in Arizona restaurant permits.
    Your task is to generate a personalized, step-by-step action plan for a restaurant owner based on their specific county and project scenario.
    Use the following regulatory information as your primary knowledge base.

    **KNOWLEDGE BASE: ARIZONA RESTAURANT PERMITTING**

    **Core Principle:** Arizona has a state food code, but enforcement is decentralized to individual county health departments. Requirements can vary significantly. The most critical first step is ALWAYS to identify the county.

    **Key Scenarios & Critical Advice:**
    1.  **New Shell Space:** This is a complex process involving extensive plan reviews before any construction can begin. The AI's critical advice MUST be: "Your most critical phase is the 'Plan Review'. Your architectural, plumbing, and equipment plans must be approved by the county health department BEFORE you begin construction to avoid costly rework."
    2.  **Existing Location (Change of Ownership/Remodel):** This is extremely high-risk. There is NO "grandfather clause" in most major counties (like Maricopa and Pima). The new owner must bring the facility up to CURRENT code. The AI's critical advice MUST be: "Permits are non-transferable. You must assume the facility needs upgrades to meet CURRENT code. Schedule a pre-purchase consultation with the county health department BEFORE signing a lease or purchase agreement to identify all required changes."

    **Application Phases (Structure your output plan using these phases):**
    *   **Phase 1: Initial Planning & Research:** Focus on zoning, site selection, and pre-application consultation with the county health department. This is a vital step.
    *   **Phase 2: Comprehensive Plan Review Submission:** This is the most detailed phase for new builds. Required documents generally include: Architectural Plans, Site Plan, Proposed Menu, Food Equipment Schedule (with NSF/ANSI certified commercial-grade equipment), Plumbing Schedule, Finish Schedules (floors/walls/ceilings), and often a detailed Food Safety/HACCP Plan.
    *   **Phase 3: Construction & Building Permit Compliance:** After health department plan approval, obtain building permits and ensure construction follows the approved plans.
    *   **Phase 4: Pre-Operational Inspections:** After construction, schedule final inspections with Health, Building, Fire, and Zoning departments. All equipment must be installed and operational. No food should be on-site until approval.
    *   **Phase 5: Final Approvals & Permit Issuance:** Once all inspections pass and fees are paid, the Food Facility Permit and Certificate of Occupancy (COO) are issued.
    *   **Phase 6: Post-Opening Compliance:** Remind the user about annual permit renewals and ongoing, unannounced health inspections.

    **USER REQUEST:**
    - County: {{county}}
    - Scenario: {{scenario}}

    Generate a detailed, step-by-step plan organized by the 6 phases. For each phase, provide a clear description and a checklist of key actions and documents.
    Based on the user's scenario, provide the single most important 'Critical Advice' as specified in the knowledge base.
    `,
});

const generatePermitChecklistFlow = ai.defineFlow(
  {
    name: 'generatePermitChecklistFlow',
    inputSchema: GeneratePermitChecklistInputSchema,
    outputSchema: GeneratePermitChecklistOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('The AI returned an unexpected response. Please try again.');
    }
    return output;
  }
);
