'use client';

import Link from 'next/link';
import { urlFor } from '@/sanity/lib/image';
import { Image } from '@/components/ui/Skeleton';
import { formatDate, formatTime, formatWeekDay, formatDDay } from '@/utils/date';

import type { Performance } from '@/types/performance';

import './Card.scss';

interface Props {
  performance: Performance;
  type: 'selected' | 'upcoming';
}

export default function PerformanceCard({ performance, type }: Props) {
  return (
    <Link href={`/performances/${performance.slug?.current}`} className="performance-card">
      <div className="performance-date">
        <strong>
          {type === 'upcoming'
            ? formatDate(performance.date).substring(5)
            : formatTime(performance.date)}
        </strong>

        {type === 'upcoming' && (
          <span>
            {formatWeekDay(performance.date, 'short')} {formatTime(performance.date)}
          </span>
        )}
      </div>

      <Image
        className="performance-poster"
        src={performance.poster?.asset ? urlFor(performance.poster).width(100).url() : ''}
        alt={performance.title}
        size={100}
      />

      <div className="performance-info">
        {type === 'upcoming' && (
          <div>
            <em>{formatDDay(performance.date)}</em>
          </div>
        )}

        <strong>{performance.title}</strong>

        {performance.artists && performance.artists.length > 0 && (
          <span>{performance.artists.map((artist) => artist.name).join(' · ')}</span>
        )}
      </div>

      <span className="performance-arrow">
        <span className="material-symbols-rounded">arrow_forward_ios</span>
      </span>
    </Link>
  );
}
