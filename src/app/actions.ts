
'use server';

// This file is the single, safe entry point for all AI calls from the client-side UI.

import { analyzeCamera, type CameraAnalysisInput, type CameraAnalysisOutput } from '@/ai/flows/cameraAnalysisFlow';
import { analyzeIssue, type AnalyzeIssueInput, type AnalyzeIssueOutput } from '@/ai/flows/analyze-issue-flow';
import { analyzePhotoIssue, type AnalyzePhotoInput, type AnalyzePhotoOutput } from '@/ai/flows/analyze-photo-issue-flow';
import { generateDailyBriefing, type GenerateDailyBriefingOutput } from '@/ai/flows/generate-daily-briefing-flow';
import { generateSchedule, type GenerateScheduleInput, type GenerateScheduleOutput } from '@/ai/flows/ai-shift-planner';
import { generateShoppingList, type GenerateShoppingListInput, type GenerateShoppingListOutput } from '@/ai/flows/generate-shopping-list-flow';
import { generateTasksFromInventory, type GenerateTasksFromInventoryInput, type GenerateTasksFromInventoryOutput } from '@/ai/flows/generate-tasks-from-inventory';
import { suggestTaskAssignment, type SuggestTaskAssignmentInput, type SuggestTaskAssignmentOutput } from '@/ai/flows/suggest-task-assignment-flow';
import { translateText, type TranslateTextInput, type TranslateTextOutput } from '@/ai/flows/translate-text-flow';
import { generateInquiry, type GenerateInquiryInput, type GenerateInquiryOutput } from '@/ai/flows/generate-inquiry-flow';
import { processInspectionReport, type ProcessInspectionReportInput, type ProcessInspectionReportOutput } from '@/ai/flows/process-inspection-report-flow';
import { generateWarningLetter, type GenerateWarningLetterInput, type GenerateWarningLetterOutput } from '@/ai/flows/generate-warning-letter-flow';
import { fetchToastData, type FetchToastDataInput, type ToastPOSData } from '@/ai/flows/fetch-toast-data-flow';
import { summarizeReviews, type SummarizeReviewsInput, type SummarizeReviewsOutput } from '@/ai/flows/fetch-reviews-flow';
import { postJob, type JobPostingInput, type JobPostingOutput } from '@/ai/flows/post-job-flow';
import { compareFoodQuality, type CompareFoodQualityInput, type CompareFoodQualityOutput } from '@/ai/flows/compare-food-quality-flow';
import { estimateStockLevel, type EstimateStockLevelInput, type EstimateStockLevelOutput } from '@/ai/flows/estimate-stock-level-flow';
import { explainTaskImportance, type ExplainTaskImportanceInput, type ExplainTaskImportanceOutput } from '@/ai/flows/explain-task-importance-flow';
import { analyzeWaitTime, type AnalyzeWaitTimeInput } from '@/ai/flows/analyze-wait-time-flow';
import type { ServiceAlert } from '@/ai/schemas/service-alert-schemas';
import { continueOnboardingInterview, type OnboardingInterviewInput, type OnboardingInterviewOutput } from '@/ai/flows/onboarding-interview-flow';
import { masterOnboardingParser, type OnboardingParserInput, type OnboardingParserOutput } from '@/ai/flows/master-onboarding-parser-flow';


// This wrapper function centralizes error handling for all AI flows.
async function safeRun<I, O>(flow: (input: I) => Promise<O>, input: I, flowName: string): Promise<{ data: O | null; error: string | null; }> {
    try {
        const result = await flow(input);
        // The AI can sometimes return an empty response without throwing an error.
        // We ensure that the output is not null or undefined before returning.
        if (!result) {
            console.error(`Error in ${flowName}: AI returned an empty response.`);
            return { data: null, error: `The AI returned an empty response from ${flowName}. Please try again.` };
        }
        return { data: result, error: null };
    } catch (e: any) {
        console.error(`Error in ${flowName}:`, e);
        // Return a user-friendly error message.
        return { data: null, error: `An unexpected error occurred in ${flowName}. Details: ${e.message || 'Unknown error'}` };
    }
}


export async function analyzeCameraImageAction(input: CameraAnalysisInput): Promise<{ data: CameraAnalysisOutput | null; error: string | null; }> {
    return safeRun(analyzeCamera, input, 'analyzeCameraImage');
}

export async function analyzeIssueAction(input: AnalyzeIssueInput): Promise<{ data: AnalyzeIssueOutput | null; error: string | null; }> {
    return safeRun(analyzeIssue, input, 'analyzeIssue');
}

export async function analyzePhotoIssueAction(input: AnalyzePhotoInput): Promise<{ data: AnalyzePhotoOutput | null; error: string | null; }> {
    return safeRun(analyzePhotoIssue, input, 'analyzePhotoIssue');
}

export async function generateDailyBriefingAction(): Promise<{ data: GenerateDailyBriefingOutput | null; error: string | null; }> {
    // This flow has no input, so we create a dummy wrapper.
    return safeRun(() => generateDailyBriefing(), {}, 'generateDailyBriefing');
}

export async function generateScheduleAction(input: GenerateScheduleInput): Promise<{ data: GenerateScheduleOutput | null; error:string | null; }> {
    return safeRun(generateSchedule, input, 'generateSchedule');
}

export async function generateShoppingListAction(input: GenerateShoppingListInput): Promise<{ data: GenerateShoppingListOutput | null; error: string | null; }> {
    return safeRun(generateShoppingList, input, 'generateShoppingList');
}

export async function generateTasksFromInventoryAction(input: GenerateTasksFromInventoryInput): Promise<{ data: GenerateTasksFromInventoryOutput | null; error: string | null; }> {
    return safeRun(generateTasksFromInventory, input, 'generateTasksFromInventory');
}

export async function suggestTaskAssignmentAction(input: SuggestTaskAssignmentInput): Promise<{ data: SuggestTaskAssignmentOutput | null; error: string | null; }> {
    return safeRun(suggestTaskAssignment, input, 'suggestTaskAssignment');
}

export async function translateTextAction(input: TranslateTextInput): Promise<{ data: TranslateTextOutput | null; error: string | null; }> {
    return safeRun(translateText, input, 'translateText');
}

export async function generateInquiryAction(input: GenerateInquiryInput): Promise<{ data: GenerateInquiryOutput | null; error: string | null; }> {
    return safeRun(generateInquiry, input, 'generateInquiry');
}

export async function processInspectionReportAction(input: ProcessInspectionReportInput): Promise<{ data: ProcessInspectionReportOutput | null; error: string | null; }> {
    return safeRun(processInspectionReport, input, 'processInspectionReport');
}

export async function generateWarningLetterAction(input: GenerateWarningLetterInput): Promise<{ data: GenerateWarningLetterOutput | null; error: string | null; }> {
    return safeRun(generateWarningLetter, input, 'generateWarningLetter');
}

export async function fetchToastDataAction(input: FetchToastDataInput): Promise<{ data: ToastPOSData | null; error: string | null; }> {
    return safeRun(fetchToastData, input, 'fetchToastData');
}

export async function summarizeReviewsAction(input: SummarizeReviewsInput): Promise<{ data: SummarizeReviewsOutput | null; error: string | null; }> {
    return safeRun(summarizeReviews, input, 'summarizeReviews');
}

export async function postJobAction(input: JobPostingInput): Promise<{ data: JobPostingOutput | null; error: string | null; }> {
    return safeRun(postJob, input, 'postJob');
}

export async function compareFoodQualityAction(input: CompareFoodQualityInput): Promise<{ data: CompareFoodQualityOutput | null; error: string | null; }> {
    return safeRun(compareFoodQuality, input, 'compareFoodQuality');
}

export async function estimateStockLevelAction(input: EstimateStockLevelInput): Promise<{ data: EstimateStockLevelOutput | null; error: string | null; }> {
    return safeRun(estimateStockLevel, input, 'estimateStockLevel');
}

export async function explainTaskImportanceAction(input: ExplainTaskImportanceInput): Promise<{ data: ExplainTaskImportanceOutput | null; error: string | null; }> {
    return safeRun(explainTaskImportance, input, 'explainTaskImportance');
}

// New action for wait time analysis
export async function analyzeWaitTimeAction(input: AnalyzeWaitTimeInput) {
    return safeRun(analyzeWaitTime, input, 'analyzeWaitTime');
}

// These actions don't call an AI flow, so they don't need the safeRun wrapper.
// They simulate database interactions. In a real app, you would use Firestore here.

export async function authorizeRecoveryAction(input: { alertId: string; action: 'one_10_dollar_card' | 'dismiss' }): Promise<{ success: boolean; code?: string; }> {
    console.log(`Authorizing recovery for alert ${input.alertId} with action: ${input.action}`);
    
    if (input.action === 'dismiss') {
        console.log(`Alert ${input.alertId} dismissed.`);
        // In a real app: await db.collection('serviceAlerts').doc(input.alertId).update({ status: 'dismissed' });
        return { success: true };
    }
  
    const generatedCode = `RECOVERY-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    // Simplified: always assign to John Doe for the demo
    const assignedEmployeeId = 'John Doe';
  
    console.log(`Action dispatched to ${assignedEmployeeId} with code ${generatedCode}`);
    // In a real app: await db.collection('serviceAlerts').doc(input.alertId).update({...});

    return { success: true, code: generatedCode };
}

export async function resolveServiceAlertAction(input: { alertId: string }): Promise<{ success: boolean }> {
    console.log(`Resolving service alert ${input.alertId}`);
    // In a real app: await db.collection('serviceAlerts').doc(input.alertId).update({ status: 'resolved', resolvedAt: new Date() });
    return { success: true };
}


// New actions for AI Onboarding
export async function continueOnboardingInterviewAction(input: OnboardingInterviewInput): Promise<{ data: OnboardingInterviewOutput | null; error: string | null; }> {
    return safeRun(continueOnboardingInterview, input, 'continueOnboardingInterview');
}

export async function masterOnboardingParserAction(input: OnboardingParserInput): Promise<{ data: OnboardingParserOutput | null; error: string | null; }> {
    // In a real app, the parsed data would be written to Firestore here.
    // For this simulation, we just log it and return it to the client.
    console.log("AI Parsed Onboarding Data:", JSON.stringify(input, null, 2));
    return safeRun(masterOnboardingParser, input, 'masterOnboardingParser');
}
