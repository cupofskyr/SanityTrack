import { config } from 'dotenv';
config();

import '@/ai/flows/generate-daily-briefing-flow.ts';
import '@/ai/flows/analyze-issue-flow.ts';
import '@/ai/flows/ai-shift-planner.ts';
import '@/ai/flows/generate-tasks-from-inventory.ts';
import '@/ai/flows/generate-shopping-list-flow.ts';
import '@/ai/flows/fetch-reviews-flow.ts';
import '@/ai/flows/fetch-toast-data-flow.ts';
import '@/ai/flows/suggest-task-assignment-flow.ts';
import '@/ai/flows/process-inspection-report-flow.ts';
import '@/ai/flows/generate-inquiry-flow.ts';
import '@/ai/flows/analyze-photo-issue-flow.ts';
import '@/ai/flows/post-job-flow.ts';
import '@/ai/flows/translate-text-flow.ts';
import '@/ai/flows/generate-warning-letter-flow.ts';
