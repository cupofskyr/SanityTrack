
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import { CalendarDays, Save, ThumbsUp } from "lucide-react";

type Shift = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  assignedTo?: string;
  status?: 'scheduled' | 'up-for-grabs';
};

const employeeName = "John Doe"; // Static for demo

export default function MySchedulePage() {
  const { toast } = useToast();
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
  const [preferences, setPreferences] = useState({
    morning: false,
    afternoon: false,
    evening: true,
  });
  const [myShifts, setMyShifts] = useState<Shift[]>([]);

  useEffect(() => {
    const publishedSchedule = localStorage.getItem('published-schedule');
    if (publishedSchedule) {
      const allShifts: Shift[] = JSON.parse(publishedSchedule);
      const employeeShifts = allShifts.filter(shift => shift.assignedTo === employeeName);
      setMyShifts(employeeShifts);
    }
  }, []);

  const handlePreferenceChange = (key: keyof typeof preferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };
  
  const handleSavePreferences = () => {
    // In a real app, this data would be saved to a database.
    console.log({ unavailableDates, preferences });
    toast({
      title: "Preferences Saved!",
      description: "Your manager has been notified of your updated availability and preferences.",
    });
  };

  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><CalendarDays /> My Upcoming Shifts</CardTitle>
            <CardDescription>This is your confirmed schedule. Please check back for updates.</CardDescription>
          </CardHeader>
          <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Shift Time</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {myShifts.length > 0 ? (
                        myShifts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(shift => (
                            <TableRow key={shift.id}>
                                <TableCell className="font-medium">{format(new Date(shift.date), 'EEEE, MMM dd')}</TableCell>
                                <TableCell>{shift.startTime} - {shift.endTime}</TableCell>
                                <TableCell>Confirmed</TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center">
                                You have no upcoming shifts.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Set Availability</CardTitle>
            <CardDescription>Select the dates you are unavailable to work.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="multiple"
              min={1}
              selected={unavailableDates}
              onSelect={(dates) => setUnavailableDates(dates || [])}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><ThumbsUp/> Set Preferences</CardTitle>
            <CardDescription>Let your manager know which shifts you prefer.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
                <Checkbox id="pref-morning" checked={preferences.morning} onCheckedChange={() => handlePreferenceChange('morning')} />
                <Label htmlFor="pref-morning">Morning Shifts (e.g., 8am - 4pm)</Label>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox id="pref-afternoon" checked={preferences.afternoon} onCheckedChange={() => handlePreferenceChange('afternoon')} />
                <Label htmlFor="pref-afternoon">Afternoon Shifts (e.g., 12pm - 8pm)</Label>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox id="pref-evening" checked={preferences.evening} onCheckedChange={() => handlePreferenceChange('evening')} />
                <Label htmlFor="pref-evening">Evening Shifts (e.g., 4pm - 12am)</Label>
            </div>
          </CardContent>
        </Card>
        
        <Button onClick={handleSavePreferences} className="w-full">
            <Save className="mr-2 h-4 w-4" />
            Save Availability & Preferences
        </Button>
      </div>
    </div>
  );
}
