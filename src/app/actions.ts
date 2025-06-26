
'use server';

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

// Re-export types for client-side usage
export type {
    AnalyzeIssueInput, AnalyzeIssueOutput,
    AnalyzePhotoInput, AnalyzePhotoOutput,
    GenerateDailyBriefingOutput,
    GenerateScheduleInput, GenerateScheduleOutput,
    GenerateShoppingListInput, GenerateShoppingListOutput,
    GenerateTasksFromInventoryInput, GenerateTasksFromInventoryOutput,
    SuggestTaskAssignmentInput, SuggestTaskAssignmentOutput,
    TranslateTextInput, TranslateTextOutput,
    GenerateInquiryInput, GenerateInquiryOutput,
    ProcessInspectionReportInput, ProcessInspectionReportOutput,
    GenerateWarningLetterInput, GenerateWarningLetterOutput,
    FetchToastDataInput, ToastPOSData,
    SummarizeReviewsInput, SummarizeReviewsOutput,
    JobPostingInput, JobPostingOutput
};


export async function analyzeIssue(input: AnalyzeIssueInput): Promise<AnalyzeIssueOutput> {
    return analyzeIssueFlow(input);
}

export async function analyzePhotoIssue(input: AnalyzePhotoInput): Promise<AnalyzePhotoOutput> {
    return analyzePhotoIssueFlow(input);
}

export async function generateDailyBriefing(): Promise<GenerateDailyBriefingOutput> {
    return generateDailyBriefingFlow();
}

export async function generateSchedule(input: GenerateScheduleInput): Promise<GenerateScheduleOutput> {
    return generateScheduleFlow(input);
}

export async function generateShoppingList(input: GenerateShoppingListInput): Promise<GenerateShoppingListOutput> {
    return generateShoppingListFlow(input);
}

export async function generateTasksFromInventory(input: GenerateTasksFromInventoryInput): Promise<GenerateTasksFromInventoryOutput> {
    return generateTasksFromInventoryFlow(input);
}

export async function suggestTaskAssignment(input: SuggestTaskAssignmentInput): Promise<SuggestTaskAssignmentOutput> {
    return suggestTaskAssignmentFlow(input);
}

export async function translateText(input: TranslateTextInput): Promise<TranslateTextOutput> {
    return translateTextFlow(input);
}

export async function generateInquiry(input: GenerateInquiryInput): Promise<GenerateInquiryOutput> {
    return generateInquiryFlow(input);
}

export async function processInspectionReport(input: ProcessInspectionReportInput): Promise<ProcessInspectionReportOutput> {
    return processInspectionReportFlow(input);
}

export async function generateWarningLetter(input: GenerateWarningLetterInput): Promise<GenerateWarningLetterOutput> {
    return generateWarningLetterFlow(input);
}

export async function fetchToastData(input: FetchToastDataInput): Promise<ToastPOSData> {
    return fetchToastDataFlow(input);
}

export async function summarizeReviews(input: SummarizeReviewsInput): Promise<SummarizeReviewsOutput> {
    return summarizeReviewsFlow(input);
}

export async function postJob(input: JobPostingInput): Promise<JobPostingOutput> {
    return postJobFlow(input);
}
