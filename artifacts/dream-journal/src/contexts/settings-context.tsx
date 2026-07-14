import React, { createContext, useContext, useEffect, useState } from 'react';
import { setHapticEnabled } from '@/lib/haptics';

type SettingsContextType = {
  hapticEnabled: boolean;
  setHapticEnabled: (enabled: boolean) => void;
  animationsEnabled: boolean;
  setAnimationsEnabled: (enabled: boolean) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [hapticEnabled, setHapticState] = useState<boolean>(() => {
    const stored = localStorage.getItem('somnia-haptic');
    return stored !== null ? stored === 'true' : true;
  });

  const [animationsEnabled, setAnimationsState] = useState<boolean>(() => {
    const stored = localStorage.getItem('somnia-animations');
    return stored !== null ? stored === 'true' : true;
  });

  useEffect(() => {
    localStorage.setItem('somnia-haptic', String(hapticEnabled));
    setHapticEnabled(hapticEnabled);
  }, [hapticEnabled]);

  useEffect(() => {
    localStorage.setItem('somnia-animations', String(animationsEnabled));
    if (!animationsEnabled) {
      document.documentElement.setAttribute('data-no-animations', 'true');
    } else {
      document.documentElement.removeAttribute('data-no-animations');
    }
  }, [animationsEnabled]);

  return (
    <SettingsContext.Provider value={{
      hapticEnabled,
      setHapticEnabled: setHapticState,
      animationsEnabled,
      setAnimationsEnabled: setAnimationsState
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
