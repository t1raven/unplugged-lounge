'use client';

import { type ReactNode, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Props {
  className?: string;
  children?: ReactNode;
  /** Scroll smoothing in milliseconds. */
  delay?: number;
  /** Touch smoothing in milliseconds; defaults to at least 160ms. */
  touchDelay?: number;
}

export default function ParaSectionScrollTrigger({
  className,
  children,
  delay,
  touchDelay,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    const child = root?.firstElementChild as HTMLElement | null;
    if (!root || !child) return;

    const media = gsap.matchMedia();

    media.add(
      {
        always: 'all',
        touch: '(hover: none) and (pointer: coarse)',
        reducedMotion: '(prefers-reduced-motion: reduce)',
      },
      (context) => {
        const { touch, reducedMotion } = context.conditions!;
        const configuredDelay = delay ?? 100;
        const smoothingDelay = touch
          ? (touchDelay ?? (configuredDelay > 0 ? Math.max(configuredDelay, 160) : configuredDelay))
          : configuredDelay;
        let sectionTop = 0;
        let sectionHeight = 0;
        let viewportHeight = 0;
        let viewportWidth = 0;
        let refreshFrame: number | null = null;

        const measure = () => {
          const rect = root.getBoundingClientRect();
          sectionTop = rect.top + window.scrollY;
          sectionHeight = rect.height;
          // Preserve the touch baseline while Safari's browser toolbar moves.
          if (!touch || !viewportHeight || viewportWidth !== window.innerWidth) {
            viewportHeight = window.innerHeight;
          }
          viewportWidth = window.innerWidth;
        };

        const getStart = () => sectionTop + Math.max(0, sectionHeight - viewportHeight);

        measure();
        gsap.set(child, { y: 0, willChange: 'transform', overflow: 'hidden' });
        const setY = gsap.quickSetter(child, 'y', 'px');
        let currentY = 0;
        let targetY = 0;
        let ticking = false;

        // Keep the original exponential smoothing, driven by GSAP's shared clock.
        const animate = (_time: number, deltaTime: number) => {
          const progress = 1 - Math.exp(-Math.min(deltaTime, 64) / smoothingDelay);
          currentY += (targetY - currentY) * progress;
          const settled = Math.abs(targetY - currentY) < 0.1;
          if (settled) currentY = targetY;
          setY(currentY);
          if (settled) {
            gsap.ticker.remove(animate);
            ticking = false;
          }
        };

        const updateTarget = (self: ScrollTrigger) => {
          targetY = (self.progress * sectionHeight) / 2;
          if (reducedMotion || smoothingDelay <= 0) {
            currentY = targetY;
            setY(currentY);
          } else if (!ticking) {
            ticking = true;
            gsap.ticker.add(animate);
          }
        };

        const trigger = ScrollTrigger.create({
          trigger: root,
          start: getStart,
          end: () => getStart() + Math.max(sectionHeight, 1),
          onRefreshInit: measure,
          onUpdate: updateTarget,
          onRefresh: updateTarget,
        });
        currentY = targetY = (trigger.progress * sectionHeight) / 2;
        setY(currentY);

        const queueRefresh = () => {
          if (refreshFrame !== null) return;
          refreshFrame = window.requestAnimationFrame(() => {
            refreshFrame = null;
            trigger.refresh();
          });
        };

        const observer = new ResizeObserver(queueRefresh);
        observer.observe(root);
        observer.observe(child);
        window.addEventListener('load', queueRefresh);

        return () => {
          gsap.ticker.remove(animate);
          observer.disconnect();
          window.removeEventListener('load', queueRefresh);
          if (refreshFrame !== null) window.cancelAnimationFrame(refreshFrame);
        };
      },
      root,
    );

    // Reverts inline styles and removes only this component's animations/triggers.
    return () => media.revert();
  }, [delay, touchDelay]);

  return (
    <div className={className} ref={ref}>
      {children}
    </div>
  );
}
