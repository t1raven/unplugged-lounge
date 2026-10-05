'use client';

import { ReactNode, useRef, useEffect } from 'react';

interface Props {
  className?: string;
  children?: ReactNode;
  delay?: number;
}

export default function ParaSection({ className, children, delay }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const app = ref.current;
    if (!app) return;
    const child = app.firstElementChild as HTMLElement | null;
    if (!child) return;

    const originalTransform = child.style.transform;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frameId: number | null = null;
    let lastTime = 0;
    let currentY = 0;

    const getTargetY = () => {
      const appRect = app.getBoundingClientRect(),
        appHeight = appRect.height || 0,
        appTop = appRect.top || 0,
        appBot = appTop + appHeight,
        sT =
          (document.documentElement && document.documentElement.scrollTop) ||
          document.body.scrollTop,
        wH =
          window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
        sB = sT + wH;
      let v = 0;

      if (wH >= appHeight) {
        v = sT >= appTop ? (sT - appTop) / 2 : 0;
      } else {
        v = sB >= appBot ? (sB - appBot) / 2 : 0;
      }

      if (v >= appHeight / 2) v = appHeight / 2;

      return v;
    };

    const animate = (time: number) => {
      const targetY = getTargetY();
      const deltaTime = lastTime ? Math.min(time - lastTime, 64) : 1000 / 60;
      lastTime = time;

      // Use elapsed time so smoothing feels consistent across refresh rates.
      const progress = reducedMotion.matches ? 1 : 1 - Math.exp(-deltaTime / (delay ?? 100));
      currentY += (targetY - currentY) * progress;

      const settled = Math.abs(targetY - currentY) < 0.1;
      if (settled) currentY = targetY;
      child.style.transform = `translateY(${currentY}px)`;

      if (settled) {
        frameId = null;
        lastTime = 0;
      } else {
        frameId = window.requestAnimationFrame(animate);
      }
    };

    const update = () => {
      if (frameId === null) frameId = window.requestAnimationFrame(animate);
    };

    currentY = getTargetY();
    child.style.transform = `translateY(${currentY}px)`;
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      child.style.transform = originalTransform;
    };
  }, []);

  return (
    <div className={className} ref={ref} style={{ willChange: 'transform', overflow: 'hidden' }}>
      {children}
    </div>
  );
}
