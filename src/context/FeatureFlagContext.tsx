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

const defaultFeatures: Features = {
  executiveVitals: {
    isEnabled: true,
    displayName: "Executive Vitals",
    description: "Shows the main KPI cards at the top of the dashboard."
  },
  approvalsQueue: {
    isEnabled: true,
    displayName: "Action & Approval Queue",
    description: "Shows the main tabbed section for handling approvals, alerts, and marketing."
  },
  hiringApprovals: {
    isEnabled: true,
    displayName: "Hiring Approvals",
    description: "Allow managers to submit hiring requests for owner approval."
  },
  purchaseOrderApprovals: {
    isEnabled: true,
    displayName: "Purchase Order Approvals",
    description: "Allow managers to submit purchase orders for owner approval."
  },
  serviceAlerts: {
    isEnabled: true,
    displayName: "Service Alerts Widget",
    description: "Shows real-time service alerts (e.g., long wait times)."
  },
  inspectorMandates: {
    isEnabled: true,
    displayName: "Health Inspector Mandates",
    description: "Shows tasks assigned by health inspectors that require action."
  },
  aiMarketingStudio: {
    isEnabled: true,
    displayName: "AI Marketing Studio",
    description: "The master switch for the entire 'Marketing & Innovation' tab."
  },
  aiProactiveSuggestions: {
    isEnabled: true,
    displayName: "AI Proactive Suggestions",
    description: "AI automatically finds and suggests local marketing opportunities."
  },
  aiMenuInnovation: {
    isEnabled: true,
    displayName: "AI Menu Innovation Lab",
    description: "Brainstorm new menu items based on trends and sales data."
  },
  ghostShopperProgram: {
    isEnabled: true,
    displayName: "Ghost Shopper Program",
    description: "Invite and manage 'secret shoppers' to get guest feedback."
  },
  companyAnnouncements: {
    isEnabled: true,
    displayName: "Company Announcements",
    description: "Allows the owner to post company-wide video messages."
  },
  strategicCommand: {
    isEnabled: true,
    displayName: "Strategic Command Panel",
    description: "Shows the accordion section for high-level system configuration."
  },
  aiSentinel: {
    isEnabled: true,
    displayName: "AI Sentinel & Security",
    description: "Configure and view logs for the autonomous AI security agent."
  },
  teamManagement: {
    isEnabled: true,
    displayName: "Team & Locations",
    description: "Manage users, roles, and business locations."
  },
  systemAdministration: {
    isEnabled: true,
    displayName: "System Administration Links",
    description: "Links to billing, branding, and other admin pages."
  },
   emergencyInstacart: { 
    isEnabled: false, 
    displayName: "Emergency Ordering", 
    description: "Allows employees to place emergency orders via Instacart integration." 
  },
  shiftScheduling: { 
    isEnabled: true, 
    displayName: "Shift Scheduling", 
    description: "Full suite of tools for planning and publishing employee schedules." 
  },
  qualityControl: { 
    isEnabled: true, 
    displayName: "Quality Control Audits", 
    description: "AI-powered audits to compare dishes against golden standards." 
  },
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
    if (!user) {
        setLoading(false);
        setFeatures(defaultFeatures); // Fallback to defaults
        return;
    }
    
    setLoading(true);
    const docRef = doc(db, 'appConfig', 'features');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setFeatures({ ...defaultFeatures, ...docSnap.data() });
      } else {
        console.warn("Feature flags document does not exist. Using defaults.");
        setFeatures(defaultFeatures);
      }
      setLoading(false);
    }, (error) => {
        console.error("Error fetching feature flags:", error);
        setFeatures(defaultFeatures); // Fallback on error
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const isEnabled = (featureName: string): boolean => {
    if (loading) return false; // Prevent flicker while loading
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
