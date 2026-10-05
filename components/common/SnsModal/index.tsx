'use client';

import { useEffect } from 'react';
import Link from 'next/link';

import './style.scss';

interface Props {
  open: boolean;
  onClose: () => void;
}
export default function SnsModal({ open, onClose }: Props) {
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
    <div className="sns-modal" role="dialog" aria-modal="true" data-lenis-prevent>
      <button
        type="button"
        className="sns-modal-backdrop"
        aria-label="모달창 닫기"
        onClick={onClose}
      />
      <div className="sns-modal-panel">
        <ul className="sns-list">
          <li>
            <Link href="https://www.instagram.com/unplugged.lounge/" target="_blank">
              <i className="material-symbols-rounded icon" translate="no">
                music_note_2
              </i>
              언플러그드 라운지
              <i className="material-symbols-rounded outlink" translate="no">
                arrow_outward
              </i>
            </Link>
            <p>언플러그드 라운지의 공연 일정과 공식 소식</p>
          </li>
          <li>
            <Link href="https://www.instagram.com/cafeunplugged.seogyo/" target="_blank">
              <i className="material-symbols-rounded icon" translate="no">
                coffee
              </i>
              서교음악다방
              <i className="material-symbols-rounded outlink" translate="no">
                arrow_outward
              </i>
            </Link>
            <p>따뜻하고 활기찬 2층의 카페 소식</p>
          </li>
          <li>
            <Link href="https://www.instagram.com/unplugged.lounge.zip/" target="_blank">
              <i className="material-symbols-rounded icon" translate="no">
                news
              </i>
              언플러그드 라운지 매거진
              <i className="material-symbols-rounded outlink" translate="no">
                arrow_outward
              </i>
            </Link>
            <p>공연 후기와 다양한 컨텐츠</p>
          </li>
        </ul>
      </div>
    </div>
  );
}
