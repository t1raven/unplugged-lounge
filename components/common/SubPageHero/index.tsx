'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';

import Image from 'next/image';

import './style.scss';

import ParaSection from '@/components/common/ParaSection';
import heroKvImage from '@/public/images/common/site-sub-hero-kv.png';

interface Props {
  label: string;
  title: string;
  description: string;
}

export default function SubPageHero({ label, title, description }: Props) {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.from('.sub-page-hero-label', {
        opacity: 0,
        y: 30,
        duration: 0.7,
        ease: 'power3.out',
      })
        .from(
          '.sub-page-hero-title',
          {
            opacity: 0,
            y: 60,
            duration: 1,
            ease: 'power4.out',
          },
          '-=0.45',
        )
        .from(
          '.sub-page-hero-description',
          {
            opacity: 0,
            y: 20,
            duration: 0.6,
          },
          '-=0.5',
        );
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="sub-page-hero" ref={rootRef}>
      <ParaSection className="sub-page-hero-kv" delay={200}>
        <div>
          <Image
            src={heroKvImage}
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            alt="Hero Key Visual"
          />
        </div>
      </ParaSection>
      <div className="sub-page-hero-inner">
        <p className="sub-page-hero-label">{label}</p>
        <h1 className="sub-page-hero-title" dangerouslySetInnerHTML={{ __html: title }} />
        <p
          className="sub-page-hero-description"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      </div>
    </section>
  );
}
