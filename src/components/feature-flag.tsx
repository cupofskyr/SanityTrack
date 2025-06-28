"use client";

import { useFeatureFlags } from '@/context/FeatureFlagContext';
import { ReactNode } from 'react';

type FeatureProps = {
    name: string;
    children: ReactNode;
};

const Feature = ({ name, children }: FeatureProps) => {
  const { isEnabled, loading } = useFeatureFlags();
  
  // Don't render anything while flags are loading to prevent UI flicker.
  if (loading) {
    return null;
  }

  return isEnabled(name) ? <>{children}</> : null;
};

export default Feature;
