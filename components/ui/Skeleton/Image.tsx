'use client';

import { useState } from 'react';
import { default as NextImage } from 'next/image';
import Skeleton from './Skeleton';

export default function Image({
  className = '',
  src,
  alt = '',
  size,
  children,
}: {
  className?: string;
  src: string;
  alt?: string | undefined;
  size?: number | string;
  children?: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);

  return (
    <div className={`${className ? className + ' ' : ''}skeleton-image-wrapper`}>
      {children}
      {src != '' && (
        <>
          {/* 1. 이미지가 로딩 중일 때만 보이는 스켈레톤 박스 */}
          {loading && <Skeleton />}

          {/* 2. 실제 Next.js 이미지 컴포넌트 */}
          <NextImage
            src={src}
            alt={alt}
            fill
            sizes={`(max-width: 768px) 50vw, ${size ? (typeof size === 'number' ? size + 'px' : size) : '100vw'}`}
            onLoad={() => setLoading(false)} // 👈 로드가 완료되면 스켈레톤을 숨김
            className={loading ? 'loading' : ''}
          />
        </>
      )}
    </div>
  );
}
