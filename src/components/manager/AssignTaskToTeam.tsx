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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { UserPlus } from "lucide-react";
import { app } from "@/lib/firebase";
import { track } from "@vercel/analytics";
import axios from "axios";

interface Employee {
  id: string;
  name: string;
  phone?: string;
}

const mockEmployees: Employee[] = [
  { id: "emp_john_doe", name: "John Doe", phone: "+15555555555" },
  { id: "emp_jane_smith", name: "Jane Smith", phone: "+14444444444" },
  { id: "emp_sam_wilson", name: "Sam Wilson", phone: "+16666666666" },
];

interface AssignTaskToTeamProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  taskId: string;
  enableAI?: boolean;
  notifyViaSMS?: boolean;
}

export default function AssignTaskToTeam({
  isOpen,
  onOpenChange,
  taskId,
  enableAI = false,
  notifyViaSMS = false,
}: AssignTaskToTeamProps) {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const db = getFirestore(app);
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen) {
      setSelectedEmployee(null);
      return;
    }
    async function fetchEmployees() {
      try {
        const snapshot = await getDocs(collection(db, "employees"));
        const emps = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          phone: doc.data().phone,
        })) as Employee[];
        setEmployees(emps);
      } catch (err) {
        console.warn("Using mock employees due to fetch error:", err);
      }
    }
    fetchEmployees();
  }, [isOpen, db]);

  async function handleAssign() {
    if (!selectedEmployee) {
      toast({
        variant: "destructive",
        title: "Please select an employee to assign.",
      });
      return;
    }
    try {
      const taskRef = doc(db, "tasks", taskId);
      await updateDoc(taskRef, {
        assignedTo: selectedEmployee,
        status: "assigned",
      });

      const emp = employees.find((e) => e.id === selectedEmployee);

      toast({
        title: `Task assigned to ${emp?.name ?? "employee"}.`,
      });

      if (notifyViaSMS && emp?.phone) {
        await axios.post("/api/send-sms", {
          to: emp.phone,
          message: `You’ve been assigned a new task (ID: ${taskId}) on SanityTrack.`,
        });
      }

      track("task_assigned", { to: emp?.name });
      onOpenChange(false);
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Error assigning task",
        description: (e as Error).message,
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center gap-2">
            <UserPlus /> Assign Task to Team Member
          </DialogTitle>
          <DialogDescription>
            Select an employee to assign this task to. They will be notified.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="grid gap-2">
            <Label htmlFor="employee-select">Employee</Label>
            <Select
              value={selectedEmployee ?? ""}
              onValueChange={setSelectedEmployee}
            >
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={!selectedEmployee}>
            Assign Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
