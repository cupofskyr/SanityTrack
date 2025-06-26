
'use server';

// This file is the single, safe entry point for all AI calls from the client-side UI.

import { analyzeCamera, type CameraAnalysisInput, type CameraAnalysisOutput } from '@/ai/flows/cameraAnalysisFlow';
import { analyzeIssue as analyzeIssueFlow, type AnalyzeIssueInput, type AnalyzeIssueOutput } from '@/ai/flows/analyze-issue-flow';
import { analyzePhotoIssue as analyzePhotoIssueFlow, type AnalyzePhotoInput, type AnalyzePhotoOutput } from '@/ai/flows/analyze-photo-issue-flow';
import { generateDailyBriefing as generateDailyBriefingFlow, type GenerateDailyBriefingOutput } from '@/ai/flows/generate-daily-briefing-flow';
import { generateSchedule as generateScheduleFlow, type GenerateScheduleInput, type GenerateScheduleOutput } from '@/ai/flows/ai-shift-planner';
import { generateShoppingList as generateShoppingListFlow, type GenerateShoppingListInput, type GenerateShoppingListOutput } from '@/ai/flows/generate-shopping-list-flow';
import { generateTasksFromInventory as generateTasksFromInventoryFlow, type GenerateTasksFromInventoryInput, type GenerateTasksFromInventoryOutput } from '@/ai/flows/generate-tasks-from-inventory';
import { suggestTaskAssignment as suggestTaskAssignmentFlow, type SuggestTaskAssignmentInput, type SuggestTaskAssignmentOutput } from '@/ai/flows/suggest-task-assignment-flow';
import { translateText as translateTextFlow, type TranslateTextInput, type TranslateTextOutput } from '@/ai/flows/translate-text-flow';
import { generateInquiry as generateInquiryFlow, type GenerateInquiryInput, type GenerateInquiryOutput } from '@/ai/flows/generate-inquiry-flow';
import { processInspectionReport as processInspectionReportFlow, type ProcessInspectionReportInput, type ProcessInspectionReportOutput } from '@/ai/flows/process-inspection-report-flow';
import { generateWarningLetter as generateWarningLetterFlow, type GenerateWarningLetterInput, type GenerateWarningLetterOutput } from '@/ai/flows/generate-warning-letter-flow';
import { fetchToastData as fetchToastDataFlow, type FetchToastDataInput, type ToastPOSData } from '@/ai/flows/fetch-toast-data-flow';
import { summarizeReviews as summarizeReviewsFlow, type SummarizeReviewsInput, type SummarizeReviewsOutput } from '@/ai/flows/fetch-reviews-flow';
import { postJob as postJobFlow, type JobPostingInput, type JobPostingOutput } from '@/ai/flows/post-job-flow';


export async function analyzeCameraImageAction(input: CameraAnalysisInput): Promise<{ data: CameraAnalysisOutput | null; error: string | null; }> {
    try {
        const result = await analyzeCamera(input);
        return { data: result, error: null };
    } catch (error) {
        console.error("Error in analyzeCameraImageAction", error);
        return { data: null, error: 'Failed to analyze camera image.' };
    }
}

export async function analyzeIssue(input: AnalyzeIssueInput): Promise<{ data: AnalyzeIssueOutput | null; error: string | null; }> {
    try {
        const result = await analyzeIssueFlow(input);
        return { data: result, error: null };
    } catch (error) {
        console.error("Error in analyzeIssue", error);
        return { data: null, error: 'Failed to analyze issue.' };
    }
}

export async function analyzePhotoIssue(input: AnalyzePhotoInput): Promise<{ data: AnalyzePhotoOutput | null; error: string | null; }> {
    try {
        const result = await analyzePhotoIssueFlow(input);
        return { data: result, error: null };
    } catch (error) {
        console.error("Error in analyzePhotoIssue", error);
        return { data: null, error: 'Failed to analyze photo.' };
    }
}

export async function generateDailyBriefing(): Promise<{ data: GenerateDailyBriefingOutput | null; error: string | null; }> {
    try {
        const result = await generateDailyBriefingFlow();
        return { data: result, error: null };
    } catch (error) {
        console.error("Error in generateDailyBriefing", error);
        return { data: null, error: 'Failed to generate briefing.' };
    }
}

export async function generateSchedule(input: GenerateScheduleInput): Promise<{ data: GenerateScheduleOutput | null; error: string | null; }> {
    try {
        const result = await generateScheduleFlow(input);
        return { data: result, error: null };
    } catch (error) {
        console.error("Error in generateSchedule", error);
        return { data: null, error: 'Failed to generate schedule.' };
    }
}

export async function generateShoppingList(input: GenerateShoppingListInput): Promise<{ data: GenerateShoppingListOutput | null; error: string | null; }> {
    try {
        const result = await generateShoppingListFlow(input);
        return { data: result, error: null };
    } catch (error) {
        console.error("Error in generateShoppingList", error);
        return { data: null, error: 'Failed to generate shopping list.' };
    }
}

export async function generateTasksFromInventory(input: GenerateTasksFromInventoryInput): Promise<{ data: GenerateTasksFromInventoryOutput | null; error: string | null; }> {
    try {
        const result = await generateTasksFromInventoryFlow(input);
        return { data: result, error: null };
    } catch (error) {
        console.error("Error in generateTasksFromInventory", error);
        return { data: null, error: 'Failed to generate tasks.' };
    }
}

export async function suggestTaskAssignment(input: SuggestTaskAssignmentInput): Promise<{ data: SuggestTaskAssignmentOutput | null; error: string | null; }> {
    try {
        const result = await suggestTaskAssignmentFlow(input);
        return { data: result, error: null };
    } catch (error) {
        console.error("Error in suggestTaskAssignment", error);
        return { data: null, error: 'Failed to suggest task assignment.' };
    }
}

export async function translateText(input: TranslateTextInput): Promise<{ data: TranslateTextOutput | null; error: string | null; }> {
    try {
        const result = await translateTextFlow(input);
        return { data: result, error: null };
    } catch (error) {
        console.error("Error in translateText", error);
        return { data: null, error: 'Failed to translate text.' };
    }
}

export async function generateInquiry(input: GenerateInquiryInput): Promise<{ data: GenerateInquiryOutput | null; error: string | null; }> {
    try {
        const result = await generateInquiryFlow(input);
        return { data: result, error: null };
    } catch (error) {
        console.error("Error in generateInquiry", error);
        return { data: null, error: 'Failed to generate inquiry.' };
    }
}

export async function processInspectionReport(input: ProcessInspectionReportInput): Promise<{ data: ProcessInspectionReportOutput | null; error: string | null; }> {
    try {
        const result = await processInspectionReportFlow(input);
        return { data: result, error: null };
    } catch (error) {
        console.error("Error in processInspectionReport", error);
        return { data: null, error: 'Failed to process inspection report.' };
    }
}

export async function generateWarningLetter(input: GenerateWarningLetterInput): Promise<{ data: GenerateWarningLetterOutput | null; error: string | null; }> {
    try {
        const result = await generateWarningLetterFlow(input);
        return { data: result, error: null };
    } catch (error) {
        console.error("Error in generateWarningLetter", error);
        return { data: null, error: 'Failed to generate warning letter.' };
    }
}

export async function fetchToastData(input: FetchToastDataInput): Promise<{ data: ToastPOSData | null; error: string | null; }> {
    try {
        const result = await fetchToastDataFlow(input);
        return { data: result, error: null };
    } catch (error) {
        console.error("Error in fetchToastData", error);
        return { data: null, error: 'Failed to fetch Toast data.' };
    }
}

export async function summarizeReviews(input: SummarizeReviewsInput): Promise<{ data: SummarizeReviewsOutput | null; error: string | null; }> {
    try {
        const result = await summarizeReviewsFlow(input);
        return { data: result, error: null };
    } catch (error) {
        console.error("Error in summarizeReviews", error);
        return { data: null, error: 'Failed to summarize reviews.' };
    }
}

export async function postJob(input: JobPostingInput): Promise<{ data: JobPostingOutput | null; error: string | null; }> {
    try {
        const result = await postJobFlow(input);
        return { data: result, error: null };
    } catch (error) {
        console.error("Error in postJob", error);
        return { data: null, error: 'Failed to post job.' };
    }
}
