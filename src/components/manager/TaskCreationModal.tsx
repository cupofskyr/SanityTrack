
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, ListPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { app } from "@/lib/firebase";

interface TaskCreationModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  photoId: string;
  initialTitle?: string;
  initialDescription?: string;
  imageUrl?: string;
}

export default function TaskCreationModal({
  isOpen,
  onOpenChange,
  photoId,
  initialTitle = "",
  initialDescription = "",
  imageUrl,
}: TaskCreationModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [loading, setLoading] = useState(false);
  const db = getFirestore(app);
  const { toast } = useToast();

  useEffect(() => {
      setTitle(initialTitle);
      setDescription(initialDescription);
  }, [initialTitle, initialDescription]);

  async function handleSubmit() {
    if (!title.trim()) {
      toast({ variant: 'destructive', title: "Please enter a task title."});
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "tasks"), {
        title,
        description,
        status: "open",
        createdAt: serverTimestamp(),
        photoProofId: photoId,
        imageUrl, // Storing image URL for context in the task
        requiresPhotoProof: true, // New tasks from photos should require proof
      });
      toast({ title: "Task Created Successfully!"});
      onOpenChange(false);
    } catch (e) {
      toast({ variant: 'destructive', title: "Failed to create task", description: (e as Error).message});
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent>
            <DialogHeader>
            <DialogTitle className="font-headline flex items-center gap-2"><ListPlus /> Create Task</DialogTitle>
            <DialogDescription>
                Create a new task based on the submitted photo. It will be added to the master task list.
            </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                {imageUrl && (
                <div className="relative w-full h-48">
                    <Image
                        src={imageUrl}
                        alt="Reference for task"
                        layout="fill"
                        objectFit="cover"
                        className="rounded-md border"
                    />
                </div>
                )}
                <div className="grid gap-2">
                    <Label htmlFor="title">Task Title</Label>
                    <Input
                        id="title"
                        placeholder="e.g., 'Clean up spill in Aisle 3'"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={loading}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="description">Description (optional)</Label>
                    <Textarea
                        id="description"
                        placeholder="Add more details about the task..."
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={loading}
                    />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    Create Task
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  );
}
