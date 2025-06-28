import { z } from 'zod';

export const EmployeeSchema = z.object({
  name: z.string().describe('The name of the employee.'),
  unavailableDates: z.array(z.string()).describe('A list of dates the employee cannot work, in YYYY-MM-DD format.'),
  hourlyRate: z.number().describe("The employee's hourly wage for cost calculation."),
  role: z.string().describe("The employee's job title, e.g., 'Line Cook', 'Server'.").optional(),
  transactionsPerHour: z.number().describe("The number of transactions this employee can handle per hour."),
});

export const ShiftSchema = z.object({
  id: z.string().describe('A unique identifier for the shift.'),
  date: z.string().describe('The date of the shift in YYYY-MM-DD format.'),
  startTime: z.string().describe('The start time of the shift (e.g., 09:00).'),
  endTime: z.string().describe('The end time of the shift (e.g., 17:00).'),
});

export const GenerateScheduleInputSchema = z.object({
  employees: z.array(EmployeeSchema).describe('The list of employees, their roles, unavailability, hourly rates, and productivity.'),
  shifts: z.array(ShiftSchema).describe('The list of open shifts to be scheduled.'),
  posData: z.string().describe("A JSON string representing simulated hourly transaction data for a typical week."),
});
export type GenerateScheduleInput = z.infer<typeof GenerateScheduleInputSchema>;

export const AssignmentSchema = z.object({
  shiftId: z.string().describe("The ID of the shift."),
  employeeName: z.string().describe("The name of the employee assigned to the shift."),
});

export const GenerateScheduleOutputSchema = z.object({
  assignments: z.array(AssignmentSchema).describe('The list of shift assignments.'),
  reasoning: z.string().describe('A brief explanation of how the schedule was generated, including identified peak and dead zones.'),
  unassignedShifts: z.array(z.string()).describe('A list of shift IDs that could not be assigned.'),
});
export type GenerateScheduleOutput = z.infer<typeof GenerateScheduleOutputSchema>;
