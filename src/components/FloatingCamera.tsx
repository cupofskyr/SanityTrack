
"use client";

import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Camera as CameraIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function FloatingCamera() {
  const [isOpen, setIsOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const { toast } = useToast();

  // This effect handles camera logic ONLY when the modal is open.
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isOpen) {
      const getCameraPermission = async () => {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions to use this feature.',
          });
        }
      };
      getCameraPermission();
    }
    // Cleanup function to stop the camera when the modal closes or component unmounts.
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    }
  }, [isOpen, toast]);

  const handleCapture = () => {
    // In a real app, this would capture a frame and probably send it somewhere.
    // For this demo, we'll just show a toast.
    toast({ title: 'Photo Captured!', description: 'The image would now be sent for processing.' });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 h-16 w-16 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 z-50"
          aria-label="Open Camera"
        >
          <CameraIcon className="h-8 w-8" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Camera View</DialogTitle>
          <DialogDescription>Point your camera at the subject and capture a photo.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <video ref={videoRef} className="w-full aspect-video rounded-md bg-black" autoPlay muted playsInline />
          {hasCameraPermission === false && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Camera Access Required</AlertTitle>
              <AlertDescription>
                Please allow camera access in your browser settings.
              </AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
          <Button type="button" onClick={() => setIsOpen(false)} variant="secondary">Cancel</Button>
          <Button type="button" onClick={handleCapture} disabled={!hasCameraPermission}>
            <CameraIcon className="mr-2 h-4 w-4" /> Capture
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
    