'use client';

import { useEffect } from 'react';
import { useLenis } from '@/components/providers/LenisProvider';

export default function useLenisLock(locked: boolean) {
  const { start, stop } = useLenis();

  useEffect(() => {
    if (locked) {
      stop();
    } else {
      start();
    }

    return () => {
      start();
    };
  }, [locked, start, stop]);
}
