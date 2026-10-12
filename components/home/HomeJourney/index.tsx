'use client';

import { useLayoutEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './style.scss';

const SECTIONS = ['upcoming', 'about', 'location'] as const;

export default function HomeJourney({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const svg = root.querySelector<SVGSVGElement>('.home-journey__line');
    const sections = SECTIONS.map((name) => ({
      name,
      element: root.querySelector<HTMLElement>('.' + name),
      path: svg?.querySelector<SVGPathElement>('[data-journey-path="' + name + '"]'),
    }));
    if (!svg || sections.some(({ element, path }) => !element || !path)) return;

    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add(
      '(prefers-reduced-motion: no-preference)',
      () => {
        const measure = () => {
          // Use layout dimensions, ignoring existing entrance/parallax transforms.
          const width = root.clientWidth;
          const stroke = Math.min(64, Math.max(10, (width * 62) / 2048));
          const pad = stroke * 2;
          svg.setAttribute('viewBox', '0 0 ' + width + ' ' + root.offsetHeight);
          sections.forEach(({ name, element, path }) => {
            if (!element || !path) return;
            const top = element.offsetTop;
            const h = element.offsetHeight;
            const point = (x: number, y: number) => width * x + ' ' + (top + h * y);
            const left = -pad;
            const right = width + pad;
            let d: string;
            if (name === 'upcoming') {
              // Right -> left: a shallow wave across the performance section.
              d =
                'M' +
                right +
                ' ' +
                (top + h * 0.42) +
                ' C' +
                point(0.96, 0.34) +
                ' ' +
                point(0.9, 0.58) +
                ' ' +
                point(0.78, 0.57) +
                ' C' +
                point(0.66, 0.56) +
                ' ' +
                point(0.52, 0.25) +
                ' ' +
                point(0.4, 0.35) +
                ' C' +
                point(0.28, 0.45) +
                ' ' +
                point(0.24, 0.65) +
                ' ' +
                left +
                ' ' +
                (top + h * 0.35);
            } else if (name === 'about') {
              // Left -> right: a longer descending S through the image gallery.
              d =
                'M' +
                left +
                ' ' +
                (top + h * 0.03) +
                ' C' +
                point(0.27, 0.02) +
                ' ' +
                point(0.26, 0.21) +
                ' ' +
                point(0.32, 0.25) +
                ' C' +
                point(0.38, 0.29) +
                ' ' +
                point(0.58, 0.26) +
                ' ' +
                point(0.66, 0.35) +
                ' C' +
                point(0.84, 0.48) +
                ' ' +
                point(0.78, 0.55) +
                ' ' +
                point(0.8, 0.64) +
                ' C' +
                point(0.82, 0.73) +
                ' ' +
                point(0.92, 0.79) +
                ' ' +
                right +
                ' ' +
                (top + h * 0.83);
            } else {
              // Right -> left: finish outside the left edge, within Location.
              d =
                'M' +
                right +
                ' ' +
                (top + h * 0.52) +
                ' C' +
                point(0.96, 0.52) +
                ' ' +
                point(0.91, 0.75) +
                ' ' +
                point(0.85, 0.7) +
                ' C' +
                point(0.73, 0.6) +
                ' ' +
                point(0.69, 0.25) +
                ' ' +
                point(0.57, 0.33) +
                ' C' +
                point(0.45, 0.41) +
                ' ' +
                point(0.35, 0.82) +
                ' ' +
                point(0.25, 0.7) +
                ' C' +
                point(0.1, 0.52) +
                ' ' +
                point(0.14, 0.2) +
                ' ' +
                left +
                ' ' +
                (top + h * 0.2);
            }
            path.setAttribute('d', d);
            path.setAttribute('stroke-width', String(stroke));
          });
        };

        measure();
        gsap.set(svg, { visibility: 'visible' });
        // Separate paths avoid any visible vertical connector at section edges.
        // Each section owns its scroll interval, so long About content cannot
        // prematurely reveal Location. Path order determines drawing direction.
        sections.forEach(({ name, element, path }) => {
          if (!element || !path) return;
          gsap.fromTo(
            path,
            { attr: { 'stroke-dashoffset': 1 } },
            {
              attr: { 'stroke-dashoffset': 0 },
              ease: 'none',
              scrollTrigger: {
                trigger: element,
                start: () =>
                  'top+=' + element.offsetHeight * (name === 'about' ? 0.04 : 0.12) + ' 80%',
                end: () =>
                  'top+=' + element.offsetHeight * (name === 'about' ? 0.9 : 0.95) + ' 65%',
                scrub: 0.4,
              },
            },
          );
        });

        // One measurement pass for all three paths per refresh.
        ScrollTrigger.addEventListener('refreshInit', measure);
        let active = true;
        let frame = 0;
        const refresh = () => {
          if (!active) return;
          cancelAnimationFrame(frame);
          frame = requestAnimationFrame(() => {
            if (active) ScrollTrigger.refresh();
          });
        };
        const observer = new ResizeObserver(refresh);
        observer.observe(root);
        sections.forEach(({ element }) => {
          if (element) observer.observe(element);
        });
        document.fonts?.ready.then(refresh);
        return () => {
          active = false;
          cancelAnimationFrame(frame);
          observer.disconnect();
          ScrollTrigger.removeEventListener('refreshInit', measure);
          sections.forEach(({ path }) => path?.setAttribute('stroke-dashoffset', '1'));
        };
      },
      root,
    );
    return () => media.revert();
  }, []);

  return (
    <div className="home-journey" ref={rootRef}>
      {children}
      <svg
        className="home-journey__line"
        aria-hidden="true"
        focusable="false"
        preserveAspectRatio="none"
      >
        {SECTIONS.map((name) => (
          <path
            key={name}
            data-journey-path={name}
            fill="none"
            stroke="#F57900"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1}
          />
        ))}
      </svg>
    </div>
  );
}
