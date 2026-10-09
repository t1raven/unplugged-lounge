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
      '%c\n%cUNPLUGGED %cLOUNGE%c\n %cDesigned & Developed by Steven.\n',
      '',
      'font-size: 24px; font-weight: 800; letter-spacing: -1px; background: #191714; color: #fff; border: 2px solid #ee7102; border-right: 0; border-radius: 7px 0 0 7px; padding: 4px 0 4px 10px;',
      'font-size: 24px; font-weight: 800; letter-spacing: -1px; background: #191714; color: #4EAEE4; border: 2px solid #ee7102; border-left: 0; border-radius: 0 7px 7px 0; padding: 4px 10px 4px 0;',
      '',
      'font-size: 11px; line-height: 2; color: #4EAEE4;',
    );
  }, []);

  return null;
}
