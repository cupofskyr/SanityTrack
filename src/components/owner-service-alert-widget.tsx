
"use client";
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import type { ServiceAlert } from '@/ai/schemas/service-alert-schemas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { analyzeWaitTimeAction, authorizeRecoveryAction } from '@/app/actions';
import { AlertCircle, Camera, Loader2, Sparkles, X, Check } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

type OwnerServiceAlertWidgetProps = {
    locationId: string;
};

export default function OwnerServiceAlertWidget({ locationId }: OwnerServiceAlertWidgetProps) {
    const { toast } = useToast();
    const [alerts, setAlerts] = useState<ServiceAlert[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState<string | null>(null);

    // State for the camera dialog
    const [isCameraDialogOpen, setIsCameraDialogOpen] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Effect to simulate listening to Firestore for alerts
    useEffect(() => {
        const checkAlerts = () => {
            const storedAlerts = JSON.parse(localStorage.getItem('serviceAlerts') || '[]');
            setAlerts(storedAlerts.filter((a: ServiceAlert) => a.locationId === locationId));
        };
        checkAlerts();
        const interval = setInterval(checkAlerts, 2000); // poll for updates
        return () => clearInterval(interval);
    }, [locationId]);
    
    // Effect to handle camera permissions when dialog opens
    useEffect(() => {
        let stream: MediaStream | null = null;
        if (isCameraDialogOpen && !capturedImage) {
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
            return () => {
                stream?.getTracks().forEach(track => track.stop());
            }
        }
    }, [isCameraDialogOpen, capturedImage, toast]);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            setCapturedImage(canvas.toDataURL('image/png'));
        }
    };

    const resetCameraDialog = () => {
        setIsCameraDialogOpen(false);
        setCapturedImage(null);
        setHasCameraPermission(null);
    }

    const handleAnalyze = async () => {
        if (!capturedImage) return;
        setIsAnalyzing(true);
        
        try {
            const result = await analyzeWaitTimeAction({ imageUrl: capturedImage });
            if (result.error || !result.data) {
                throw new Error(result.error || "AI analysis failed.");
            }
            if (result.data.isAlert) {
                const newAlert: ServiceAlert = {
                    id: `alert-${Date.now()}`,
                    locationId,
                    cameraLocation: 'Front Counter',
                    triggeringImageUrl: capturedImage,
                    aiAnalysis: result.data,
                    status: 'pending_owner_action',
                    createdAt: Date.now(),
                };
                const currentAlerts: ServiceAlert[] = JSON.parse(localStorage.getItem('serviceAlerts') || '[]');
                localStorage.setItem('serviceAlerts', JSON.stringify([newAlert, ...currentAlerts]));
                setAlerts(prev => [newAlert, ...prev]);
                toast({
                    variant: 'destructive',
                    title: '🚨 New Service Alert!',
                    description: `AI detected an issue at the Front Counter. Action required.`
                });
            } else {
                toast({
                    title: 'All Clear!',
                    description: 'AI analysis found no issues with wait times.',
                });
            }
        } catch (e: any) {
            toast({ variant: 'destructive', title: 'Analysis Failed', description: e.message });
        } finally {
            setIsAnalyzing(false);
            resetCameraDialog();
        }
    };

    const handleAuthorization = async (alertId: string, action: 'one_10_dollar_card' | 'dismiss') => {
        setIsSubmitting(alertId);
        try {
            const response = await authorizeRecoveryAction({ alertId, action });
            if (response.success) {
                const allAlerts: ServiceAlert[] = JSON.parse(localStorage.getItem('serviceAlerts') || '[]');
                let updatedAlerts: ServiceAlert[];
                if (action === 'dismiss') {
                    updatedAlerts = allAlerts.map(a => a.id === alertId ? { ...a, status: 'dismissed' } : a);
                } else {
                    updatedAlerts = allAlerts.map(a => a.id === alertId ? { ...a, status: 'pending_employee_action', generatedCode: response.code, assignedEmployeeId: "John Doe" } : a);
                }
                localStorage.setItem('serviceAlerts', JSON.stringify(updatedAlerts));
                setAlerts(prev => prev.filter(a => a.id !== alertId));
                toast({ title: 'Action Submitted', description: `The alert has been ${action === 'dismiss' ? 'dismissed' : 'sent to an employee'}.` });
            }
        } catch (e: any) {
            toast({ variant: 'destructive', title: 'Action Failed', description: 'Could not submit the action.' });
        } finally {
            setIsSubmitting(null);
        }
    };

    const pendingAlerts = alerts.filter(a => a.status === 'pending_owner_action');

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Camera /> Real-Time Service Recovery
                </CardTitle>
                <CardDescription>
                    Use the camera to check for long wait times. If an issue is detected, an alert will appear below for your approval.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <Dialog open={isCameraDialogOpen} onOpenChange={resetCameraDialog}>
                    <DialogTrigger asChild>
                        <Button className='w-full md:w-auto'>
                            <Camera className="mr-2 h-4 w-4" />
                            Scan Front Counter Camera
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Live Camera Feed</DialogTitle>
                            <DialogDescription>Capture a photo of the front counter to analyze wait times.</DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <canvas ref={canvasRef} className="hidden" />
                            {capturedImage ? (
                                <div className="relative w-full aspect-video rounded-md overflow-hidden">
                                    <Image src={capturedImage} alt="Captured from camera" layout="fill" objectFit="cover" data-ai-hint="security camera" />
                                </div>
                            ) : (
                                <video ref={videoRef} className="w-full aspect-video rounded-md bg-black" autoPlay muted playsInline />
                            )}
                             {hasCameraPermission === false && (
                                <Alert variant="destructive">
                                  <AlertTitle>Camera Access Required</AlertTitle>
                                  <AlertDescription>
                                    Please allow camera access in your browser settings.
                                  </AlertDescription>
                                </Alert>
                            )}
                        </div>
                        <DialogFooter className="gap-2 sm:justify-between">
                             {!capturedImage ? (
                                <Button onClick={handleCapture} disabled={!hasCameraPermission}>
                                    <Camera className="mr-2 h-4 w-4" /> Capture Photo
                                </Button>
                             ) : (
                                <>
                                 <Button variant="outline" onClick={() => setCapturedImage(null)}>Retake Photo</Button>
                                 <Button onClick={handleAnalyze} disabled={isAnalyzing}>
                                     {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                     Analyze for Wait Times
                                 </Button>
                                </>
                             )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <div className="mt-6 space-y-4">
                    {pendingAlerts.length === 0 ? (
                        <div className="text-center text-sm text-muted-foreground p-4 border-dashed border-2 rounded-md">
                            No pending service alerts for {locationId}.
                        </div>
                    ) : (
                        pendingAlerts.map(alert => (
                           <Alert key={alert.id} variant="destructive">
                               <AlertCircle className="h-4 w-4" />
                               <AlertTitle className='font-bold'>High Priority Service Alert at {alert.cameraLocation}</AlertTitle>
                               <AlertDescription>
                                   <div className="grid md:grid-cols-2 gap-4 mt-2 items-start">
                                       <div>
                                            <p><strong>AI Report:</strong> {alert.aiAnalysis.reason}</p>
                                            <p><strong>Customers Waiting:</strong> {alert.aiAnalysis.customerCount}</p>
                                            <p><strong>Est. Wait Time:</strong> {alert.aiAnalysis.estimatedWaitTimeMinutes} mins</p>
                                       </div>
                                       <div className="relative w-full aspect-video rounded-md overflow-hidden">
                                           <Image src={alert.triggeringImageUrl} alt="Alert snapshot" layout="fill" objectFit="cover" data-ai-hint="security camera" />
                                       </div>
                                   </div>
                                    <div className="flex gap-2 mt-4">
                                        <Button size="sm" onClick={() => handleAuthorization(alert.id, 'one_10_dollar_card')} disabled={isSubmitting === alert.id}>
                                            {isSubmitting === alert.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            <Check className="mr-2 h-4 w-4" /> Authorize $10 Gift Card
                                        </Button>
                                         <Button size="sm" variant="secondary" onClick={() => handleAuthorization(alert.id, 'dismiss')} disabled={isSubmitting === alert.id}>
                                            <X className="mr-2 h-4 w-4" /> Dismiss Alert
                                        </Button>
                                   </div>
                               </AlertDescription>
                           </Alert>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
