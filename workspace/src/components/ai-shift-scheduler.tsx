
"use client";

import { useState, useEffect, useMemo } from "react";
import { format, eachDayOfInterval, getDay } from "date-fns";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, List, UserCheck, Trash2, CalendarIcon, AlertCircle, CheckCircle, Send, Pencil, DollarSign, Info, Sparkles, PlusCircle, Hand } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { generateScheduleAction, generateShiftSuggestionsAction } from "@/app/actions";
import type { GenerateScheduleInput, GenerateScheduleOutput } from "@/ai/schemas/ai-shift-planner-schemas";
import type { ShiftSuggestion } from "@/ai/schemas/shift-suggestion-schemas";

type Shift = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  assignedTo?: string;
  status?: 'scheduled' | 'up-for-grabs';
};

type ShiftTemplate = {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
};

const employees = [
    { name: "John Doe", role: "Line Cook", hourlyRate: 20.00, unavailableDates: ["2024-07-25"], transactionsPerHour: 25 },
    { name: "Jane Smith", role: "Server", hourlyRate: 18.00, unavailableDates: ["2024-07-26", "2024-07-27"], transactionsPerHour: 15 },
    { name: "Sam Wilson", role: "Dishwasher", hourlyRate: 16.50, unavailableDates: [], transactionsPerHour: 10 },
    { name: "Alice Brown", role: "Shift Lead", hourlyRate: 22.00, unavailableDates: ["2024-07-22", "2024-07-29"], transactionsPerHour: 20 },
    { name: "Casey Lee", role: "Manager", hourlyRate: 25.00, unavailableDates: [], transactionsPerHour: 30 },
];

const mockPosData = {
    "monday":   { "9": 15, "10": 20, "11": 45, "12": 60, "13": 55, "14": 30, "15": 10, "16": 15, "17": 25 },
    "tuesday":  { "9": 18, "10": 22, "11": 48, "12": 65, "13": 60, "14": 35, "15": 12, "16": 18, "17": 28 },
    "wednesday":{ "9": 20, "10": 25, "11": 50, "12": 70, "13": 65, "14": 40, "15": 15, "16": 20, "17": 30 },
    "thursday": { "9": 22, "10": 28, "11": 55, "12": 75, "13": 70, "14": 45, "15": 18, "16": 22, "17": 35 },
    "friday":   { "9": 25, "10": 35, "11": 60, "12": 85, "13": 80, "14": 50, "15": 25, "16": 30, "17": 45 },
    "saturday": { "9": 30, "10": 40, "11": 70, "12": 90, "13": 85, "14": 60, "15": 30, "16": 35, "17": 50 },
    "sunday":   { "9": 28, "10": 38, "11": 65, "12": 80, "13": 75, "14": 55, "15": 28, "16": 32, "17": 48 },
};

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
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
};

export default function AIShiftScheduler() {
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
    const [shiftTemplates, setShiftTemplates] = useState<ShiftTemplate[]>([
        { id: 1, name: 'Opening Shift', startTime: '08:00', endTime: '16:00' },
        { id: 2, name: 'Closing Shift', startTime: '15:00', endTime: '23:00' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<GenerateScheduleOutput | null>(null);
    const [isPublished, setIsPublished] = useState(false);
    const { toast } = useToast();

    const [suggestedShifts, setSuggestedShifts] = useState<ShiftSuggestion[] | null>(null);
    const [isSuggesting, setIsSuggesting] = useState(false);

    useEffect(() => {
        // This effect simulates listening for real-time updates from localStorage
        const checkStorage = () => {
            const storedSchedule = localStorage.getItem('published-schedule');
            if (storedSchedule) {
                const parsedSchedule = JSON.parse(storedSchedule);
                setShifts(parsedSchedule);
                setIsPublished(true);
            }
        };

        checkStorage();
        window.addEventListener('storage', checkStorage);
        return () => window.removeEventListener('storage', checkStorage);
    }, []);

    useEffect(() => {
        if (!isPublished) {
            setIsPublished(false);
        }
    }, [shifts, isPublished]);
    
    const handleAddTemplate = () => {
        setShiftTemplates([
            ...shiftTemplates,
            { id: Date.now(), name: 'New Shift', startTime: '09:00', endTime: '17:00' }
        ]);
    };

    const handleRemoveTemplate = (id: number) => {
        setShiftTemplates(shiftTemplates.filter(t => t.id !== id));
    };

    const handleTemplateChange = (id: number, field: keyof ShiftTemplate, value: string) => {
        setShiftTemplates(shiftTemplates.map(t => t.id === id ? { ...t, [field]: value } : t));
    };

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
        if (shiftTemplates.length === 0) {
            toast({ variant: "destructive", title: "No Shift Templates", description: "Please define at least one shift template." });
            return;
        }

        const daysInInterval = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
        const newShifts: Shift[] = [];
        
        daysInInterval
            .filter(day => selectedDays.includes(getDay(day)))
            .forEach(day => {
                shiftTemplates.forEach(template => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    newShifts.push({
                        id: `shift-${dateStr}-${template.startTime}-${template.endTime}-${template.id}`,
                        date: dateStr,
                        startTime: template.startTime,
                        endTime: template.endTime,
                        status: 'scheduled' as const,
                    });
                });
            });
        
        const shiftMap = new Map<string, Shift>();
        shifts.forEach(s => shiftMap.set(s.id, s));
        newShifts.forEach(s => shiftMap.set(s.id, s));

        setShifts(Array.from(shiftMap.values()));
        setResult(null);

        toast({
            title: "Shifts Added",
            description: `Added ${newShifts.length} new shifts to the roster from your templates.`,
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

        if (isPublished) {
            localStorage.setItem('published-schedule', JSON.stringify(updatedShifts));
            toast({
                title: "Schedule Updated",
                description: "Your changes have been published to employees in real-time."
            });
        }
    };
    
    const handleClaimShift = (shiftId: string) => {
        const employeeName = "John Doe"; // In a real app, this would be the current user
         const updatedShifts = shifts.map(shift => 
            shift.id === shiftId ? { ...shift, assignedTo: employeeName, status: 'scheduled' as const } : shift
        );
        setShifts(updatedShifts);
        if (isPublished) {
             localStorage.setItem('published-schedule', JSON.stringify(updatedShifts));
        }
        toast({ title: "Shift Claimed!", description: `You have been assigned to the shift.` });
    }

    const handleSuggestShifts = async () => {
        setIsSuggesting(true);
        setSuggestedShifts(null);
        try {
            const result = await generateShiftSuggestionsAction({});
            if (result.error || !result.data) {
                throw new Error(result.error || "Failed to get suggestions.");
            }
            setSuggestedShifts(result.data.suggestions);
            toast({ title: "AI Suggestions Ready", description: "Click a suggestion to use its times." });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'AI Error', description: error.message });
        } finally {
            setIsSuggesting(false);
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
            posData: JSON.stringify(mockPosData, null, 2),
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
        setSuggestedShifts(null);
        localStorage.removeItem('published-schedule');
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
    
    const laborAnalysis = useMemo(() => {
        const weeklyHours: { [key: string]: number } = {};
        const employeesInOvertime = new Set<string>();

        shifts.forEach(shift => {
            if (shift.assignedTo) {
                if (!weeklyHours[shift.assignedTo]) {
                    weeklyHours[shift.assignedTo] = 0;
                }
                const start = new Date(`1970-01-01T${shift.startTime}:00`);
                const end = new Date(`1970-01-01T${shift.endTime}:00`);
                const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                weeklyHours[shift.assignedTo] += duration;
            }
        });

        let totalRegularHours = 0;
        let totalOvertimeHours = 0;
        let totalRegularCost = 0;
        let totalOvertimeCost = 0;

        for (const employeeName in weeklyHours) {
            const totalHours = weeklyHours[employeeName];
            const employee = employees.find(e => e.name === employeeName);
            if (!employee) continue;

            const regularHours = Math.min(totalHours, 40);
            const overtimeHours = Math.max(0, totalHours - 40);

            if (overtimeHours > 0) {
                employeesInOvertime.add(employeeName);
            }

            totalRegularHours += regularHours;
            totalOvertimeHours += overtimeHours;
            totalRegularCost += regularHours * employee.hourlyRate;
            totalOvertimeCost += overtimeHours * employee.hourlyRate * 1.5;
        }

        const totalCost = totalRegularCost + totalOvertimeCost;

        return {
            totalRegularHours,
            totalOvertimeHours,
            totalRegularCost,
            totalOvertimeCost,
            totalCost,
            employeesInOvertime,
        };
    }, [shifts]);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">1. Add Shifts to Roster</CardTitle>
                    <CardDescription>
                       First, define a date range and the days of the week to schedule. Then, create your daily shift templates. This is ideal for new locations with no sales data or when you need a specific staffing structure.
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
                        
                        <div className="pt-4 border-t space-y-4">
                            <h4 className="font-semibold text-sm">Define Daily Shift Templates</h4>
                             {shiftTemplates.map((template, index) => (
                                <div key={template.id} className="flex flex-col md:flex-row gap-4 items-end p-2 border rounded-md bg-muted/50">
                                    <div className="grid gap-2 flex-grow"><Label htmlFor={`name-${template.id}`}>Shift Name</Label><Input id={`name-${template.id}`} value={template.name} onChange={e => handleTemplateChange(template.id, 'name', e.target.value)} disabled={isPublished}/></div>
                                    <div className="grid gap-2"><Label htmlFor={`start-${template.id}`}>Start Time</Label><Input id={`start-${template.id}`} type="time" value={template.startTime} onChange={e => handleTemplateChange(template.id, 'startTime', e.target.value)} disabled={isPublished}/></div>
                                    <div className="grid gap-2"><Label htmlFor={`end-${template.id}`}>End Time</Label><Input id={`end-${template.id}`} type="time" value={template.endTime} onChange={e => handleTemplateChange(template.id, 'endTime', e.target.value)} disabled={isPublished}/></div>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveTemplate(template.id)} disabled={isPublished || shiftTemplates.length <= 1}><Trash2 className="h-4 w-4"/></Button>
                                </div>
                            ))}
                            <div className="flex gap-2">
                                <Button type="button" variant="outline" onClick={handleAddTemplate} disabled={isPublished}><PlusCircle className="mr-2 h-4 w-4"/>Add Another Shift Template</Button>
                                 <Button type="submit" className="w-full md:w-auto" disabled={isPublished}>Add All Templates to Roster</Button>
                            </div>
                        </div>

                    </form>
                </CardContent>
            </Card>
            
             <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Labor Law Compliance</AlertTitle>
                <AlertDescription>You are responsible for ensuring all schedules comply with your local labor laws regarding breaks and shift lengths. The AI's suggestions are for coverage and cost-optimization only.</AlertDescription>
            </Alert>


            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
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
                        <CardTitle className="text-lg flex items-center gap-2">
                            <DollarSign />
                            Projected Labor Summary
                        </CardTitle>
                        <CardDescription>An estimate of labor costs for the currently rostered shifts.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between"><span>Regular Hours:</span> <span>{laborAnalysis.totalRegularHours.toFixed(2)}</span></div>
                        <div className="flex justify-between font-semibold text-destructive"><span>Overtime Hours:</span> <span>{laborAnalysis.totalOvertimeHours.toFixed(2)}</span></div>
                        <div className="flex justify-between pt-2 border-t"><span>Regular Cost:</span> <span>${laborAnalysis.totalRegularCost.toFixed(2)}</span></div>
                        <div className="flex justify-between font-semibold text-destructive"><span>Overtime Cost (1.5x):</span> <span>${laborAnalysis.totalOvertimeCost.toFixed(2)}</span></div>
                        <div className="flex justify-between font-bold text-lg pt-2 border-t"><span>Total Cost:</span> <span>${laborAnalysis.totalCost.toFixed(2)}</span></div>
                    </CardContent>
                    <CardFooter>
                        <Alert variant="default" className="text-xs p-2">
                            <Info className="h-4 w-4" />
                            <AlertDescription>
                                Rates are managed by the owner on the Team & Payroll page.
                            </AlertDescription>
                        </Alert>
                    </CardFooter>
                </Card>
            </div>

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
                                This schedule has been published and is visible to employees. You can still manually re-assign shifts if needed.
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
                                <TableRow key={shift.id} className={cn(shift.assignedTo && laborAnalysis.employeesInOvertime.has(shift.assignedTo) && 'bg-destructive/10', shift.status === 'up-for-grabs' && 'bg-yellow-100 dark:bg-yellow-900/30')}>
                                    <TableCell>{format(parseDate(shift.date), 'PPP')}</TableCell>
                                    <TableCell>{shift.startTime} - {shift.endTime}</TableCell>
                                    <TableCell>
                                        {shift.status === 'up-for-grabs' ? (
                                            <div className="flex items-center gap-2">
                                                <Badge variant="destructive">UP FOR GRABS</Badge>
                                                <Button size="sm" onClick={() => handleClaimShift(shift.id)}>
                                                    <Hand className="mr-2 h-4 w-4"/>
                                                    Claim Shift
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Select
                                                    value={shift.assignedTo || 'unassign'}
                                                    onValueChange={(employeeName) => handleManualAssignment(shift.id, employeeName)}
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
                                            </div>
                                        )}
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
