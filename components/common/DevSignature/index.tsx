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
      '%cUNPLUGGED\n%cLOUNGE®',
      'font-size: 28px; font-weight: 900; letter-spacing: -1px; color: #fff;',
      'font-size: 20px; font-weight: 600; letter-spacing: -1px; color: #999;',
    );

    console.log(
      '%cDesigned & Developed by Steven.',
      'font-size: 11px; line-height: 2; color: #aaa;',
    );
  }, []);

  return null;
}
