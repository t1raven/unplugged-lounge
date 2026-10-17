'use client';

import Link from 'next/link';
import { urlFor } from '@/sanity/lib/image';
import { Image } from '@/components/ui/Skeleton';
import { getDateParts, formatDDay } from '@/utils/date';

import type { Performance } from '@/types/performance';

import './Card.scss';

interface Props {
  performance: Performance;
  type: 'selected' | 'upcoming';
}

export default function PerformanceCard({ performance, type }: Props) {
  const { year, month, day, weekday, hour, minute } = getDateParts(performance.date);
  const time = `${hour}:${minute}`;
  const isUpcoming = type === 'upcoming';
  const slug = performance.slug?.current;
  const artistNames = performance.artists
    ?.map((artist) => artist?.name)
    .filter(Boolean)
    .join(' · ');

  const content = (
    <>
      <time className="performance-date" dateTime={performance.date}>
        {isUpcoming && <span>{year}</span>}
        <strong>{isUpcoming ? `${month}.${day}` : time}</strong>

        {isUpcoming && (
          <span>
            {weekday.slice(0, 1)} {time}
          </span>
        )}
      </time>

      <Image
        className="performance-poster"
        src={performance.poster?.asset ? urlFor(performance.poster).width(100).url() : ''}
        alt={performance.title}
        size={100}
      />

      <div className="performance-info">
        {isUpcoming && (
          <div>
            <em>{formatDDay(performance.date)}</em>
          </div>
        )}

        <strong>{performance.title}</strong>

        {artistNames && <span>{artistNames}</span>}
      </div>

      {slug && (
        <span className="performance-arrow" aria-hidden="true">
          <span className="material-symbols-rounded">arrow_forward_ios</span>
        </span>
      )}
    </>
  );

  return slug ? (
    <Link href={`/performances/${slug}`} className="performance-card">
      {content}
    </Link>
  ) : (
    <div className="performance-card">{content}</div>
  );
}
