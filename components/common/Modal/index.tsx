'use client';

import { ReactNode, useEffect } from 'react';

import './style.scss';

interface Props {
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
  bdOpacity?: number;
  open: boolean;
  onClose: () => void;
}
export default function Modal({ children, className, ariaLabel, bdOpacity, open, onClose }: Props) {
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
      <div className="modal-panel">{children}</div>
    </div>
  );
}
