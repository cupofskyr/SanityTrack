"use client";

import { useState } from "react";
import { format, eachDayOfInterval, getDay } from "date-fns";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, List, UserCheck, Trash2, CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateSchedule, type GenerateScheduleInput, type GenerateScheduleOutput } from "@/ai/flows/ai-shift-planner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

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
    { name: "Alice Brown", unavailableDates: ["2024-07-22", "2024-07-29"] },
];

const weekDays = [
    { id: 'sunday', label: 'Sunday', value: 0 },
    { id: 'monday', label: 'Monday', value: 1 },
    { id: 'tuesday', label: 'Tuesday', value: 2 },
    { id: 'wednesday', label: 'Wednesday', value: 3 },
    { id: 'thursday', label: 'Thursday', value: 4 },
    { id: 'friday', label: 'Friday', value: 5 },
    { id: 'saturday', label: 'Saturday', value: 6 },
]

const parseDate = (dateString: string) => {
    // This helper prevents timezone issues with new Date()
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
};

export default function AIShiftScheduler() {
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
    const [shiftTime, setShiftTime] = useState({ startTime: '09:00', endTime: '17:00' });
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<GenerateScheduleOutput | null>(null);
    const { toast } = useToast();

    const handleCreateShifts = (e: React.FormEvent) => {
        e.preventDefault();
        if (!dateRange?.from || !dateRange?.to) {
            toast({ variant: "destructive", title: "Missing Date Range", description: "Please select a start and end date." });
            return;
        }
        if (selectedDays.length === 0) {
            toast({ variant: "destructive", title: "No Days Selected", description: "Please select at least one day of the week." });
            return;
        }

        const daysInInterval = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
        const newShifts = daysInInterval
            .filter(day => selectedDays.includes(getDay(day)))
            .map(day => {
                const dateStr = format(day, 'yyyy-MM-dd');
                return {
                    id: `shift-${dateStr}-${shiftTime.startTime}-${shiftTime.endTime}`,
                    date: dateStr,
                    startTime: shiftTime.startTime,
                    endTime: shiftTime.endTime,
                };
            });
        
        // Avoid duplicates by using a Map
        const shiftMap = new Map<string, Shift>();
        shifts.forEach(s => shiftMap.set(s.id, s));
        newShifts.forEach(s => shiftMap.set(s.id, s));

        setShifts(Array.from(shiftMap.values()));

        toast({
            title: "Shifts Created",
            description: `Added ${newShifts.length} new shifts to the roster.`,
        });
    };

    const handleDeleteShift = (shiftId: string) => {
        setShifts(shifts.filter(s => s.id !== shiftId));
    };

    const handleDayToggle = (dayValue: number) => {
        setSelectedDays(prev => 
            prev.includes(dayValue) ? prev.filter(d => d !== dayValue) : [...prev, dayValue]
        );
    };

    const handleGenerateSchedule = async () => {
        if (shifts.length === 0) {
             toast({ variant: "destructive", title: "No Shifts", description: "Please create shifts before generating a schedule." });
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

            toast({ title: "Schedule Generated", description: "The AI has assigned shifts to your employees." });

        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "AI Error", description: "Failed to generate the schedule. Please try again." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">1. Create Shifts in Bulk</CardTitle>
                    <CardDescription>Select a date range, shift times, and days of the week to quickly populate the shift roster.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCreateShifts} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                             <div className="grid gap-2">
                                <Label>Scheduling Period</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "justify-start text-left font-normal",
                                                !dateRange && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {dateRange?.from ? (
                                                dateRange.to ? (
                                                    <>
                                                        {format(dateRange.from, "LLL dd, y")} -{" "}
                                                        {format(dateRange.to, "LLL dd, y")}
                                                    </>
                                                ) : (
                                                    format(dateRange.from, "LLL dd, y")
                                                )
                                            ) : (
                                                <span>Pick a date range</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="range"
                                            defaultMonth={dateRange?.from}
                                            selected={dateRange}
                                            onSelect={setDateRange}
                                            numberOfMonths={2}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="grid gap-2">
                                <Label>Days of the Week</Label>
                                <div className="flex gap-4 items-center flex-wrap">
                                    {weekDays.map(day => (
                                        <div key={day.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={day.id}
                                                checked={selectedDays.includes(day.value)}
                                                onCheckedChange={() => handleDayToggle(day.value)}
                                            />
                                            <label
                                                htmlFor={day.id}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                {day.label}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="start-time">Start Time</Label>
                                <Input id="start-time" type="time" value={shiftTime.startTime} onChange={e => setShiftTime({...shiftTime, startTime: e.target.value})} required/>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="end-time">End Time</Label>
                                <Input id="end-time" type="time" value={shiftTime.endTime} onChange={e => setShiftTime({...shiftTime, endTime: e.target.value})} required/>
                            </div>
                             <div className="flex items-end">
                                <Button type="submit" className="w-full">Create Shifts</Button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">2. Generate Schedule</CardTitle>
                    <CardDescription>Click the button to let AI automatically assign the created shifts based on employee availability.</CardDescription>
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
                     <CardTitle className="font-headline flex items-center justify-between text-lg">
                        <div className="flex items-center gap-2">
                            <List /> Shift Roster
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setShifts([])} disabled={shifts.length === 0}>
                            Clear All
                        </Button>
                     </CardTitle>
                    <CardDescription>Overview of all created shifts and their assignments. You can manually delete shifts.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>Assigned To</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {shifts.length > 0 ? shifts.sort((a,b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)).map(shift => (
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
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteShift(shift.id)}>
                                            <Trash2 className="h-4 w-4" />
                                            <span className="sr-only">Delete shift</span>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24">No shifts created yet.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
