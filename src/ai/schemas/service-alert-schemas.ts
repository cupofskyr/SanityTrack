
import { z } from 'zod';

export const WaitTimeAnalysisSchema = z.object({
  isAlert: z.boolean().describe('True if a service alert should be triggered (line > 4 people OR wait > 3 min).'),
  customerCount: z.number().describe('The estimated number of customers waiting.'),
  estimatedWaitTimeMinutes: z.number().describe('The estimated wait time for the next customer in minutes.'),
  reason: z.string().describe('A brief, human-readable reason for the alert (e.g., "High customer volume").'),
});
export type WaitTimeAnalysisOutput = z.infer<typeof WaitTimeAnalysisSchema>;

export interface ServiceAlert {
  id: string; // Document ID from Firestore
  locationId: string;
  cameraLocation: string;
  triggeringImageUrl: string;
  aiAnalysis: {
    customerCount: number;
    estimatedWaitTimeMinutes: number;
    reason: string;
  };
  status: 'pending_owner_action' | 'pending_employee_action' | 'resolved' | 'dismissed';
  authorizedAction?: 'one_10_dollar_card' | 'three_5_dollar_cards';
  assignedEmployeeId?: string;
  generatedCode?: string;
  createdAt: number; // Using epoch time for simplicity
}
