// src/context/FeatureFlagContext.tsx
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { getFirestore } from 'firebase/firestore';
import { useAuth } from './AuthContext';

type Feature = {
    isEnabled: boolean;
    displayName: string;
    description: string;
};

type Features = {
    [key: string]: Feature;
};

interface FeatureFlagContextType {
  features: Features;
  loading: boolean;
  isEnabled: (featureName: string) => boolean;
}

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);

const db = getFirestore(app);

export const FeatureFlagProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [features, setFeatures] = useState<Features>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only subscribe if the user is authenticated, to avoid permission errors.
    if (!user) {
        setLoading(false);
        setFeatures({});
        return;
    }
    
    setLoading(true);
    const docRef = doc(db, 'appConfig', 'features');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setFeatures(docSnap.data() as Features);
      } else {
        // In a real app, an owner visiting the admin page would create this.
        console.warn("Feature flags document does not exist.");
        setFeatures({});
      }
      setLoading(false);
    }, (error) => {
        console.error("Error fetching feature flags:", error);
        setLoading(false);
        setFeatures({});
    });

    return () => unsubscribe();
  }, [user]);

  const isEnabled = (featureName: string): boolean => {
    return features[featureName]?.isEnabled === true;
  }

  const value = { features, loading, isEnabled };

  return <FeatureFlagContext.Provider value={value}>{children}</FeatureFlagContext.Provider>;
};

export const useFeatureFlags = (): FeatureFlagContextType => {
  const context = useContext(FeatureFlagContext);
  if (context === undefined) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagProvider');
  }
  return context;
};
