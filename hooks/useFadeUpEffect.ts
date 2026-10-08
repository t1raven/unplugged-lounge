'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect } from 'react';
import useLiquidEase from '@/hooks/useLiquidEase';

gsap.registerPlugin(ScrollTrigger);

export default function useFadeUpEffect(target: string) {
  useLiquidEase();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const el = gsap.utils.toArray<HTMLElement>(target);

      el.forEach((el) => {
        gsap.fromTo(
          el,
          {
            y: 50,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: 'liquidEase',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              once: true,
            },
          },
        );
      });
    });

    return () => ctx.revert();
  }, [target]);
}
