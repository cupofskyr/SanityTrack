"use client";

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Save, Flag } from 'lucide-react';
import { saveFeatureFlagsAction } from '@/app/actions';

const db = getFirestore(app);

const defaultFeatures = {
  taskManagement: { isEnabled: true, displayName: "Task Management", description: "Core features for creating, assigning, and tracking tasks." },
  temperatureLogs: { isEnabled: true, displayName: "Temperature Logs", description: "Allows for logging and monitoring of temperature-sensitive equipment." },
  aiMarketingStudio: { isEnabled: true, displayName: "AI Marketing Studio", description: "Enables AI-powered generation of marketing content and ideas." },
  emergencyInstacart: { isEnabled: false, displayName: "Emergency Ordering", description: "Allows employees to place emergency orders via Instacart integration." },
  shiftScheduling: { isEnabled: true, displayName: "Shift Scheduling", description: "Full suite of tools for planning and publishing employee schedules." },
  qualityControl: { isEnabled: true, displayName: "Quality Control Audits", description: "AI-powered audits to compare dishes against golden standards." },
};

type Features = typeof defaultFeatures;

export default function FeatureManagementPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [features, setFeatures] = useState<Features | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      const docRef = doc(db, 'appConfig', 'features');
      getDoc(docRef).then(docSnap => {
        if (docSnap.exists()) {
          // Merge with defaults to ensure new flags are present
          setFeatures({ ...defaultFeatures, ...docSnap.data() });
        } else {
          // If doc doesn't exist, set initial state from defaults
          setFeatures(defaultFeatures);
        }
        setLoading(false);
      }).catch(error => {
        console.error("Error fetching feature flags:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load feature flags.' });
        setLoading(false);
      });
    }
  }, [user, toast]);

  const handleToggle = (featureName: keyof Features) => {
    if (features) {
      setFeatures(prev => ({
        ...prev!,
        [featureName]: {
          ...prev![featureName],
          isEnabled: !prev![featureName].isEnabled,
        },
      }));
    }
  };

  const handleSaveChanges = async () => {
    if (!features) return;
    setIsSaving(true);
    const result = await saveFeatureFlagsAction(features);
    if (result.success) {
      toast({ title: 'Success!', description: 'Feature flags have been updated successfully.' });
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setIsSaving(false);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/5" />
          <Skeleton className="h-4 w-4/5" />
        </CardHeader>
        <CardContent className="space-y-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 rounded-lg border p-4">
              <div className="flex-1 space-y-1">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-4/5" />
              </div>
              <Skeleton className="h-6 w-11 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
            <Flag /> Feature Flags
        </CardTitle>
        <CardDescription>
          Enable or disable major application features in real-time. Changes will be reflected for all users instantly.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {features && Object.entries(features).map(([key, feature]) => (
          <div key={key} className="flex items-center space-x-4 rounded-lg border p-4">
            <div className="flex-1 space-y-1">
              <Label htmlFor={`feature-${key}`} className="text-base font-medium leading-none">
                {feature.displayName}
              </Label>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
            <Switch
              id={`feature-${key}`}
              checked={feature.isEnabled}
              onCheckedChange={() => handleToggle(key as keyof Features)}
            />
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
            Save Changes
        </Button>
      </CardFooter>
    </Card>
  );
}
