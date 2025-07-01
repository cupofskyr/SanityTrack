
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Award, CheckCircle, Star } from "lucide-react";

type ShiftRecapDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    completedTasks: number;
    xpEarned: number;
};

export default function ShiftRecapDialog({ open, onOpenChange, completedTasks, xpEarned }: ShiftRecapDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="font-headline text-2xl text-center">Great Shift!</DialogTitle>
                    <DialogDescription className="text-center">Here's a summary of your accomplishments.</DialogDescription>
                </DialogHeader>
                <div className="py-6 space-y-4">
                    <div className="flex justify-around text-center">
                        <div>
                            <p className="text-3xl font-bold">{completedTasks}</p>
                            <p className="text-sm text-muted-foreground">Tasks Completed</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-primary">+{xpEarned}</p>
                            <p className="text-sm text-muted-foreground">XP Earned</p>
                        </div>
                    </div>
                    <div className="text-center pt-4">
                        <h4 className="font-semibold mb-2">Highlights</h4>
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <p className="flex items-center justify-center gap-2"><Star className="h-4 w-4 text-yellow-400" /> Received a 5-star guest mention.</p>
                            <p className="flex items-center justify-center gap-2"><Award className="h-4 w-4 text-amber-500" /> Earned the 'Speedster' badge.</p>
                            <p className="flex items-center justify-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Perfect attendance this week.</p>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)} className="w-full">
                        Awesome! See You Next Time
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
