import { config } from 'dotenv';
config();

import '@/ai/flows/ai-task-recommendation.ts';
import '@/ai/flows/analyze-issue-flow.ts';
import '@/ai/flows/ai-shift-planner.ts';
import '@/ai/flows/generate-tasks-from-inventory.ts';
