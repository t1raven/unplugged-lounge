'use client';

import { useLayoutEffect, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import './style.scss';

const SECTIONS = ['upcoming', 'about', 'location'] as const;

gsap.registerPlugin(ScrollTrigger);

export default function ScrollPath({ children }: { children: ReactNode }) {
  useLayoutEffect(() => {
    const root = document.querySelector<HTMLDivElement>('.home-scroll-path');
    if (!root) return;
    const svg = root.querySelector<SVGSVGElement>('.home-scroll-path__line');
    const sections = SECTIONS.map((name) => ({
      name,
      element: root.querySelector<HTMLElement>('.' + name),
      path: svg?.querySelector<SVGPathElement>('[data-scroll-path="' + name + '"]'),
    }));
    if (!svg || sections.some(({ element, path }) => !element || !path)) return;

    const media = gsap.matchMedia();
    media.add(
      '(prefers-reduced-motion: no-preference)',
      () => {
        const measure = () => {
          // Use layout dimensions, ignoring existing entrance/parallax transforms.
          const width = root.clientWidth;
          const stroke = Math.min(55, Math.max(20, (width * 55) / 970));
          const pad = stroke * 2;
          svg.setAttribute('viewBox', '0 0 ' + width + ' ' + root.offsetHeight);
          sections.forEach(({ name, element, path }) => {
            if (!element || !path) return;
            const top = element.offsetTop;
            const h = element.offsetHeight;
            //if (name === 'upcoming') console.log('width:', width, 'top:', top, 'height:', h);
            const point = (x: number, y: number) =>
              Math.trunc(width * x) + ' ' + Math.trunc(top + h * y);
            const left = -pad;
            const right = width + pad;
            let d: string;
            let opacity = 0.3;
            if (name === 'upcoming') {
              // Right -> left: a shallow wave across the performance section.
              d =
                'M' +
                right +
                ' ' +
                Math.trunc(top + h * 0.1) +
                ' C' +
                point(0.94, 0.17) +
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
                Math.trunc(top + h * 0.75);
            } else if (name === 'about') {
              // Left -> right: a longer descending S through the image gallery.
              d =
                'M' +
                left +
                ' ' +
                Math.trunc(top + h * 0.03) +
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
                point(0.7, 0.37) +
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
                Math.trunc(top + h * 0.83);
            } else {
              // Right -> left: finish outside the left edge, within Location.
              d =
                'M' +
                right +
                ' ' +
                Math.trunc(top + h * 0.1) +
                ' C' +
                point(0.98, 0.1) +
                ' ' +
                point(0.87, 0.68) +
                ' ' +
                point(0.7, 0.58) +
                ' C' +
                point(0.55, 0.5) +
                ' ' +
                point(0.48, 0.31) +
                ' ' +
                point(0.36, 0.33) +
                ' C' +
                point(0.3, 0.34) +
                ' ' +
                point(0.1, 0.5) +
                ' ' +
                left +
                ' ' +
                Math.trunc(top + h * 0.97);
              opacity = 0.7;
            }
            path.setAttribute('d', d);
            path.setAttribute('stroke-width', String(stroke));
            path.setAttribute('opacity', String(opacity));
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
                  name === 'location'
                    ? 'bottom 85%'
                    : 'top+=' + element.offsetHeight * (name === 'about' ? 0.9 : 0.95) + ' 65%',
                scrub: 0.4,
              },
            },
          );
        });

        // One measurement pass for all three paths per refresh.
        ScrollTrigger.addEventListener('refreshInit', measure);
        let active = true;
        let frame = 0;
        let lastWidth = window.innerWidth;
        const refresh = () => {
          const width = window.innerWidth;
          // Safari 주소창 변화처럼 높이만 바뀌는 resize는 무시한다.
          if (width === lastWidth) return;
          lastWidth = width;
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
    <>
      {children}
      <svg
        className="home-scroll-path__line"
        aria-hidden="true"
        focusable="false"
        preserveAspectRatio="none"
      >
        {SECTIONS.map((name) => (
          <path
            key={name}
            data-scroll-path={name}
            fill="none"
            stroke="#F57900"
            opacity={0.3}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1}
          />
        ))}
      </svg>
    </>
  );
}
