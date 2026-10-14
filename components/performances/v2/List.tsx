'use client';

import { useMemo, useState } from 'react';
import { formatDate } from '@/utils/date';
import { useDevice } from '@/components/providers/DeviceProvider';
import useFadeUpEffect from '@/hooks/useFadeUpEffect';

import DatePicker from './DatePicker';
import DateSlider from './DateSlider';
import PerformanceCard from './Card';

import type { Performance } from '@/types/performance';

import './List.scss';

interface Props {
  performances: Performance[];
}

// ==================================================
// Date Helpers
// ==================================================

const formatDateKey = (date: Date) => {
  return formatDate(date).replaceAll('.', '-');
};

/**
 * Sanity datetime → 공연 시각
 */
const getPerformanceDate = (performance: Performance) => {
  return new Date(performance.date);
};

/**
 * 공연의 날짜 Key
 */
const getPerformanceDateKey = (performance: Performance) => {
  return formatDate(performance.date).replaceAll('.', '-');
};

/**
 * 선택 날짜 표시
 */
const formatSelectedDate = (dateKey: string) => {
  const [year, month, day] = dateKey.split('-').map(Number);

  const date = new Date(Date.UTC(year, month - 1, day));

  return {
    year,
    month,
    day,
    weekday: new Intl.DateTimeFormat('ko-KR', {
      weekday: 'long',
    }).format(date),
  };
};

export default function PerformanceCalendar({ performances }: Props) {
  const todayKey = formatDateKey(new Date());

  // 달력의 날짜는 한국 날짜를 담은 UTC 값으로 관리합니다.
  const today = new Date(`${todayKey}T00:00:00Z`);

  const [currentDate, setCurrentDate] = useState(
    () => new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)),
  );

  const monthTitle = `${currentDate.getUTCFullYear()}년 ${currentDate.getUTCMonth() + 1}월`;

  const handlePreviousMonth = () => {
    const previousMonth = new Date(
      Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth() - 1, 1),
    );

    const currentMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));

    // 현재 달보다 이전 달로 이동하지 않음
    if (previousMonth < currentMonth) {
      return;
    }

    setCurrentDate(previousMonth);
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth() + 1, 1)),
    );
  };

  // 선택된 날짜
  const [selectedDate, setSelectedDate] = useState(todayKey);

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
  const selectedDateInfo = formatSelectedDate(selectedDate);

  // ==================================================
  // Upcoming Performances
  // ==================================================

  const upcomingPerformances = performances
    .filter((performance) => {
      if (!performance.date) return false;

      return getPerformanceDateKey(performance) >= todayKey;
    })
    .sort((a, b) => {
      const dateA = getPerformanceDate(a).getTime();
      const dateB = getPerformanceDate(b).getTime();

      return dateA - dateB;
    })
    .slice(0, 12);

  const { isReady, isDesktop } = useDevice();

  useFadeUpEffect(
    '.date-picker-header, .date-picker, .date-slider, .selected-date-performance, .upcoming-performances',
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
              disabled={
                currentDate.getUTCFullYear() === today.getUTCFullYear() &&
                currentDate.getUTCMonth() === today.getUTCMonth()
              }
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
          {isReady && isDesktop ? (
            <DatePicker
              currentDate={currentDate}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              performancesByDate={performancesByDate}
            />
          ) : (
            <DateSlider
              currentDate={currentDate}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              performancesByDate={performancesByDate}
            />
          )}

          {/* ==================================================
              Selected Date
          ================================================== */}

          <div className="selected-date-performance">
            <div className="performance-list-header">
              <div>
                <p>SELECTED DATE</p>
                <h3>
                  {selectedDateInfo.month}.{String(selectedDateInfo.day).padStart(2, '0')}{' '}
                  <span>{selectedDateInfo.weekday}</span>
                </h3>
              </div>

              <div className="performance-list-count">
                공연 <span>{selectedPerformances.length}</span>
              </div>
            </div>

            {selectedPerformances.length > 0 ? (
              <div className="performance-list-body">
                {selectedPerformances.map((performance) => {
                  return (
                    <PerformanceCard
                      key={performance._id}
                      type="selected"
                      performance={performance}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="no-performance">
                <p>공연이 없습니다.</p>
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
              {upcomingPerformances.map((performance) => {
                return (
                  <PerformanceCard
                    key={performance._id}
                    type="upcoming"
                    performance={performance}
                  />
                );
              })}
            </div>
          ) : (
            <div className="no-performance">
              <p>공연이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
