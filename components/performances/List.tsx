'use client';

import { useMemo, useState, useLayoutEffect, useRef, useCallback, useEffect } from 'react';
import { formatDate, formatWeekDay } from '@/utils/date';
import useFadeUpEffect from '@/hooks/useFadeUpEffect';
import gsap from 'gsap';
import useLiquidEase from '@/hooks/useLiquidEase';
import { Loading } from '@/components/ui/Skeleton';

import DatePicker from './DatePicker';
import PerformanceCard from './Card';

import type { Performance } from '@/types/performance';

import './List.scss';
import { Button } from '../ui/Button';

interface Props {
  performances: Performance[];
}

const UPCOMING_LIMIT = 12;
const PAST_PAGE_SIZE = 12;

export default function PerformanceList({ performances }: Props) {
  const todayKey = formatDate(new Date());

  // 달력의 날짜는 한국 날짜를 담은 UTC 값으로 관리합니다.
  const today = new Date(todayKey);
  const currentMonthStart = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1);

  const [currentDate, setCurrentDate] = useState(() => new Date(currentMonthStart));

  // 선택된 날짜
  const [selectedDateKey, setSelectedDateKey] = useState(todayKey);

  const monthTitle = `${currentDate.getUTCFullYear()}년 ${currentDate.getUTCMonth() + 1}월`;
  const isPreviousMonthDisabled = currentDate.getTime() <= currentMonthStart;

  const handlePreviousMonth = () => {
    setCurrentDate((date) => {
      const previousMonth = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - 1, 1));

      // 현재 달보다 이전 달로 이동하지 않음
      return previousMonth.getTime() < currentMonthStart ? date : previousMonth;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate((date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1)));
  };

  // ==================================================
  // Performances By Date
  // ==================================================

  const { performancesByDate, sortedPerformances } = useMemo(() => {
    const grouped: Record<string, Performance[]> = {};
    const datedPerformances: Array<{
      performance: Performance;
      dateKey: string;
      timestamp: number;
    }> = [];

    performances.forEach((performance) => {
      if (!performance.date) return;

      const date = new Date(performance.date);
      const timestamp = date.getTime();
      if (Number.isNaN(timestamp)) return;

      const dateKey = formatDate(date);

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }

      grouped[dateKey].push(performance);
      datedPerformances.push({ performance, dateKey, timestamp });
    });

    return {
      performancesByDate: grouped,
      sortedPerformances: datedPerformances.sort((a, b) => a.timestamp - b.timestamp),
    };
  }, [performances]);

  // ==================================================
  // Selected Performances
  // ==================================================

  const selectedWeekday = formatWeekDay(selectedDateKey);
  const selectedPerformances = useMemo(
    () => performancesByDate[selectedDateKey] ?? [],
    [performancesByDate, selectedDateKey],
  );

  // ==================================================
  // Upcoming Performances
  // ==================================================

  const upcomingPerformances = useMemo(() => {
    const upcoming: Performance[] = [];

    for (const { performance, dateKey } of sortedPerformances) {
      if (dateKey < todayKey) continue;

      upcoming.push(performance);
      if (upcoming.length === UPCOMING_LIMIT) break;
    }

    return upcoming;
  }, [sortedPerformances, todayKey]);

  const listRef = useRef<HTMLDivElement>(null);
  useLiquidEase();

  useLayoutEffect(() => {
    const list = listRef.current;

    if (!list || selectedPerformances.length === 0) return;

    const items = list.querySelectorAll('.performance-card');

    if (!items.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        items,
        {
          opacity: 0,
          y: 30,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.08,
          delay: 0.35,
          ease: 'liquidEase',
          clearProps: 'all',
        },
      );
    }, list);

    return () => ctx.revert();
  }, [selectedPerformances]);

  const [showPastPerformances, setShowPastPerformances] = useState(false);
  const [pastPerformances, setPastPerformances] = useState<Performance[]>([]);
  const [page, setPage] = useState(0);
  const [moreLoading, setMoreLoading] = useState(false);
  const [hasMore, setHasMore] = useState(pastPerformances.length === PAST_PAGE_SIZE);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const previousLengthRef = useRef(0);

  const loadMore = useCallback(async () => {
    console.log(moreLoading, hasMore);
    if (moreLoading || !hasMore) return;

    setMoreLoading(true);

    try {
      const nextPage = page + 1;

      const params = new URLSearchParams({
        type: 'past',
        page: String(nextPage),
      });

      const response = await fetch(`/api/performances?${params.toString()}`);

      if (!response.ok) {
        throw new Error('데이터를 불러오지 못했습니다.');
      }

      const data = await response.json();

      previousLengthRef.current = pastPerformances.length;

      setPastPerformances((prev) => [...prev, ...data.items]);

      setPage(nextPage);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error(error);
    } finally {
      setMoreLoading(false);
    }
  }, [page, moreLoading, hasMore, pastPerformances.length]);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadMore();
        }
      },
      {
        rootMargin: `1px 0px`,
      },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [loadMore, hasMore]);

  useFadeUpEffect(
    '.date-picker-header, .date-picker, .selected-date-performance, .upcoming-performances',
  );

  return (
    <div className="sub-page-section performance-list">
      <div className="inner">
        {/* ==================================================
            Calendar Header
        ================================================== */}

        <div className="date-picker-header">
          <div className="date-picker-controls">
            <button
              type="button"
              onClick={handlePreviousMonth}
              disabled={isPreviousMonthDisabled}
              aria-label="이전 달"
            >
              <span className="material-symbols-rounded">keyboard_arrow_left</span>
            </button>
          </div>

          <div className="date-picker-title">
            <h2>{monthTitle}</h2>
          </div>

          <div className="date-picker-controls">
            <button type="button" onClick={handleNextMonth} aria-label="다음 달">
              <span className="material-symbols-rounded">keyboard_arrow_right</span>
            </button>
          </div>
        </div>

        <div className="date-picker-container">
          <DatePicker
            currentDate={currentDate}
            todayKey={todayKey}
            selectedDateKey={selectedDateKey}
            onSelectDate={setSelectedDateKey}
            performancesByDate={performancesByDate}
          />
          {/* ==================================================
              Selected Date
          ================================================== */}
          {/* ================================================== */}

          <div className="selected-date-performance">
            <div className="performance-list-header">
              <div>
                <p>SELECTED</p>
                <h3>
                  {selectedDateKey.slice(5).replace('-', '.')} <span>{selectedWeekday}</span>
                </h3>
              </div>

              <div className="performance-list-count">
                공연 <span>{selectedPerformances.length}</span>
              </div>
            </div>

            {selectedPerformances.length > 0 ? (
              <div className="performance-list-body" ref={listRef}>
                {selectedPerformances.map((performance) => (
                  <PerformanceCard
                    key={performance._id}
                    type="selected"
                    performance={performance}
                  />
                ))}
              </div>
            ) : (
              <div className="no-performance">
                <p>선택한 날짜에 공연이 없습니다.</p>
              </div>
            )}
          </div>
        </div>

        {/* ==================================================
            Upcoming
        ================================================== */}

        <div className="upcoming-performances">
          <div className="performance-list-header">
            <div>
              <p>UPCOMING PERFORMANCE</p>
              <h3>다가오는 공연</h3>
            </div>
          </div>

          {upcomingPerformances.length > 0 ? (
            <div className="performance-list-body">
              {upcomingPerformances.map((performance) => (
                <PerformanceCard key={performance._id} type="upcoming" performance={performance} />
              ))}
            </div>
          ) : (
            <div className="no-performance">
              <p>예정된 공연이 없습니다.</p>
            </div>
          )}
        </div>

        <div className="past-performances">
          {showPastPerformances ? (
            <>
              <div className="performance-list-header">
                <div>
                  <p>PAST PERFORMANCE</p>
                  <h3>지난 공연</h3>
                </div>
              </div>

              <div className="performance-list-body">
                {pastPerformances.map((item) => (
                  <PerformanceCard key={item._id} type="upcoming" performance={item} />
                ))}
              </div>
              {/* 무한스크롤 감지 영역 */}
              {hasMore && !moreLoading && (
                <div ref={sentinelRef} className="performance-list-sentinel" aria-hidden="true" />
              )}
              {moreLoading && <Loading loading={moreLoading} />}
            </>
          ) : (
            <div className="past-performances-button">
              <Button
                size="small"
                onClick={() => {
                  setShowPastPerformances(true);
                  setHasMore(true);
                  loadMore();
                }}
              >
                지난 공연 보기
                <span className="material-symbols-rounded button-icon end-icon">
                  keyboard_arrow_down
                </span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
