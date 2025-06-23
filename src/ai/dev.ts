import { config } from 'dotenv';
config();

import '@/ai/flows/ai-task-recommendation.ts';
import '@/ai/flows/analyze-issue-flow.ts';
import '@/ai/flows/ai-shift-planner.ts';
import '@/ai/flows/generate-tasks-from-inventory.ts';
import '@/ai/flows/generate-shopping-list-flow.ts';
import '@/ai/flows/fetch-reviews-flow.ts';
import '@/ai/flows/fetch-toast-data-flow.ts';
import '@/ai/flows/suggest-task-assignment-flow.ts';
import '@/ai/flows/process-inspection-report-flow.ts';
