
"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UploadCloud, X, Camera } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';

type PhotoUploaderProps = {
  readOnly?: boolean;
  initialPreview?: { url: string; name: string };
};

export default function PhotoUploader({ readOnly = false, initialPreview }: PhotoUploaderProps) {
  const [preview, setPreview] = useState<string | null>(initialPreview?.url || null);
  const [fileName, setFileName] = useState<string | null>(initialPreview?.name || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (initialPreview) {
      setPreview(initialPreview.url);
      setFileName(initialPreview.name);
    }
  }, [initialPreview]);

  useEffect(() => {
    if (isCameraOpen) {
      const getCameraPermission = async () => {
        try {
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
             console.error('Camera API not supported in this browser.');
             setHasCameraPermission(false);
             toast({
                variant: 'destructive',
                title: 'Camera Not Supported',
                description: 'Your browser does not support camera access.',
             });
             return;
          }

          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
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
            description: 'Please enable camera permissions in your browser settings to use this feature.',
          });
        }
      };
  
      getCameraPermission();

      return () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
      }
    }
  }, [isCameraOpen, toast]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/png');
        setPreview(dataUrl);
        setFileName(`capture-${new Date().toISOString()}.png`);
        setIsCameraOpen(false);
      }
    }
  };

  if (readOnly && preview) {
    return (
      <div className="w-full">
        <div className="relative w-full h-96 rounded-lg overflow-hidden border">
          <Image src={preview} alt="Image preview" layout="fill" objectFit="contain" data-ai-hint="proof document"/>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        ref={fileInputRef}
        id="photo-upload"
        disabled={readOnly}
      />
      
      {!preview ? (
        <div className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg bg-muted p-4 space-y-3">
            <div className="flex flex-col items-center text-center">
                <UploadCloud className="w-10 h-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mt-2">
                    Upload an existing photo or take a new one.
                </p>
            </div>
            <div className='flex gap-2 w-full max-w-sm'>
                <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                    <UploadCloud className="mr-2 h-4 w-4"/>
                    Upload File
                </Button>
                 <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                            <Camera className="mr-2 h-4 w-4"/>
                            Take Photo
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Take Photo</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <video ref={videoRef} className="w-full aspect-video rounded-md bg-black" autoPlay muted playsInline />
                            <canvas ref={canvasRef} className="hidden" />
                            {hasCameraPermission === false && (
                                <Alert variant="destructive" className="mt-4">
                                  <AlertTitle>Camera Access Required</AlertTitle>
                                  <AlertDescription>
                                    Please allow camera access to use this feature. You may need to change permissions in your browser settings.
                                  </AlertDescription>
                                </Alert>
                            )}
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCapture} disabled={!hasCameraPermission}>Capture Photo</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
      ) : (
        <div className="relative w-full h-48 rounded-lg overflow-hidden border">
          <Image src={preview} alt="Image preview" layout="fill" objectFit="cover" />
          <div className="absolute top-2 right-2 flex items-center bg-black/50 p-1 rounded-md text-white text-xs">
            <span className="truncate max-w-[200px]">{fileName}</span>
            <Button
              variant="ghost"
              size="icon"
              className="ml-2 h-6 w-6 text-white hover:bg-white/20 hover:text-white flex-shrink-0"
              onClick={handleRemoveImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

    