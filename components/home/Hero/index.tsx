'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HERO_PATHS, VIEWBOX } from './paths';
import useLiquidEase from '@/hooks/useLiquidEase';

import Image from 'next/image';
import { urlFor } from '@/sanity/lib/image';

import './style.scss';

interface Props {
  data: {
    bgImage?: string;
    label?: string;
    title?: string;
    location?: string;
  };
}

gsap.registerPlugin(ScrollTrigger);

export default function Hero({ data }: Props) {
  useLiquidEase();

  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.from('.hero__image', {
        scale: 1.12,
        duration: 1.8,
        ease: 'power3.out',
      })
        .from(
          '.hero__eyebrow',
          {
            opacity: 0,
            y: 30,
            duration: 0.7,
            ease: 'power3.out',
          },
          '-=1',
        )
        .from(
          '.hero__title',
          {
            opacity: 0,
            y: 60,
            duration: 1,
            ease: 'power4.out',
          },
          '-=0.45',
        )
        .from(
          '.hero__location',
          {
            opacity: 0,
            y: 20,
            duration: 0.6,
          },
          '-=0.5',
        )
        .from(
          '.hero__scroll',
          {
            opacity: 0,
            duration: 0.6,
          },
          '-=0.2',
        );
    }, rootRef);

    return () => ctx.revert();
  }, []);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const media = gsap.matchMedia();
    media.add(
      {
        desktop: '(min-width: 769px)',
        mobile: '(max-width: 768px)',
        reduce: '(prefers-reduced-motion: reduce)',
      },
      (context) => {
        // Server markup is fully visible, including when JS is disabled.
        // matchMedia reverts previous animations before preferences change.
        if (context.conditions?.reduce) return;

        const svg = root.querySelector<SVGSVGElement>('.hero__artwork')!;
        const wave = svg.querySelector<SVGPathElement>('[data-scroll-path="orange-wave"]')!;
        const paths = svg.querySelectorAll<SVGPathElement>('[data-scroll-path]');

        // pathLength="1" normalizes dashes; getTotalLength() would mix units.
        gsap.set(paths, { attr: { 'stroke-dasharray': 1, 'stroke-dashoffset': 1 } });
        gsap.set(wave, { attr: { 'stroke-dashoffset': -1 } });
        const intro = gsap.timeline({ defaults: { ease: 'liquidEase' } });
        const draw = (id: string, at: number, duration: number) => {
          intro.to(
            svg.querySelector('[data-scroll-path="' + id + '"]'),
            {
              attr: { 'stroke-dashoffset': 0 },
              duration,
            },
            at,
          );
        };
        draw('orange-guitar', 2, 2.55);
        draw('blue-top', 2.65, 1.15);
        draw('blue-bottom', 2.85, 1.15);
        /* draw('orange-wave', 1.5, 1.5); */

        /* intro.from(
          root.querySelectorAll('.hero__eyebrow, .hero__title, .hero__location'),
          {
            opacity: 0,
            y: 22,
            duration: 0.75,
            stagger: 0.12,
          },
          0.15,
        ); */

        return () => {
          // GSAP AttrPlugin can revert absent attributes to empty strings.
          paths.forEach((path) => {
            path.removeAttribute('stroke-dasharray');
            path.removeAttribute('stroke-dashoffset');
          });
        };
      },
      root,
    );

    // Reverts only this hero's attributes, timelines, triggers and listeners.
    // Safe for React Strict Mode, route changes and preference changes.
    return () => media.revert();
  }, []);

  return (
    <section ref={rootRef} className="hero">
      <div className="hero__stage">
        {data.bgImage && (
          <div className="hero__image">
            <Image src={urlFor(data.bgImage).url()} alt="Hero BG Image" fill priority />
          </div>
        )}

        <div className="hero__overlay" />

        <svg
          className="hero__artwork"
          viewBox={'0 0 ' + VIEWBOX.width + ' ' + VIEWBOX.height}
          preserveAspectRatio="xMidYMid meet"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <filter id="svg-blur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
            </filter>
          </defs>
          <g strokeLinecap="round" strokeLinejoin="round">
            {HERO_PATHS.map((path) => (
              <path
                key={path.id}
                id={path.id}
                data-scroll-path={path.id}
                pathLength={1}
                stroke={path.stroke}
                opacity={0.7}
                strokeWidth={path.strokeWidth}
                d={path.d}
                filter="url(#svg-blur)"
              />
            ))}
          </g>
        </svg>

        <div className="hero__content">
          <p className="hero__eyebrow">{data.label}</p>
          <h1 className="hero__title">{data.title}</h1>
          <p className="hero__location">{data.location}</p>
          <div className="hero__scroll">
            <span>SCROLL</span>
            <i />
          </div>
        </div>
      </div>
    </section>
  );
}
