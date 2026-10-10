'use client';

import { NextStudio } from 'next-sanity/studio';

import config from '@/sanity.config';

import {
  StudioThemeProvider,
  useStudioTheme,
} from '@/sanity/components/providers/StudioThemeProvider';

function StudioContent() {
  const { scheme, setScheme } = useStudioTheme();

  return <NextStudio config={config} scheme={scheme} onSchemeChange={setScheme} />;
}

export default function Studio() {
  return (
    <StudioThemeProvider>
      <StudioContent />
    </StudioThemeProvider>
  );
}
