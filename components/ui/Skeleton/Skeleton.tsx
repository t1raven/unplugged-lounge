import type { CSSProperties } from 'react';

import './style.scss';

interface SkeletonProps {
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  aspectRatio?: CSSProperties['aspectRatio'];
  radius?: CSSProperties['borderRadius'];
  className?: string;
}

export default function Skeleton({
  width = '100%',
  height,
  aspectRatio,
  radius,
  className = '',
}: SkeletonProps) {
  return (
    <span
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        aspectRatio,
        borderRadius: radius,
      }}
      aria-hidden="true"
    />
  );
}
