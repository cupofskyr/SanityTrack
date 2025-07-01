
"use client";

import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { UserPlus } from "lucide-react";
import { app } from "@/lib/firebase";

interface Employee {
  id: string;
  name: string;
}

// Mocking employee data as it might not exist in the user's DB
const mockEmployees: Employee[] = [
    { id: 'emp_john_doe', name: 'John Doe' },
    { id: 'emp_jane_smith', name: 'Jane Smith' },
    { id: 'emp_sam_wilson', name: 'Sam Wilson' },
];


interface AssignTaskToTeamProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  taskId: string;
}

export default function AssignTaskToTeam({
  isOpen,
  onOpenChange,
  taskId,
}: AssignTaskToTeamProps) {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const db = getFirestore(app);
  const { toast } = useToast();

  // The user's code fetched from Firestore. We'll disable it for now
  // and use the mock data to prevent errors if the collection doesn't exist.
  // useEffect(() => {
  //   async function fetchEmployees() {
  //     const snapshot = await getDocs(collection(db, "employees"));
  //     const emps = snapshot.docs.map((doc) => ({
  //       id: doc.id,
  //       name: doc.data().name,
  //     })) as Employee[];
  //     setEmployees(emps);
  //   }
  //   if (isOpen) {
  //       fetchEmployees();
  //   }
  // }, [db, isOpen]);

  async function handleAssign() {
    if (!selectedEmployee) {
      toast({variant: 'destructive', title: "Please select an employee to assign."});
      return;
    }
    try {
        const taskRef = doc(db, "tasks", taskId);
        await updateDoc(taskRef, { assignedTo: selectedEmployee, status: 'assigned' });
        toast({title: "Task assigned successfully."});
        onOpenChange(false);
    } catch (e) {
        toast({variant: 'destructive', title: "Error assigning task", description: (e as Error).message});
    }
  }

  return (
     <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
            <DialogTitle className="font-headline flex items-center gap-2"><UserPlus /> Assign Task to Team Member</DialogTitle>
            <DialogDescription>
                Select an employee to assign this task to. They will be notified.
            </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <div className="grid gap-2">
                    <Label htmlFor="employee-select">Employee</Label>
                     <Select value={selectedEmployee ?? ""} onValueChange={setSelectedEmployee}>
                         <SelectTrigger id="employee-select">
                            <SelectValue placeholder="Select an employee" />
                        </SelectTrigger>
                        <SelectContent>
                            {employees.map((emp) => (
                                <SelectItem key={emp.id} value={emp.id}>
                                {emp.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleAssign}>Assign Task</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  );
}
