'use client';

import type { Artist } from '@/types/artist';
import type { Performance } from '@/types/performance';
import Link from 'next/link';
import Image from 'next/image';

import ParaSection from '@/components/common/ParaSection';
import heroKvImage from '@/public/images/common/site-sub-hero-kv.png';
import PerformanceCard from '@/components/performances/Card';
import { Button } from '@/components/ui/Button';
import { useDevice } from '@/components/providers/DeviceProvider';

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

const handleShare = async () => {
  const url = window.location.href;

  // 네이티브 공유 지원
  if (navigator.share) {
    try {
      await navigator.share({
        title: document.title,
        url,
      });
    } catch (error) {
      // 사용자가 공유창을 닫은 경우
      if ((error as DOMException).name !== 'AbortError') {
        console.error('공유 실패:', error);
      }
    }

    return;
  }
  // 네이티브 공유를 지원하지 않는 경우, URL을 클립보드에 복사
  try {
    await navigator.clipboard.writeText(url);
    alert('URL이 클립보드에 복사되었습니다.');
  } catch (error) {
    console.error('URL 복사 실패:', error);
  }
};

export default function ArtistViewPage({ artist, performances }: Props) {
  const { today, upcoming, past } = groupArtistPerformances(performances);
  const { isIOS, isReady } = useDevice();
  const ios = isIOS && isReady ? true : false;

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

          <div className="artist-btns">
            {artist.instagram && (
              <Link href={artist.instagram!} className="artist-instagram" target="_blank">
                @{extractInstagramIdWithRegex(artist.instagram)}
                <i className="material-symbols-rounded icon" translate="no">
                  arrow_outward
                </i>
              </Link>
            )}
            <Button
              type="button"
              className="artist_share"
              size="small"
              color="secondary"
              opacity={0.7}
              onClick={handleShare}
            >
              <span
                className="material-symbols-rounded button-icon middle-icon"
                aria-label="공유하기"
              >
                {ios ? 'ios_share' : 'share'}
              </span>
            </Button>
          </div>
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
