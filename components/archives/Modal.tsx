'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import Link from 'next/link';

import Modal from '@/components/common/Modal';

import type { Archive } from '@/types/archive';

import './Modal.scss';

interface Props {
  items: Archive[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

function ArchiveImage({ item }: { item: Archive }) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (!imageLoaded || !imageRef.current) return;

    const animation = gsap.fromTo(
      imageRef.current,
      { opacity: 0, scale: 0.98 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        ease: 'power2.out',
        clearProps: 'transform',
      },
    );

    return () => {
      animation.kill();
    };
  }, [imageLoaded]);

  return (
    <Image
      ref={imageRef}
      src={item.imageUrl}
      alt={item.title}
      fill
      sizes="(max-width: 768px) 100vw, 50vw"
      onLoad={() => setImageLoaded(true)}
      style={{ opacity: imageLoaded ? 1 : 0 }}
    />
  );
}

export default function ArchiveModal({ items, currentIndex, onClose, onPrev, onNext }: Props) {
  const item = items[currentIndex];

  useEffect(() => {
    if (items.length <= 1) return;

    const nextIndex = currentIndex === items.length - 1 ? 0 : currentIndex + 1;

    const prevIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;

    const preload = (src?: string) => {
      if (!src) return;

      const img = new window.Image();
      img.src = src;
    };

    preload(items[nextIndex]?.imageUrl);
    preload(items[prevIndex]?.imageUrl);
  }, [currentIndex, items]);

  /*
   * 이미지 변경
   */
  useEffect(() => {
    let touchStartX = 0;
    let touchEndX = 0;

    // 최소 스와이프 거리 (픽셀 단위, 너무 민감하게 반응하지 않도록 설정)
    const minSwipeDistance = 50;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].clientX;
      calculateSwipe();
    };

    const calculateSwipe = () => {
      const distanceX = touchEndX - touchStartX;

      // 1. 최소 이동 거리 조건을 만족하는지 확인
      if (Math.abs(distanceX) < minSwipeDistance) return;

      // 2. 방향 판별 (양수면 오른쪽, 음수면 왼쪽 스와이프)
      if (distanceX > 0) {
        onPrev();
        // TODO: 이전 페이지 이동, 캐러셀 이전 슬라이드 등 로직 추가
      } else {
        onNext();
        // TODO: 다음 페이지 이동, 캐러셀 다음 슬라이드 등 로직 추가
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        onPrev();
      }

      if (event.key === 'ArrowRight') {
        onNext();
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onPrev, onNext]);

  if (!item) return null;

  return (
    <Modal
      className="gallery-modal"
      ariaLabel={item.title}
      bdOpacity={0.9}
      open={true}
      onClose={onClose}
    >
      <button type="button" className="gallery-modal__close" onClick={onClose} aria-label="닫기">
        <span className="icon material-symbols-rounded" translate="no">
          close
        </span>
      </button>

      <div className="gallery-modal__image">
        <ArchiveImage key={`${currentIndex}:${item.imageUrl}`} item={item} />
      </div>

      <div className="gallery-modal__info">
        {item.category?._id !== '3eb51abf-f89b-4350-a9fa-2f0eac2514c4' && (
          <>
            {item.performance ? (
              <h2>
                <Link href={`/performances/${item.performance.slug?.current ?? ''}`}>
                  {item.title}
                  <i className="icon material-symbols-rounded" translate="no">
                    arrow_forward_ios
                  </i>
                </Link>
              </h2>
            ) : (
              <h2>{item.title}</h2>
            )}

            {item.description && <p>{item.description}</p>}
          </>
        )}

        <span>
          {currentIndex + 1} / {items.length}
        </span>
      </div>

      <button
        type="button"
        className="gallery-modal__prev"
        onClick={onPrev}
        aria-label="이전 이미지"
      >
        <span className="icon material-symbols-rounded" translate="no">
          keyboard_arrow_left
        </span>
      </button>

      <button
        type="button"
        className="gallery-modal__next"
        onClick={onNext}
        aria-label="다음 이미지"
      >
        <span className="icon material-symbols-rounded" translate="no">
          keyboard_arrow_right
        </span>
      </button>
    </Modal>
  );
}
