
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
import { continueOnboardingInterview } from '@/ai/flows/onboarding-interview-flow';
import { masterOnboardingParser } from '@/ai/flows/master-onboarding-parser-flow';
import { queryKnowledgeBase, type QueryKnowledgeBaseInput, type QueryKnowledgeBaseOutput } from '@/ai/flows/knowledge-rag-flow';
import { runMasterAgentDecision, type MasterAgentInput, type MasterAgentOutput } from '@/ai/flows/master-agent-decision-flow';
import type { OnboardingInterviewInput, OnboardingInterviewOutput, OnboardingParserInput, OnboardingParserOutput } from '@/ai/schemas/onboarding-schemas';
import { scanInvoice, type ScanInvoiceInput, type ScanInvoiceOutput } from '@/ai/flows/scan-invoice-flow';
import { generatePermitChecklist, type GeneratePermitChecklistInput, type GeneratePermitChecklistOutput } from '@/ai/flows/generate-permit-checklist-flow';
import { optimizeOrder } from '@/ai/flows/optimizeOrderFlow';
import type { ShoppingListItem, OptimizeOrderOutput } from '@/ai/schemas/ordering-schemas';
import { generateGhostShopperInvite, type GenerateGhostShopperInviteInput, type GenerateGhostShopperInviteOutput } from '@/ai/flows/generate-ghost-shopper-invite-flow';
import { generateBusinessReport, type GenerateBusinessReportOutput } from '@/ai/flows/generate-business-report-flow';
import type { GenerateBusinessReportInput } from '@/ai/schemas/business-report-schemas';


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

export async function analyzeWaitTimeAction(input: AnalyzeWaitTimeInput) {
    return safeRun(analyzeWaitTime, input, 'analyzeWaitTime');
}

export async function scanInvoiceAction(input: ScanInvoiceInput): Promise<{ data: ScanInvoiceOutput | null; error: string | null; }> {
    return safeRun(scanInvoice, input, 'scanInvoice');
}

export async function optimizeOrderAction(input: { shoppingList: ShoppingListItem[] }): Promise<{ data: OptimizeOrderOutput | null; error: string | null; }> {
    return safeRun(optimizeOrder, input, 'optimizeOrder');
}


export async function continueOnboardingInterviewAction(input: OnboardingInterviewInput): Promise<{ data: OnboardingInterviewOutput | null; error: string | null; }> {
    return safeRun(continueOnboardingInterview, input, 'continueOnboardingInterview');
}

export async function masterOnboardingParserAction(input: OnboardingParserInput): Promise<{ data: OnboardingParserOutput | null; error: string | null; }> {
    // In a real app, the parsed data would be written to Firestore here.
    // For this simulation, we just log it and return it to the client.
    console.log("AI Parsed Onboarding Data:", JSON.stringify(input, null, 2));
    return safeRun(masterOnboardingParser, input, 'masterOnboardingParser');
}

export async function queryKnowledgeBaseAction(input: { question: string }): Promise<{ data: { answer: string; source: string } | null; error: string | null; }> {
    
    const ragFlow = async (ragInput: { question: string }): Promise<{ answer: string; source: string; }> => {
        // 1. Simulate the retrieval step of RAG
        let retrievedContext = "No relevant information found in the knowledge base. Try asking about the 'Valkyrie Victory Bowl' or the 'closing checklist'.";
        let source = "Knowledge Base";

        if (ragInput.question.toLowerCase().includes("valkyrie")) {
            retrievedContext = "The Valkyrie Victory Bowl is a high-protein bowl made with vanilla skyr, strawberries, blueberries, and a sprinkle of almond granola. It should be served in the standard blue bowl. - from Q3_Menu_Specials.pdf";
            source = "Q3_Menu_Specials.pdf";
        } else if (ragInput.question.toLowerCase().includes("closing")) {
            retrievedContext = "End-of-day closing checklist requires all counters to be wiped, floors mopped, and the back door must be photographed in a locked position. - from new_closing_checklist.jpg";
            source = "new_closing_checklist.jpg";
        }

        // 2. Augment the prompt and call the AI flow
        const flowInput: QueryKnowledgeBaseInput = {
            question: ragInput.question,
            context: retrievedContext
        };

        const result = await queryKnowledgeBase(flowInput);
        
        if (!result?.answer) {
             throw new Error("AI returned an empty or invalid response for the answer.");
        }
        
        // Augment the successful result with the source
        return { answer: result.answer, source: source };
    };

    return safeRun(ragFlow, input, 'queryKnowledgeBase');
}

export async function runMasterAgentCycleAction(input: MasterAgentInput): Promise<{ data: MasterAgentOutput | null; error: string | null; }> {
    return safeRun(runMasterAgentDecision, input, 'runMasterAgentDecision');
}

export async function generatePermitChecklistAction(input: GeneratePermitChecklistInput): Promise<{ data: GeneratePermitChecklistOutput | null; error: string | null; }> {
    return safeRun(generatePermitChecklist, input, 'generatePermitChecklist');
}

export async function generateGhostShopperInviteAction(input: GenerateGhostShopperInviteInput): Promise<{ data: GenerateGhostShopperInviteOutput | null; error: string | null; }> {
    return safeRun(generateGhostShopperInvite, input, 'generateGhostShopperInvite');
}

export async function generateBusinessReportAction(input: {
    location: string;
    dateRange: string;
    documentTypes: string[];
}): Promise<{ data: GenerateBusinessReportOutput | null; error: string | null; }> {
    const { location, dateRange, documentTypes } = input;

    // 1. Construct the report title
    const reportTitle = `${dateRange} Report for ${location}`;

    // 2. Simulate gathering data based on selections
    let documentSummaries = `Report Data Context for ${location} covering ${documentTypes.join(', ')}:\n`;
    let hasData = false;

    if (location === 'All Locations' || location === 'Downtown') {
        if (documentTypes.includes('Operational Reports')) {
            documentSummaries += `- Downtown: July Activity Log shows 15 high-priority tasks completed, 2 QA failures on 'Classic Burger'.\n`;
            documentSummaries += `- Downtown: July Compliance Report shows 98% score. Minor deduction for unlocked back door on July 15th.\n`;
            hasData = true;
        }
        if (documentTypes.includes('Employee Files')) {
            documentSummaries += `- Downtown Employee (John Doe): Food Handler Permit expires August 15, 2024.\n`;
            hasData = true;
        }
    }
    if (location === 'All Locations' || location === 'Uptown') {
         if (documentTypes.includes('Operational Reports')) {
            documentSummaries += `- Uptown: July Activity Log shows all tasks completed on time. No QA failures.\n`;
            hasData = true;
        }
         if (documentTypes.includes('Employee Files')) {
            documentSummaries += `- Uptown Employee (Jane Smith): All certificates are current. Perfect attendance record.\n`;
            hasData = true;
        }
    }
    if (!hasData) {
        documentSummaries = "No relevant data found for the selected criteria.";
    }

    // 3. Call the flow
    const flowInput: GenerateBusinessReportInput = {
        reportTitle: reportTitle,
        documentSummaries: documentSummaries
    };

    return safeRun(generateBusinessReport, flowInput, 'generateBusinessReport');
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
