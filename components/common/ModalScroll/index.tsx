'use client';

import { useEffect, useRef, type ReactNode } from 'react';

import Lenis from 'lenis';
import gsap from 'gsap';

import { useDevice } from '@/components/providers/DeviceProvider';
//import { useLenis } from '@/components/providers/LenisProvider';

import './style.scss';

interface ModalScrollProps {
  children: ReactNode;
  className?: string;
}

export default function ModalScroll({ children, className = '' }: ModalScrollProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const { isMobile, isTablet } = useDevice();

  //const { stop, start } = useLenis();

  const useNativeScroll = isMobile || isTablet;

  /**
   * 배경 스크롤 정지
   */
  /* useEffect(() => {
    stop();

    return () => {
      start();
    };
  }, [stop, start]); */

  /**
   * Desktop Modal Lenis
   */
  useEffect(() => {
    /* if (useNativeScroll) {
      return;
    } */

    const wrapper = wrapperRef.current;
    const content = contentRef.current;

    if (!wrapper || !content) {
      return;
    }

    const lenis = new Lenis({
      wrapper,
      content,

      duration: 1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1,
    });

    const update = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(update);

    return () => {
      gsap.ticker.remove(update);
      lenis.destroy();
    };
  }, [useNativeScroll]);

  return (
    <div ref={wrapperRef} className={`modal-scroll ${className}`}>
      <div ref={contentRef} className="modal-scroll-content">
        {children}
      </div>
    </div>
  );
}
