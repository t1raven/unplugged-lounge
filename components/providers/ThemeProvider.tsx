'use client';

import { useEffect } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

function ThemeColorSync() {
  useEffect(() => {
    const root = document.documentElement;

    const syncThemeColor = () => {
      const color = getComputedStyle(root).getPropertyValue('--theme-color').trim();

      if (!color) return;

      let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]:not([media])');

      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'theme-color';
        document.head.appendChild(meta);
      }

      meta.content = color;
    };

    syncThemeColor();

    const observer = new MutationObserver(syncThemeColor);

    observer.observe(root, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => observer.disconnect();
  }, []);

  return null;
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="light"
      enableSystem={false}
      enableColorScheme={false}
      disableTransitionOnChange
    >
      <ThemeColorSync />
      {children}
    </NextThemesProvider>
  );
}
