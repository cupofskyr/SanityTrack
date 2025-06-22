"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, List, UserCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateSchedule, type GenerateScheduleInput, type GenerateScheduleOutput } from "@/ai/flows/ai-shift-planner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type Shift = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  assignedTo?: string;
};

// Mock data, in a real app this would come from a database.
const employees = [
    { name: "John Doe", unavailableDates: ["2024-07-25"] },
    { name: "Jane Smith", unavailableDates: ["2024-07-26", "2024-07-27"] },
    { name: "Sam Wilson", unavailableDates: [] },
];

const parseDate = (dateString: string) => {
    // This helper prevents timezone issues with new Date()
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
};

export default function AIShiftScheduler() {
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [newShift, setNewShift] = useState({ date: '', startTime: '09:00', endTime: '17:00' });
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<GenerateScheduleOutput | null>(null);
    const { toast } = useToast();

    const handleAddShift = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newShift.date || !newShift.startTime || !newShift.endTime) {
            toast({
                variant: "destructive",
                title: "Missing Information",
                description: "Please fill out all shift details.",
            });
            return;
        }
        const shiftToAdd: Shift = {
            id: `shift-${Date.now()}`,
            ...newShift
        };
        setShifts([...shifts, shiftToAdd]);
    };

    const handleGenerateSchedule = async () => {
        if (shifts.length === 0) {
             toast({
                variant: "destructive",
                title: "No Shifts",
                description: "Please add at least one shift before generating a schedule.",
            });
            return;
        }
        setIsLoading(true);
        setResult(null);

        const unassignedShifts = shifts.filter(s => !s.assignedTo);

        const input: GenerateScheduleInput = {
            employees,
            shifts: unassignedShifts.map(({ id, date, startTime, endTime }) => ({ id, date, startTime, endTime })),
        };

        try {
            const response = await generateSchedule(input);
            setResult(response);
            
            const updatedShifts = [...shifts];
            response.assignments.forEach(assignment => {
                const shiftIndex = updatedShifts.findIndex(s => s.id === assignment.shiftId);
                if (shiftIndex !== -1) {
                    updatedShifts[shiftIndex].assignedTo = assignment.employeeName;
                }
            });
            setShifts(updatedShifts);

            toast({
                title: "Schedule Generated",
                description: "The AI has assigned shifts to your employees.",
            });

        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "AI Error",
                description: "Failed to generate the schedule. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">1. Add Open Shifts</CardTitle>
                    <CardDescription>Define the shifts that need to be filled for the upcoming period.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAddShift} className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="grid gap-2 flex-1 w-full">
                            <Label htmlFor="shift-date">Date</Label>
                            <Input id="shift-date" type="date" value={newShift.date} onChange={e => setNewShift({...newShift, date: e.target.value})} required/>
                        </div>
                        <div className="grid gap-2 flex-1 w-full">
                            <Label htmlFor="start-time">Start Time</Label>
                            <Input id="start-time" type="time" value={newShift.startTime} onChange={e => setNewShift({...newShift, startTime: e.target.value})} required/>
                        </div>
                        <div className="grid gap-2 flex-1 w-full">
                            <Label htmlFor="end-time">End Time</Label>
                            <Input id="end-time" type="time" value={newShift.endTime} onChange={e => setNewShift({...newShift, endTime: e.target.value})} required/>
                        </div>
                        <Button type="submit">Add Shift</Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">2. Generate Schedule</CardTitle>
                    <CardDescription>Click the button to let AI automatically assign the open shifts based on employee availability.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleGenerateSchedule} disabled={isLoading || shifts.filter(s => !s.assignedTo).length === 0}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Generate AI Schedule
                    </Button>
                     {result && (
                        <Alert className="mt-4">
                            <UserCheck className="h-4 w-4" />
                            <AlertTitle>AI Scheduling Complete</AlertTitle>
                            <AlertDescription>{result.reasoning}</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                     <CardTitle className="font-headline flex items-center gap-2 text-lg"><List /> Shift Roster</CardTitle>
                    <CardDescription>Overview of all created shifts and their assignments.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>Assigned To</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {shifts.length > 0 ? shifts.sort((a,b) => a.date.localeCompare(b.date)).map(shift => (
                                <TableRow key={shift.id}>
                                    <TableCell>{format(parseDate(shift.date), 'PPP')}</TableCell>
                                    <TableCell>{shift.startTime} - {shift.endTime}</TableCell>
                                    <TableCell>{shift.assignedTo ? (
                                        <span className="font-medium">{shift.assignedTo}</span>
                                    ) : result?.unassignedShifts.includes(shift.id) ? (
                                        <span className="font-bold text-destructive">COULD NOT ASSIGN</span>
                                    ) : (
                                        <span className="text-muted-foreground">Unassigned</span>
                                    )}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24">No shifts created yet.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
