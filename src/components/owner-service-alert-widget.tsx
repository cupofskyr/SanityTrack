
"use client";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { ServiceAlert, WaitTimeAnalysisOutput } from '@/ai/schemas/service-alert-schemas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { analyzeWaitTimeAction, authorizeRecoveryAction } from '@/app/actions';
import { AlertCircle, Camera, Loader2, Sparkles, X, Check } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

const camera = {
    id: 'cam-01',
    location: 'Front Counter',
    imageUrl: 'https://storage.googleapis.com/gen-ai-recipes/person-in-restaurant.jpg',
};

type OwnerServiceAlertWidgetProps = {
    locationId: string;
};

export default function OwnerServiceAlertWidget({ locationId }: OwnerServiceAlertWidgetProps) {
    const { toast } = useToast();
    const [alerts, setAlerts] = useState<ServiceAlert[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState<string | null>(null);

    // Effect to simulate listening to Firestore
    useEffect(() => {
        const checkAlerts = () => {
            const storedAlerts = JSON.parse(localStorage.getItem('serviceAlerts') || '[]');
            setAlerts(storedAlerts.filter((a: ServiceAlert) => a.locationId === locationId));
        };
        checkAlerts();
        const interval = setInterval(checkAlerts, 2000); // poll for updates
        return () => clearInterval(interval);
    }, [locationId]);

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        try {
            const result = await analyzeWaitTimeAction({ imageUrl: camera.imageUrl });
            if (result.error || !result.data) {
                throw new Error(result.error || "AI analysis failed.");
            }
            if (result.data.isAlert) {
                // Create a new alert and save to localStorage
                const newAlert: ServiceAlert = {
                    id: `alert-${Date.now()}`,
                    locationId,
                    cameraLocation: camera.location,
                    triggeringImageUrl: camera.imageUrl,
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
                    description: `AI detected an issue at ${camera.location}. Action required.`
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
        }
    };

    const handleAuthorization = async (alertId: string, action: 'one_10_dollar_card' | 'dismiss') => {
        setIsSubmitting(alertId);
        try {
            const response = await authorizeRecoveryAction({ alertId, action });
            if (response.success) {
                // Update local state to reflect the change from localStorage
                 const allAlerts: ServiceAlert[] = JSON.parse(localStorage.getItem('serviceAlerts') || '[]');
                 let updatedAlerts: ServiceAlert[];
                 if (action === 'dismiss') {
                     updatedAlerts = allAlerts.map(a => a.id === alertId ? { ...a, status: 'dismissed' } : a);
                 } else {
                      updatedAlerts = allAlerts.map(a => a.id === alertId ? { ...a, status: 'pending_employee_action', generatedCode: response.code, assignedEmployeeId: "John Doe" } : a);
                 }
                 localStorage.setItem('serviceAlerts', JSON.stringify(updatedAlerts));
                 setAlerts(prev => prev.filter(a => a.id !== alertId)); // Remove from owner's view
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
                    Manually trigger the AI camera to check for long wait times. If an issue is detected, an alert will appear below for your approval.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={handleAnalyze} disabled={isAnalyzing} className='w-full md:w-auto'>
                    {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Scan Front Counter Camera
                </Button>

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

