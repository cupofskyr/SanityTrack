
'use server';

// This file is the single, safe entry point for all AI calls from the client-side UI.

import { getFirestore, doc, setDoc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { analyzeCamera } from '@/ai/flows/cameraAnalysisFlow';
import type { CameraAnalysisInput, CameraAnalysisOutput } from '@/ai/schemas/camera-analysis-schemas';
import { analyzeIssue, type AnalyzeIssueInput, type AnalyzeIssueOutput } from '@/ai/flows/analyze-issue-flow';
import { analyzePhotoIssue, type AnalyzePhotoInput, type AnalyzePhotoOutput } from '@/ai/flows/analyze-photo-issue-flow';
import { generateDailyBriefing, type GenerateDailyBriefingOutput } from '@/ai/flows/generate-daily-briefing-flow';
import { generateSchedule } from '@/ai/flows/ai-shift-planner';
import type { GenerateScheduleInput, GenerateScheduleOutput } from '@/ai/schemas/ai-shift-planner-schemas';
import { generateShoppingList, type GenerateShoppingListInput, type GenerateShoppingListOutput } from '@/ai/flows/generate-shopping-list-flow';
import { generateTasksFromInventory, type GenerateTasksFromInventoryInput, type GenerateTasksFromInventoryOutput } from '@/ai/flows/generate-tasks-from-inventory';
import { suggestTaskAssignment, type SuggestTaskAssignmentInput, type SuggestTaskAssignmentOutput } from '@/ai/flows/suggest-task-assignment-flow';
import { translateText, type TranslateTextInput, type TranslateTextOutput } from '@/ai/flows/translate-text-flow';
import { generateInquiry, type GenerateInquiryInput, type GenerateInquiryOutput } from '@/ai/flows/generate-inquiry-flow';
import { processInspectionReport, type ProcessInspectionReportInput, type ProcessInspectionReportOutput } from '@/ai/flows/process-inspection-report-flow';
import { generateWarningLetter, type GenerateWarningLetterInput, type GenerateWarningLetterOutput } from '@/ai/flows/generate-warning-letter-flow';
import { fetchToastData } from '@/ai/flows/fetch-toast-data-flow';
import type { FetchToastDataInput, ToastPOSData } from '@/ai/schemas/toast-pos-schemas';
import { summarizeReviews } from '@/ai/flows/fetch-reviews-flow';
import type { SummarizeReviewsInput, SummarizeReviewsOutput } from '@/ai/schemas/review-summary-schemas';
import { postJob, type JobPostingInput, type JobPostingOutput } from '@/ai/flows/post-job-flow';
import { compareFoodQuality, type CompareFoodQualityInput, type CompareFoodQualityOutput } from '@/ai/flows/compare-food-quality-flow';
import { estimateStockLevel, type EstimateStockLevelInput, type EstimateStockLevelOutput } from '@/ai/flows/estimate-stock-level-flow';
import { explainTaskImportance, type ExplainTaskImportanceInput, type ExplainTaskImportanceOutput } from '@/ai/flows/explain-task-importance-flow';
import { analyzeWaitTime } from '@/ai/flows/analyze-wait-time-flow';
import type { AnalyzeWaitTimeInput } from '@/ai/schemas/service-alert-schemas';
import type { ServiceAlert } from '@/ai/schemas/service-alert-schemas';
import { continueOnboardingInterview } from '@/ai/flows/onboarding-interview-flow';
import { masterOnboardingParser } from '@/ai/flows/master-onboarding-parser-flow';
import { queryKnowledgeBase, type QueryKnowledgeBaseInput, type QueryKnowledgeBaseOutput } from '@/ai/flows/knowledge-rag-flow';
import { runMasterAgentDecision, type MasterAgentInput, type MasterAgentOutput } from '@/ai/flows/master-agent-decision-flow';
import type { OnboardingInterviewInput, OnboardingInterviewOutput, OnboardingParserInput, OnboardingParserOutput } from '@/ai/schemas/onboarding-schemas';
import { scanInvoice, type ScanInvoiceInput, type ScanInvoiceOutput } from '@/ai/flows/scan-invoice-flow';
import { generatePermitChecklist, type GeneratePermitChecklistInput, type GeneratePermitChecklistOutput } from '@/ai/flows/generate-permit-checklist-flow';
import { optimizeOrder } from '@/ai/flows/optimizeOrderFlow';
import type { OptimizeOrderInput, OptimizeOrderOutput } from '@/ai/schemas/ordering-schemas';
import { generateGhostShopperInvite, type GenerateGhostShopperInviteInput, type GenerateGhostShopperInviteOutput } from '@/ai/flows/generate-ghost-shopper-invite-flow';
import { generateBusinessReport, type GenerateBusinessReportOutput } from '@/ai/flows/generate-business-report-flow';
import type { GenerateBusinessReportInput } from '@/ai/schemas/business-report-schemas';
import { placeEmergencyOrder, type PlaceEmergencyOrderInput, type PlaceEmergencyOrderOutput } from '@/ai/flows/place-emergency-order-flow';
import { generateMarketingIdeas } from '@/ai/flows/suggest-menu-trends-flow';
import type { GenerateMarketingIdeasInput, GenerateMarketingIdeasOutput } from '@/ai/schemas/menu-trends-schemas';
import { BrandGuidelinesDataSchema, type BrandGuidelinesData } from '@/ai/schemas/brand-guidelines-schemas';
import { generateShiftSuggestions } from '@/ai/flows/generate-shift-suggestions-flow';
import type {
  GenerateShiftSuggestionsInput,
  GenerateShiftSuggestionsOutput,
} from '@/ai/schemas/shift-suggestion-schemas';
import { suggestManualChecks } from '@/ai/flows/suggest-manual-checks-flow';
import type { ManualCheckSuggestionOutput } from '@/ai/schemas/manual-check-schemas';
import { verifyTaskProof, type VerifyTaskProofInput, type VerifyTaskProofOutput } from '@/ai/flows/verify-task-proof-flow';
import { analyzeChatMessage, type AnalyzeChatInput, type AnalyzeChatOutput } from '@/ai/flows/analyze-chat-flow';
import { generatePrepList, type GeneratePrepListInput, type GeneratePrepListOutput } from '@/ai/flows/generate-prep-list-flow';
import { suggestOrder, type SuggestOrderInput, type SuggestOrderOutput } from '@/ai/flows/suggest-order-flow';


const db = getFirestore(app);

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

export async function optimizeOrderAction(input: OptimizeOrderInput): Promise<{ data: OptimizeOrderOutput | null; error: string | null; }> {
    return safeRun(optimizeOrder, input, 'optimizeOrder');
}

export async function placeEmergencyOrderAction(input: PlaceEmergencyOrderInput): Promise<{ data: PlaceEmergencyOrderOutput | null; error: string | null; }> {
    return safeRun(placeEmergencyOrder, input, 'placeEmergencyOrder');
}

export async function generateMarketingIdeasAction(input: GenerateMarketingIdeasInput): Promise<{ data: GenerateMarketingIdeasOutput | null; error: string | null; }> {
    return safeRun(generateMarketingIdeas, input, 'generateMarketingIdeas');
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

export async function verifyTaskProofAction(input: VerifyTaskProofInput): Promise<{ data: VerifyTaskProofOutput | null; error: string | null; }> {
    return safeRun(verifyTaskProof, input, 'verifyTaskProof');
}

export async function analyzeChatMessageAction(input: AnalyzeChatInput): Promise<{ data: AnalyzeChatOutput | null; error: string | null; }> {
    return safeRun(analyzeChatMessage, input, 'analyzeChatMessage');
}

export async function saveBrandGuidelinesAction(input: { data: BrandGuidelinesData, userId: string }): Promise<{ success: boolean; error: string | null }> {
    try {
        const { data, userId } = input;
        
        // Validate input with Zod
        const parsedData = BrandGuidelinesDataSchema.parse(data);

        const guidelines = {
            brandName: parsedData.brandName,
            owner: userId,
            address: parsedData.address,
            socials: parsedData.socials,
            rules: {
                visual: { color_primary: { name: 'Primary Brand Color', hex: parsedData.primaryColor } },
                verbal: {
                    voiceProfile: parsedData.brandVoice,
                    forbiddenWords: parsedData.forbiddenWords.split(',').map(word => word.trim().toLowerCase()).filter(Boolean),
                }
            }
        };

        const brandRef = doc(db, 'brandGuidelines', userId);
        await setDoc(brandRef, guidelines, { merge: true });

        return { success: true, error: null };
    } catch (e: any) {
        console.error("Error saving brand guidelines:", e);
        return { success: false, error: e.message || "An unknown error occurred." };
    }
}

export async function getBrandGuidelinesAction(userId: string): Promise<{ data: BrandGuidelinesData | null; error: string | null; }> {
    try {
        const brandRef = doc(db, 'brandGuidelines', userId);
        const docSnap = await getDoc(brandRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            const flattenedData: BrandGuidelinesData = {
                brandName: data.brandName || '',
                primaryColor: data.rules?.visual?.color_primary?.hex || '#D9534F',
                brandVoice: data.rules?.verbal?.voiceProfile || '',
                forbiddenWords: data.rules?.verbal?.forbiddenWords?.join(', ') || '',
                address: data.address || '',
                socials: data.socials || { facebookConnected: false, instagramConnected: false },
            };
            return { data: flattenedData, error: null };
        } else {
            return { data: null, error: null }; // No guidelines found, not an error
        }
    } catch (e: any) {
         console.error("Error fetching brand guidelines:", e);
        return { data: null, error: e.message || "An unknown error occurred." };
    }
}

export async function saveFeatureFlagsAction(features: any): Promise<{success: boolean; error?: string}> {
    try {
        const docRef = doc(db, 'appConfig', 'features');
        await setDoc(docRef, features, { merge: true });
        return { success: true };
    } catch (error: any) {
        console.error("Error saving feature flags:", error);
        return { success: false, error: error.message };
    }
}

export async function generateShiftSuggestionsAction(
  input: GenerateShiftSuggestionsInput
): Promise<{ data: GenerateShiftSuggestionsOutput | null; error: string | null }> {
  return safeRun(generateShiftSuggestions, input, 'generateShiftSuggestions');
}

export async function suggestManualChecksAction(): Promise<{ data: ManualCheckSuggestionOutput | null; error: string | null; }> {
    return safeRun(() => suggestManualChecks(), {}, 'suggestManualChecks');
}

export async function submitManualCoolerCheckAction(input: { equipment: string, temperature: number, photoDataUrl: string, user: string }): Promise<{success: boolean; error?: string}> {
    try {
        console.log('Simulating manual temp check submission:', input);
        // In a real app, this would write to Firestore.
        // const docRef = await addDoc(collection(db, 'temp_logs'), { ...input, timestamp: serverTimestamp() });
        // console.log("Document written with ID: ", docRef.id);
        return { success: true };
    } catch (error: any) {
        console.error("Error submitting manual temp check:", error);
        return { success: false, error: error.message };
    }
}

export async function fetchLiveOperationsDataAction(): Promise<{
    data: { liveSales: number; openOrders: number; tempAlerts: number; avgPrepTime: number } | null;
    error: string | null;
}> {
    // This is a mock function. In a real app, it would aggregate data from various sources.
    try {
        const data = {
            liveSales: 2450.75 + Math.random() * 100,
            openOrders: Math.floor(Math.random() * 5) + 8,
            tempAlerts: Math.random() > 0.8 ? 1 : 0,
            avgPrepTime: 4.5 + Math.random() * 2,
        };
        return { data, error: null };
    } catch (error: any) {
        return { data: null, error: "Failed to fetch live operations data." };
    }
}

export async function exportScheduleToQuickBooksAction(input: { shifts: any[]; laborAnalysis: any }): Promise<{ success: boolean; error?: string }> {
    try {
        // In a real app, this would call the QuickBooks API.
        // Here we just log the data that would be sent.
        console.log("Exporting to QuickBooks (Simulated):", {
            payrollData: input.laborAnalysis,
            schedule: input.shifts.map(s => ({
                date: s.date,
                employee: s.assignedTo,
                startTime: s.startTime,
                endTime: s.endTime,
            })),
        });
        return { success: true };
    } catch (error: any) {
        console.error("QuickBooks export failed:", error);
        return { success: false, error: "Failed to export schedule to QuickBooks." };
    }
}

export async function submitFeedbackAction(input: { category: string; feedback: string; isAnonymous: boolean }): Promise<{ success: boolean; error?: string }> {
    try {
        // In a real app, this would write to a 'feedback' collection in Firestore.
        console.log("Feedback submitted (Simulated):", input);
        await addDoc(collection(db, 'feedback'), {
            ...input,
            submittedAt: serverTimestamp(),
            status: 'Received',
        });
        return { success: true };
    } catch (error: any) {
        console.error("Feedback submission failed:", error);
        return { success: false, error: "Your feedback could not be submitted." };
    }
}

export async function generatePrepListAction(input: GeneratePrepListInput): Promise<{ data: GeneratePrepListOutput | null; error: string | null; }> {
    return safeRun(generatePrepList, input, 'generatePrepList');
}

export async function suggestOrderAction(input: SuggestOrderInput): Promise<{ data: SuggestOrderOutput | null; error: string | null; }> {
    return safeRun(suggestOrder, input, 'suggestOrder');
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
