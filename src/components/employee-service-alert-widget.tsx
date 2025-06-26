
"use client";

import { useState, useEffect } from 'react';
import type { ServiceAlert } from '@/ai/schemas/service-alert-schemas';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle, Gift, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { resolveServiceAlertAction } from '@/app/actions';

const employeeName = "John Doe"; // Static name for demo

export default function EmployeeServiceAlertWidget() {
  const [alert, setAlert] = useState<ServiceAlert | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Effect to simulate listening for assigned alerts
  useEffect(() => {
    const checkAlerts = () => {
      const allAlerts: ServiceAlert[] = JSON.parse(localStorage.getItem('serviceAlerts') || '[]');
      const myAlert = allAlerts.find(a => a.status === 'pending_employee_action' && a.assignedEmployeeId === employeeName);
      setAlert(myAlert || null);
    };

    checkAlerts(); // Check on mount
    const interval = setInterval(checkAlerts, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, []);

  const handleResolve = async () => {
    if (!alert) return;
    setIsLoading(true);
    
    try {
        // In a real app, this would update Firestore. Here we update localStorage.
        const allAlerts: ServiceAlert[] = JSON.parse(localStorage.getItem('serviceAlerts') || '[]');
        const updatedAlerts = allAlerts.map(a => 
            a.id === alert.id ? { ...a, status: 'resolved' } : a
        );
        localStorage.setItem('serviceAlerts', JSON.stringify(updatedAlerts));
        
        // This simulates a call to the server to confirm resolution
        await resolveServiceAlertAction({ alertId: alert.id });

        toast({
            title: "Alert Resolved",
            description: "You've successfully resolved the service alert. Great job!",
        });
        setAlert(null);
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not resolve the alert. Please try again."
        })
    } finally {
        setIsLoading(false);
    }
  };

  if (!alert) {
    return null; // Don't show anything if there's no alert for this employee
  }

  return (
    <Card className="lg:col-span-2 bg-accent/10 border-accent text-accent animate-pulse-slow">
        <CardHeader>
            <CardTitle className='font-headline flex items-center gap-2'><Gift /> Service Recovery Action Required</CardTitle>
            <CardDescription className='text-accent/80'>The owner has authorized a gift card for a customer due to a long wait time. Please take the following action.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div>
                <p className="font-semibold text-sm">Customer Script:</p>
                <p className="italic text-sm">"We apologize for the wait. Thanks for your patience! Here’s a $10 gift card for your next visit."</p>
            </div>
             <div>
                <p className="font-semibold text-sm">Gift Card Code:</p>
                <p className="font-mono text-lg bg-accent/20 p-2 rounded-md inline-block">{alert.generatedCode}</p>
            </div>
        </CardContent>
        <CardFooter>
            <Button onClick={handleResolve} disabled={isLoading} className='bg-accent hover:bg-accent/90'>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                Mark as Resolved
            </Button>
        </CardFooter>
    </Card>
  );
}
