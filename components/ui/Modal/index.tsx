'use client';

import { ReactNode, useEffect, useRef } from 'react';

import Lenis from 'lenis';
import gsap from 'gsap';

import './style.scss';

interface Props {
  header?: ReactNode;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
  bdOpacity?: number;
  open: boolean;
  onClose: () => void;
}
export default function Modal({
  header,
  children,
  className,
  ariaLabel,
  bdOpacity,
  open,
  onClose,
}: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
  }, []);

  /*
   * ESC + body scroll lock
   */
  useEffect(() => {
    if (!open) return;

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', handleKeydown);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener('keydown', handleKeydown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className={`modal ${className}`}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      data-lenis-prevent
    >
      <button
        type="button"
        className="modal-backdrop"
        aria-label="닫기"
        onClick={onClose}
        style={{ '--btn-opacity': bdOpacity ?? 0.5 } as React.CSSProperties}
      />
      <div className="modal-panel">
        {header && <div className="modal-header">{header}</div>}
        <div className="modal-body" ref={wrapperRef}>
          <div className="modal-content" ref={contentRef}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
