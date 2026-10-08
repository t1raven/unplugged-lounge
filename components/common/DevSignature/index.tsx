'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    __UNPLUGGED_SIGNATURE__?: boolean;
  }
}

export default function DevSignature() {
  useEffect(() => {
    if (window.__UNPLUGGED_SIGNATURE__) return;

    window.__UNPLUGGED_SIGNATURE__ = true;

    console.log(
      '%cUNPLUGGED %cLOUNGE%c\n %c Designed & Developed by Steven.',
      'font-size: 24px; font-weight: 800; letter-spacing: -1px; background: #1A1A1A; color: #ee7102; border-radius: 7px 0 0 7px; padding: 4px 0 4px 12px;',
      'font-size: 24px; font-weight: 800; letter-spacing: -1px; background: #1A1A1A; color: #ccc; border-radius: 0 7px 7px 0; padding: 4px 12px 4px 0;',
      '',
      'font-size: 11px; line-height: 2; color: #aaa;',
    );
  }, []);

  return null;
}
