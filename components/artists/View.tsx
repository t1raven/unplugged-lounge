'use client';

import type { Artist } from '@/types/artist';
import type { Performance } from '@/types/performance';
import Link from 'next/link';
import Image from 'next/image';

import ParaSection from '@/components/common/ParaSection';
import heroKvImage from '@/public/images/common/site-sub-hero-kv.png';
import PerformanceCard from '@/components/performances/Card';

import './View.scss';

interface Props {
  artist: Artist;
  performances: Performance[];
}

const extractInstagramIdWithRegex = (urlStr: string): string | null => {
  const regex = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9_.]+)/;
  const match = urlStr.match(regex);

  return match ? match[1] : null;
};

const getKSTDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

const getPerformanceDate = (value: string) => {
  // Sanity date 또는 datetime 필드 대응
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  return getKSTDate(new Date(value));
};

type ArtistPerformance = {
  _id: string;
  date: string;
};

function groupArtistPerformances<T extends ArtistPerformance>(performances: T[], now = new Date()) {
  const today = getKSTDate(now);

  const result = {
    today: [] as T[],
    upcoming: [] as T[],
    past: [] as T[],
  };

  for (const performance of performances) {
    const date = getPerformanceDate(performance.date);

    if (date === today) {
      result.today.push(performance);
    } else if (date > today) {
      result.upcoming.push(performance);
    } else {
      result.past.push(performance);
    }
  }

  const sortByDate = (a: T, b: T) => a.date.localeCompare(b.date);

  result.today.sort(sortByDate);
  result.upcoming.sort(sortByDate);
  result.past.sort((a, b) => sortByDate(b, a));

  return result;
}

export default function ArtistViewPage({ artist, performances }: Props) {
  const { today, upcoming, past } = groupArtistPerformances(performances);

  return (
    <>
      <section className="artist-view-hero">
        <ParaSection className="artist-view-hero-kv" delay={100}>
          <div>
            <Image src={heroKvImage} priority sizes="100vw" alt="Hero Key Visual" unoptimized />
          </div>
        </ParaSection>
        <div className="artist-view-inner">
          <h1 className="artist-name">{artist.name}</h1>
          {artist.instagram && (
            <p className="artist-instagram">
              <Link href={artist.instagram!} target="_blank">
                @{extractInstagramIdWithRegex(artist.instagram)}
                <i className="material-symbols-rounded icon" translate="no">
                  arrow_outward
                </i>
              </Link>
            </p>
          )}
        </div>
      </section>

      {today.length === 0 && upcoming.length === 0 && past.length === 0 && (
        <section className="artist-view-performances">
          <div className="artist-view-inner">
            <p className="no-performances">등록된 공연이 없습니다.</p>
          </div>
        </section>
      )}

      {today.length > 0 && (
        <section className="artist-view-performances">
          <div className="artist-view-inner">
            <div className="artist-view-heading">
              <div>
                <p>Today</p>
                <h2>오늘 공연</h2>
              </div>
              <div className="count">
                <span>{today.length}</span>건
              </div>
            </div>

            <div className="artist-view-performances-list">
              {today.map((performance) => (
                <PerformanceCard key={performance._id} type="upcoming" performance={performance} />
              ))}
            </div>
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="artist-view-performances">
          <div className="artist-view-inner">
            <div className="artist-view-heading">
              <div>
                <p>Upcoming</p>
                <h2>다가오는 공연</h2>
              </div>
              <div className="count">
                <span>{upcoming.length}</span>건
              </div>
            </div>

            <div className="artist-view-performances-list">
              {upcoming.map((performance) => (
                <PerformanceCard key={performance._id} type="upcoming" performance={performance} />
              ))}
            </div>
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section className="artist-view-performances">
          <div className="artist-view-inner">
            <div className="artist-view-heading">
              <div>
                <p>Past</p>
                <h2>지난 공연</h2>
              </div>
              <div className="count">
                <span>{past.length}</span>건
              </div>
            </div>

            <div className="artist-view-performances-list">
              {past.map((performance) => (
                <PerformanceCard key={performance._id} type="upcoming" performance={performance} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
