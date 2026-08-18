import React, { createContext, useContext, useEffect, useState } from 'react';
import { setHapticEnabled } from '@/lib/haptics';
import { isColorTheme, type ColorTheme } from '@/lib/color-themes';
import {
  chooseDreamStorageFolder,
  getDreamStorageFolderName,
  isDreamStorageSupported,
} from '@/lib/dream-file-storage';

type SettingsContextType = {
  hapticEnabled: boolean;
  setHapticEnabled: (enabled: boolean) => void;
  animationsEnabled: boolean;
  setAnimationsEnabled: (enabled: boolean) => void;
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
  storageSupported: boolean;
  storageFolderName: string | null;
  chooseStorageFolder: () => Promise<string | null>;
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

  const [colorTheme, setColorTheme] = useState<ColorTheme>(() => {
    const stored = localStorage.getItem('dream-journal-color-theme');
    return isColorTheme(stored) ? stored : 'cosmic-purple';
  });
  const [storageFolderName, setStorageFolderName] = useState<string | null>(null);
  const storageSupported = isDreamStorageSupported();

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

  useEffect(() => {
    localStorage.setItem('dream-journal-color-theme', colorTheme);
    document.documentElement.dataset.colorTheme = colorTheme;
  }, [colorTheme]);

  useEffect(() => {
    if (!storageSupported) return;
    getDreamStorageFolderName().then(setStorageFolderName).catch(() => setStorageFolderName(null));
  }, [storageSupported]);

  async function chooseStorageFolder() {
    const folderName = await chooseDreamStorageFolder();
    if (folderName) setStorageFolderName(folderName);
    return folderName;
  }

  return (
    <SettingsContext.Provider value={{
      hapticEnabled,
      setHapticEnabled: setHapticState,
      animationsEnabled,
      setAnimationsEnabled: setAnimationsState,
      colorTheme,
      setColorTheme,
       storageSupported,
       storageFolderName,
       chooseStorageFolder,
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
