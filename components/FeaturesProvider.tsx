'use client';

import { createContext, useContext } from 'react';
import { type Features, ALL_ENABLED } from '@/lib/features';

const FeaturesContext = createContext<Features>(ALL_ENABLED);

export function FeaturesProvider({
  features,
  children,
}: {
  features: Features;
  children: React.ReactNode;
}) {
  return (
    <FeaturesContext.Provider value={features}>
      {children}
    </FeaturesContext.Provider>
  );
}

export function useFeatures(): Features {
  return useContext(FeaturesContext);
}
