'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';

let isRegistered = false;

export default function useLiquidEase() {
  useEffect(() => {
    if (isRegistered) return;

    gsap.registerPlugin(CustomEase);
    CustomEase.create('liquidEase', 'M0,0 C0.22,1 0.36,1 1,1');
    isRegistered = true;
  }, []);
}
