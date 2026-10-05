'use client';

import { ReactNode, useRef, useEffect } from 'react';

interface Props {
  className?: string;
  children?: ReactNode;
  delay?: number;
  /** Touch smoothing in milliseconds; defaults to at least 160ms. */
  touchDelay?: number;
}

export default function ParaSection({ className, children, delay, touchDelay }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const app = ref.current;
    if (!app) return;
    const child = app.firstElementChild as HTMLElement | null;
    if (!child) return;

    const originalTransform = child.style.transform;
    const originalWillChange = child.style.willChange;
    const originalOverflow = child.style.overflow;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const touchDevice = window.matchMedia('(hover: none) and (pointer: coarse)');
    let frameId: number | null = null;
    let lastTime = 0;
    let currentY = 0;
    let sectionTop = 0;
    let sectionHeight = 0;
    let viewportHeight = 0;
    let viewportWidth = 0;
    let maxScrollY = 0;
    let needsMeasure = true;

    child.style.willChange = 'transform';
    child.style.overflow = 'hidden';

    const render = () => {
      child.style.transform = `translate3d(0, ${currentY}px, 0)`;
    };

    const measure = () => {
      const rect = app.getBoundingClientRect();
      // Both the section and scroll positions must use document coordinates.
      sectionTop = rect.top + window.scrollY;
      sectionHeight = rect.height;
      // Keep toolbar expansion/collapse from shifting the touch scroll baseline.
      if (!touchDevice.matches || !viewportHeight || viewportWidth !== window.innerWidth) {
        viewportHeight = window.innerHeight;
      }
      viewportWidth = window.innerWidth;
      maxScrollY = Math.max(0, document.documentElement.scrollHeight - viewportHeight);
      needsMeasure = false;
    };

    const getTargetY = () => {
      // Safari rubber-band scrolling can report positions outside the document.
      const scrollY = Math.max(0, Math.min(window.scrollY, maxScrollY));
      const distance =
        viewportHeight >= sectionHeight
          ? scrollY - sectionTop
          : scrollY + viewportHeight - (sectionTop + sectionHeight);

      return Math.max(0, Math.min(distance / 2, sectionHeight / 2));
    };

    const animate = (time: number) => {
      if (needsMeasure) measure();
      const targetY = getTargetY();
      const deltaTime = lastTime ? Math.min(time - lastTime, 64) : 1000 / 60;
      lastTime = time;

      // Use elapsed time so smoothing feels consistent across refresh rates.
      const configuredDelay = delay ?? 100;
      const smoothingDelay = touchDevice.matches
        ? (touchDelay ?? (configuredDelay > 0 ? Math.max(configuredDelay, 160) : configuredDelay))
        : configuredDelay;
      const progress =
        reducedMotion.matches || smoothingDelay <= 0
          ? 1
          : 1 - Math.exp(-deltaTime / smoothingDelay);
      currentY += (targetY - currentY) * progress;

      const settled = Math.abs(targetY - currentY) < 0.1;
      if (settled) currentY = targetY;
      render();

      if (settled) {
        frameId = null;
        lastTime = 0;
      } else {
        frameId = window.requestAnimationFrame(animate);
      }
    };

    const update = () => {
      if (frameId === null) {
        // Refresh geometry when a new scroll starts, then reuse it in the loop.
        needsMeasure = true;
        lastTime = performance.now();
        frameId = window.requestAnimationFrame(animate);
      }
    };

    const refresh = () => {
      needsMeasure = true;
      update();
    };

    const onResize = () => {
      // Element ResizeObservers still handle genuine layout changes.
      if (touchDevice.matches && viewportWidth === window.innerWidth) return;
      refresh();
    };

    const onInputChange = () => {
      viewportHeight = 0;
      refresh();
    };

    measure();
    currentY = getTargetY();
    render();
    const resizeObserver = new ResizeObserver(refresh);
    resizeObserver.observe(app);
    resizeObserver.observe(child);
    resizeObserver.observe(document.body);
    window.addEventListener('scroll', update, { passive: true });
    reducedMotion.addEventListener('change', update);
    touchDevice.addEventListener('change', onInputChange);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', update);
      reducedMotion.removeEventListener('change', update);
      touchDevice.removeEventListener('change', onInputChange);
      window.removeEventListener('resize', onResize);
      resizeObserver.disconnect();
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      child.style.transform = originalTransform;
      child.style.willChange = originalWillChange;
      child.style.overflow = originalOverflow;
    };
  }, [delay, touchDelay]);

  return (
    <div className={className} ref={ref}>
      {children}
    </div>
  );
}
