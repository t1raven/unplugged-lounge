'use client';

import { useMemo, useState } from 'react';
import { urlFor } from '@/sanity/lib/image';
import Image from 'next/image';
import Link from 'next/link';
import useFadeUpEffect from '@/hooks/useFadeUpEffect';

import type { Performance } from '@/types/performance';

import './List.scss';

interface Props {
  performances: Performance[];
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

// ==================================================
// Date Helpers
// ==================================================

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

/**
 * Sanity datetime → 브라우저 로컬 날짜
 */
const getPerformanceDate = (performance: Performance) => {
  return new Date(performance.date);
};

/**
 * 공연의 날짜 Key
 */
const getPerformanceDateKey = (performance: Performance) => {
  return formatDateKey(getPerformanceDate(performance));
};

export default function PerformanceCalendar({ performances }: Props) {
  const today = new Date();

  const todayKey =
    `${today.getFullYear()}-` +
    `${String(today.getMonth() + 1).padStart(2, '0')}-` +
    `${String(today.getDate()).padStart(2, '0')}`;

  /**
   * 공연 시간 표시
   *
   * Sanity datetime:
   * 2026-09-02T19:00:00+09:00
   *
   * → 19:00
   */
  const formatPerformanceTime = (performance: Performance) => {
    const date = getPerformanceDate(performance);

    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(
      2,
      '0',
    )}`;
  };

  /**
   * 선택 날짜 표시
   */
  const formatSelectedDate = (dateKey: string) => {
    const [year, month, day] = dateKey.split('-').map(Number);

    const date = new Date(year, month - 1, day);

    return {
      year,
      month,
      day,
      weekday: WEEKDAYS[date.getDay()],
    };
  };

  const getDDay = (date: string) => {
    const todayDate = new Date();
    const performanceDate = new Date(date);

    const today = getDateOnly(todayDate);
    const target = getDateOnly(performanceDate);

    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'D-DAY';
    }

    return `D-${diffDays}`;
  };

  const getDateOnly = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

  // ==================================================
  // Performance Filter
  // ==================================================

  /**
   * 해당 날짜에 표시할 공연만 반환
   *
   * - 과거 날짜 → 전부 숨김
   * - 오늘 → 현재 시간 이후 공연만 표시
   * - 미래 날짜 → 전부 표시
   */
  /* const getAvailablePerformances = (
    dateKey: string,
    dayPerformances: Performance[]
  ) => {
    // 과거 날짜
    if (dateKey < todayKey) {
      return [];
    }

    // 미래 날짜
    if (dateKey > todayKey) {
      return dayPerformances;
    }

    // 오늘 날짜
    return dayPerformances.filter((performance) => {
      const performanceDate =
        getPerformanceDate(performance);

      return performanceDate > today;
    });
  }; */

  // ==================================================
  // State
  // ==================================================

  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

  // 선택된 날짜
  const [selectedDate, setSelectedDate] = useState(todayKey);

  // ==================================================
  // Month
  // ==================================================

  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const firstDayIndex = firstDayOfMonth.getDay();

  const lastDate = lastDayOfMonth.getDate();

  // ==================================================
  // Calendar Days
  // ==================================================

  const calendarDays = useMemo(() => {
    const days: Array<Date | null> = [];

    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }

    for (let date = 1; date <= lastDate; date++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), date));
    }

    while (days.length % 7 !== 0) {
      days.push(null);
    }

    return days;
  }, [currentDate, firstDayIndex, lastDate]);

  // ==================================================
  // Performances By Date
  // ==================================================

  const performancesByDate = useMemo(() => {
    const grouped: Record<string, Performance[]> = {};

    performances.forEach((performance) => {
      if (!performance.date) return;

      const dateKey = getPerformanceDateKey(performance);

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }

      grouped[dateKey].push(performance);
    });

    return grouped;
  }, [performances]);

  // ==================================================
  // Selected Performances
  // ==================================================

  const selectedPerformances = performancesByDate[selectedDate] ?? [];
  /* const selectedPerformances =
    getAvailablePerformances(
      selectedDate,
      performancesByDate[selectedDate] ?? []
    ); */

  const selectedDateInfo = formatSelectedDate(selectedDate);

  // ==================================================
  // Month Navigation
  // ==================================================

  const handlePreviousMonth = () => {
    const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);

    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // 현재 달보다 이전 달로 이동하지 않음
    if (previousMonth < currentMonth) {
      return;
    }

    setCurrentDate(previousMonth);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));

    setSelectedDate(todayKey);
  };

  // ==================================================
  // Select Date
  // ==================================================

  const handleSelectDate = (date: Date) => {
    const dateKey = formatDateKey(date);

    // 오늘 이전 날짜 선택 불가
    if (dateKey < todayKey) {
      return;
    }

    setSelectedDate(dateKey);
  };

  // ==================================================
  // Month Title
  // ==================================================

  const monthTitle = `${currentDate.getFullYear()}년 ` + `${currentDate.getMonth() + 1}월`;

  // ==================================================
  // Upcoming Performances
  // ==================================================

  const upcomingPerformances = performances
    .filter((performance) => {
      if (!performance.date) return false;

      return getDateOnly(getPerformanceDate(performance)) > getDateOnly(today);
    })
    .sort((a, b) => {
      const dateA = getPerformanceDate(a).getTime();
      const dateB = getPerformanceDate(b).getTime();

      return dateA - dateB;
    })
    .slice(0, 12);

  useFadeUpEffect('.calendar-container, .selected-date-performance, .upcoming-performances');

  return (
    <div className="sub-page-section performance-calendar">
      <div className="inner">
        <div className="calendar-container">
          {/* ==================================================
              Calendar Header
          ================================================== */}

          <div className="calendar-header">
            <div className="calendar-title">
              <h2>{monthTitle}</h2>
            </div>

            <div className="calendar-controls">
              {!(
                currentDate.getFullYear() === today.getFullYear() &&
                currentDate.getMonth() === today.getMonth()
              ) && (
                <button
                  type="button"
                  onClick={handlePreviousMonth}
                  disabled={
                    currentDate.getFullYear() === today.getFullYear() &&
                    currentDate.getMonth() === today.getMonth()
                  }
                  aria-label="이전 달"
                >
                  <span className="material-symbols-rounded">keyboard_arrow_left</span>
                </button>
              )}
              <button type="button" className="today-button" onClick={handleToday}>
                오늘
              </button>

              <button type="button" onClick={handleNextMonth} aria-label="다음 달">
                <span className="material-symbols-rounded">keyboard_arrow_right</span>
              </button>
            </div>
          </div>

          {/* ==================================================
              Weekdays
          ================================================== */}

          <div className="calendar-weekdays">
            {WEEKDAYS.map((weekday) => (
              <div key={weekday} className="calendar-weekday">
                {weekday}
              </div>
            ))}
          </div>

          {/* ==================================================
              Calendar
          ================================================== */}

          <div className="calendar-grid">
            {calendarDays.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="calendar-day is-empty" />;
              }

              const dateKey = formatDateKey(date);

              const dayPerformances = performancesByDate[dateKey] ?? [];
              /* const dayPerformances =
                  getAvailablePerformances(
                    dateKey,
                    performancesByDate[
                      dateKey
                    ] ?? []
                  ); */

              const isToday = dateKey === todayKey;

              const isSelected = dateKey === selectedDate;

              const isPast = dateKey < todayKey;

              return (
                <button
                  key={dateKey}
                  type="button"
                  disabled={isPast}
                  className={[
                    'calendar-day',
                    isToday ? 'is-today' : '',
                    isSelected ? 'is-selected' : '',
                    isPast ? 'is-past' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => handleSelectDate(date)}
                >
                  <div className="calendar-date">
                    <span>{date.getDate()}</span>
                  </div>

                  {/* 
                      오늘은 지난 공연을 제외한
                      실제 예정 공연이 있을 때만 표시
                    */}
                  {!isPast && dayPerformances.length > 0 && (
                    <div className="calendar-performance-indicator">
                      {dayPerformances.map((item, index) => (
                        <span key={index} />
                      ))}

                      {/*{dayPerformances.length >
                            1 && (
                            <small>
                              {
                                dayPerformances.length
                              }
                            </small>
                          )}*/}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ==================================================
            Selected Date
        ================================================== */}

        <div className="selected-date-performance">
          <div className="performance-list-header">
            <div>
              <p>SELECTED DATE</p>

              <h3>
                {selectedDateInfo.month}.{String(selectedDateInfo.day).padStart(2, '0')}{' '}
                <span>
                  {selectedDateInfo.weekday}
                  요일
                </span>
              </h3>
            </div>

            <div className="performance-list-count">
              공연 <span>{selectedPerformances.length}</span>
            </div>
          </div>

          {selectedPerformances.length > 0 ? (
            <div className="performance-list">
              {selectedPerformances.map((performance) => {
                const slug = performance.slug?.current;

                const content = (
                  <>
                    <div className="performance-time">{formatPerformanceTime(performance)}</div>

                    <div className="performance-poster">
                      {performance.poster?.asset && (
                        <Image
                          src={urlFor(performance.poster).width(100).url()}
                          alt={performance.title}
                          fill
                          priority
                          sizes="(max-width: 768px) 25vw, 100px"
                        />
                      )}
                    </div>

                    <div className="performance-info">
                      <strong>{performance.title}</strong>

                      {performance.artists && performance.artists.length > 0 && (
                        <span>{performance.artists.map((artist) => artist.name).join(' · ')}</span>
                      )}
                    </div>

                    <span className="performance-arrow">
                      <span className="material-symbols-rounded">arrow_forward_ios</span>
                    </span>
                  </>
                );

                if (!slug) {
                  return (
                    <div key={performance._id} className="performance-item">
                      {content}
                    </div>
                  );
                }

                return (
                  <Link
                    key={performance._id}
                    href={`/performances/${slug}`}
                    className="performance-item"
                  >
                    {content}
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="no-performance">
              <p>선택한 날짜에는 예정된 공연이 없습니다.</p>
            </div>
          )}
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
            <div className="performance-list">
              {upcomingPerformances.map((performance) => {
                const slug = performance.slug?.current;

                const date = getPerformanceDate(performance);

                const month = date.getMonth() + 1;

                const day = date.getDate();

                const weekday = WEEKDAYS[date.getDay()];

                const content = (
                  <>
                    <div className="performance-date">
                      <strong>
                        {month}.{String(day).padStart(2, '0')}
                      </strong>

                      <span>
                        {weekday} {formatPerformanceTime(performance)}
                      </span>
                    </div>

                    <div className="performance-poster">
                      {performance.poster?.asset && (
                        <Image
                          src={urlFor(performance.poster).width(100).url()}
                          alt={performance.title}
                          fill
                          priority
                          sizes="(max-width: 768px) 25vw, 100px"
                        />
                      )}
                    </div>

                    <div className="performance-info">
                      <div>
                        <em>{getDDay(performance.date)}</em>
                      </div>

                      <strong>{performance.title}</strong>

                      {performance.artists && performance.artists.length > 0 && (
                        <span>{performance.artists.map((artist) => artist.name).join(' · ')}</span>
                      )}
                    </div>

                    <span className="performance-arrow">
                      <span className="material-symbols-rounded">arrow_forward_ios</span>
                    </span>
                  </>
                );

                if (!slug) {
                  return (
                    <div key={performance._id} className="performance-item">
                      {content}
                    </div>
                  );
                }

                return (
                  <Link
                    key={performance._id}
                    href={`/performances/${slug}`}
                    className="performance-item"
                  >
                    {content}
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="no-performance">
              <p>현재 예정된 공연이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
