'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type StudioScheme = 'system' | 'light' | 'dark';

type StudioThemeContextValue = {
  scheme: StudioScheme;
  setScheme: (scheme: StudioScheme) => void;
};

const STORAGE_KEY = 'unplugged-studio-theme';

const StudioThemeContext = createContext<StudioThemeContextValue | null>(null);

export function StudioThemeProvider({ children }: { children: ReactNode }) {
  const [scheme, setScheme] = useState<StudioScheme>('system');

  // 저장된 테마 불러오기
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved === 'system' || saved === 'light' || saved === 'dark') {
      setScheme(saved);
    }
  }, []);

  // 변경된 테마 저장
  const changeScheme = (next: StudioScheme) => {
    setScheme(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  return (
    <StudioThemeContext.Provider
      value={{
        scheme,
        setScheme: changeScheme,
      }}
    >
      {children}
    </StudioThemeContext.Provider>
  );
}

export function useStudioTheme() {
  const context = useContext(StudioThemeContext);

  if (!context) {
    throw new Error('useStudioTheme must be used within StudioThemeProvider');
  }

  return context;
}
