
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, Bot, ListPlus, Send, Eye } from "lucide-react";

import ManagerTaskApprovalPanel from "./ManagerTaskApprovalPanel";
import AssignTaskToTeam from "./AssignTaskToTeam";
import TaskCreationModal from "./TaskCreationModal";
import { app } from "@/lib/firebase";

interface PhotoSubmission {
  id: string;
  imageUrl: string;
  message?: string;
  aiIntent?: string;
  aiConfidenceScore?: number;
  uploadedBy: string;
  createdAt: any;
  dismissed?: boolean;
}

export default function ManagerAIFloatReview() {
  const [photos, setPhotos] = useState<PhotoSubmission[]>([]);
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [taskCreationOpen, setTaskCreationOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoSubmission | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  
  const db = getFirestore(app);
  const { toast } = useToast();

  useEffect(() => {
    // This is a placeholder. In a real app, you would have robust security rules.
    const q = query(
      collection(db, "photos"),
      orderBy("createdAt", "desc"),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const aiFloatPhotos = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as PhotoSubmission))
        .filter((p) => p.photoType === 'AI_FLOAT' && !p.dismissed); // Correctly filter for AI_FLOAT

      setPhotos(aiFloatPhotos);
    }, (error) => {
      console.error("Error fetching photos: ", error);
      toast({variant: 'destructive', title: "Error", description: "Could not fetch AI submissions."})
    });

    return () => unsubscribe();
  }, [db, toast]);

  async function handleDismiss(photo: PhotoSubmission) {
    try {
      const docRef = doc(db, "photos", photo.id);
      await updateDoc(docRef, { dismissed: true });
      toast({variant: 'secondary', title: "Submission Dismissed"});
    } catch(e) {
      console.error("Error dismissing photo: ", e);
      toast({variant: 'destructive', title: "Error", description: "Could not dismiss the submission."})
    }
  }

  function openTaskCreation(photo: PhotoSubmission) {
    setSelectedPhoto(photo);
    setTaskCreationOpen(true);
  }

  function openAssignTask(taskId: string) {
    setSelectedTaskId(taskId);
    setAssignOpen(true);
  }

  return (
    <>
      <Card>
        <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
                <Bot className="text-primary"/>
                AI Float Photo Review
            </CardTitle>
            <CardDescription>
                Review photos and notes submitted by your team through the AI Camera. Create tasks or dismiss items as needed.
            </CardDescription>
        </CardHeader>
        <CardContent>
            {photos.length === 0 ? (
                <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                    <AlertCircle className="mx-auto h-12 w-12" />
                    <p className="mt-4 font-semibold">No AI submissions to review.</p>
                </div>
            ) : (
                <ScrollArea className="h-[500px] pr-4">
                    <ul className="space-y-4">
                    {photos.map((photo) => (
                      <li key={photo.id} className="flex flex-col sm:flex-row gap-4 border rounded-lg p-3 items-center">
                          <Image
                            src={photo.imageUrl}
                            alt="AI float submission"
                            width={96}
                            height={96}
                            className="w-24 h-24 object-cover rounded-md border"
                          />
                          <div className="flex-1">
                            <p className="font-semibold">{photo.message || "No message provided."}</p>
                            <p className="text-sm text-muted-foreground">
                              Intent: <Badge variant="secondary">{photo.aiIntent || "Unknown"}</Badge> | Confidence: <Badge variant="outline">{(photo.aiConfidenceScore ?? 0).toFixed(2)}</Badge>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Uploaded by: {photo.uploadedBy}
                            </p>
                          </div>
                          <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
                            <Button onClick={() => openTaskCreation(photo)} size="sm">
                                <ListPlus /> Create Task
                            </Button>
                            <Button onClick={() => handleDismiss(photo)} variant="outline" size="sm">Dismiss</Button>
                          </div>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
            )}
        </CardContent>
        <CardFooter>
            <Button onClick={() => setApprovalOpen(true)}>
                <Eye />
                Review AI Suggested Tasks
            </Button>
        </CardFooter>
      </Card>

      <TaskCreationModal
        isOpen={taskCreationOpen && !!selectedPhoto}
        onOpenChange={setTaskCreationOpen}
        photoId={selectedPhoto?.id || ''}
        initialTitle={selectedPhoto?.message || ""}
        imageUrl={selectedPhoto?.imageUrl}
      />

      <AssignTaskToTeam
        isOpen={assignOpen && !!selectedTaskId}
        onOpenChange={setAssignOpen}
        taskId={selectedTaskId || ''}
      />

      <ManagerTaskApprovalPanel 
        isOpen={approvalOpen}
        onOpenChange={setApprovalOpen}
        onAssign={openAssignTask} 
      />
    </>
  );
}
