'use client';

import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';

import { usePathname } from 'next/navigation';
import { useDevice } from '@/components/providers/DeviceProvider';

import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import 'lenis/dist/lenis.css';

gsap.registerPlugin(ScrollTrigger);

interface LenisContextValue {
  start: () => void;
  stop: () => void;
  scrollToTop: () => void;
}

const LenisContext = createContext<LenisContextValue | null>(null);

interface LenisProviderProps {
  children: ReactNode;
}

export default function LenisProvider({ children }: LenisProviderProps) {
  const pathname = usePathname();

  const lenisRef = useRef<Lenis | null>(null);

  const { isMobile, isTablet } = useDevice();
  const useNativeScroll = isMobile || isTablet;

  useEffect(() => {
    if (useNativeScroll) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1,
    });

    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    const update = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(update);

      lenis.destroy();

      lenisRef.current = null;
    };
  }, [useNativeScroll]);

  useEffect(() => {
    const lenis = lenisRef.current;

    if (!lenis) {
      return;
    }

    lenis.scrollTo(0, {
      immediate: true,
    });

    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
  }, [pathname]);

  const start = () => {
    lenisRef.current?.start();
  };

  const stop = () => {
    lenisRef.current?.stop();
  };

  const scrollToTop = () => {
    lenisRef.current?.scrollTo(0);
  };

  return (
    <LenisContext.Provider
      value={{
        start,
        stop,
        scrollToTop,
      }}
    >
      {children}
    </LenisContext.Provider>
  );
}

export function useLenis() {
  const context = useContext(LenisContext);

  if (!context) {
    throw new Error('useLenis must be used within LenisProvider');
  }

  return context;
}
