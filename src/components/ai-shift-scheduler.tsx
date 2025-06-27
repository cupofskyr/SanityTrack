"use client";

import { useState, useEffect } from "react";
import { format, eachDayOfInterval, getDay } from "date-fns";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, List, UserCheck, Trash2, CalendarIcon, AlertCircle, CheckCircle, Send, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { generateScheduleAction } from "@/app/actions";
import type { GenerateScheduleInput, GenerateScheduleOutput } from "@/ai/flows/ai-shift-planner";

type Shift = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  assignedTo?: string;
  status?: 'scheduled' | 'offered';
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
    const [isPublished, setIsPublished] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        // Clear published state if shifts change
        setIsPublished(false);
    }, [shifts]);

    const handleAddShiftsToRoster = (e: React.FormEvent) => {
        e.preventDefault();
        if (isPublished) {
            toast({ variant: "destructive", title: "Schedule Published", description: "Clear the roster to create a new schedule." });
            return;
        }

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
                    status: 'scheduled' as const,
                };
            });
        
        const shiftMap = new Map<string, Shift>();
        shifts.forEach(s => shiftMap.set(s.id, s));
        newShifts.forEach(s => shiftMap.set(s.id, s));

        setShifts(Array.from(shiftMap.values()));
        setResult(null);

        toast({
            title: "Shifts Added",
            description: `Added ${newShifts.length} new shifts to the roster.`,
        });
    };

    const handleDeleteShift = (shiftId: string) => {
        if (isPublished) return;
        setShifts(shifts.filter(s => s.id !== shiftId));
    };

    const handleDayToggle = (dayValue: number) => {
        setSelectedDays(prev => 
            prev.includes(dayValue) ? prev.filter(d => d !== dayValue) : [...prev, dayValue]
        );
    };
    
    const handleManualAssignment = (shiftId: string, employeeName: string) => {
        const updatedShifts = shifts.map(shift => 
            shift.id === shiftId ? { ...shift, assignedTo: employeeName === 'unassign' ? undefined : employeeName, status: 'scheduled' as const } : shift
        );
        setShifts(updatedShifts);

        // If the schedule is already published, re-publish the changes.
        if (isPublished) {
            localStorage.setItem('published-schedule', JSON.stringify(updatedShifts));
            toast({
                title: "Schedule Updated",
                description: "Your changes have been published to employees in real-time."
            });
        }
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
            const response = await generateScheduleAction(input);
            
            if (response.error || !response.data) {
                toast({ variant: "destructive", title: "AI Error", description: response.error || "Failed to generate schedule." });
                return;
            }

            setResult(response.data);
            
            const updatedShifts = [...shifts];

            response.data.assignments.forEach(assignment => {
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
    
    const handleClearRoster = () => {
        setShifts([]);
        setResult(null);
        setIsPublished(false);
        localStorage.removeItem('published-schedule'); // Clear from employee view
        toast({
            title: "Roster Cleared",
            description: "All shifts have been removed from the roster.",
            variant: "secondary"
        });
    };

    const handlePublish = () => {
        setIsPublished(true);
        localStorage.setItem('published-schedule', JSON.stringify(shifts));
        toast({
            title: "Schedule Published!",
            description: "The schedule is now live and visible to all employees on their dashboards."
        });
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">1. Add Shifts to Roster</CardTitle>
                    <CardDescription>
                        Define a set of shifts (e.g., 'Morning Shift') and add them to the roster. You can repeat this to add multiple shift types (e.g., 'Evening Shift') for the same days.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAddShiftsToRoster} className="space-y-6">
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
                                            disabled={isPublished}
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
                                                disabled={isPublished}
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
                                <Input id="start-time" type="time" value={shiftTime.startTime} onChange={e => setShiftTime({...shiftTime, startTime: e.target.value})} required disabled={isPublished}/>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="end-time">End Time</Label>
                                <Input id="end-time" type="time" value={shiftTime.endTime} onChange={e => setShiftTime({...shiftTime, endTime: e.target.value})} required disabled={isPublished}/>
                            </div>
                             <div className="flex items-end">
                                <Button type="submit" className="w-full" disabled={isPublished}>Add Shifts to Roster</Button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">2. Generate & Refine Schedule</CardTitle>
                    <CardDescription>Use AI to generate a baseline schedule, then manually adjust assignments as needed before publishing.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="flex flex-wrap gap-2">
                        <Button onClick={handleGenerateSchedule} disabled={isLoading || shifts.length === 0 || isPublished}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Generate AI Schedule
                        </Button>
                        <Button onClick={handlePublish} disabled={shifts.length === 0 || isPublished} className="bg-accent hover:bg-accent/90">
                            <Send className="mr-2 h-4 w-4" />
                            {isPublished ? 'Schedule Published' : 'Publish Schedule'}
                        </Button>
                     </div>
                     {result && (
                        <Alert className="mt-4">
                            <UserCheck className="h-4 w-4" />
                            <AlertTitle>AI Scheduling Complete</AlertTitle>
                            <AlertDescription>
                                <p>{result.reasoning}</p>
                                {result.unassignedShifts && result.unassignedShifts.length > 0 && (
                                    <p className="mt-2 font-semibold">Could not assign {result.unassignedShifts.length} shift(s).</p>
                                )}
                            </AlertDescription>
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
                        {!isPublished ? (
                            <Button variant="outline" size="sm" onClick={handleClearRoster} disabled={shifts.length === 0}>
                                Clear Roster
                            </Button>
                        ) : (
                            <Button variant="outline" size="sm" onClick={handleClearRoster}>
                                <Pencil className="mr-2 h-4 w-4" /> Create New Schedule
                            </Button>
                        )}
                     </CardTitle>
                    <CardDescription>Overview of all created shifts and their assignments. Once published, the schedule is locked.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isPublished && (
                        <Alert variant="default" className="mb-4 bg-primary/10 border-primary text-primary [&>svg]:text-primary">
                            <CheckCircle className="h-4 w-4" />
                            <AlertTitle>Schedule is Live</AlertTitle>
                            <AlertDescription>
                                This schedule has been published and is visible to employees. To make changes, create a new schedule.
                            </AlertDescription>
                        </Alert>
                    )}
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead className="w-[250px]">Assigned To</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {shifts.length > 0 ? shifts.sort((a,b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)).map(shift => (
                                <TableRow key={shift.id}>
                                    <TableCell>{format(parseDate(shift.date), 'PPP')}</TableCell>
                                    <TableCell>{shift.startTime} - {shift.endTime}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Select
                                                value={shift.assignedTo || 'unassign'}
                                                onValueChange={(employeeName) => handleManualAssignment(shift.id, employeeName)}
                                                disabled={isPublished}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Assign Employee" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="unassign">
                                                        <span className="text-muted-foreground">Unassigned</span>
                                                    </SelectItem>
                                                    {employees.map(emp => (
                                                        <SelectItem key={emp.name} value={emp.name}>{emp.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {shift.status === 'offered' && (
                                                <Badge variant="secondary" className="bg-accent/80 whitespace-nowrap">Offered</Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteShift(shift.id)} disabled={isPublished}>
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
