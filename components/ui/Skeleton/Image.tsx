'use client';

import { useState } from 'react';
import Image from 'next/image';
import Skeleton from './Skeleton';

export default function SkeletonImage({
  className = '',
  src,
  alt,
  size,
}: {
  className?: string;
  src: string;
  alt: string;
  size?: number | string;
}) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={`skeleton-image-wrapper ${className}`}>
      {/* 1. 이미지가 로딩 중일 때만 보이는 스켈레톤 박스 */}
      {isLoading && <Skeleton />}

      {/* 2. 실제 Next.js 이미지 컴포넌트 */}
      {src != '' && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={`(max-width: 768px) 50vw, ${size ? (typeof size === 'number' ? size + 'px' : size) : '100vw'}`}
          onLoad={() => setIsLoading(false)} // 👈 로드가 완료되면 스켈레톤을 숨김
        />
      )}
    </div>
  );
}
