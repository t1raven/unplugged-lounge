'use client';

import { useMemo, useState } from 'react';
import { formatDate } from '@/utils/date';
import useFadeUpEffect from '@/hooks/useFadeUpEffect';

import DatePicker from './DatePicker';
import PerformanceCard from './Card';

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
    weekday: WEEKDAYS[date.getUTCDay()],
  };
};

export default function PerformanceCalendar({ performances }: Props) {
  const todayKey = formatDateKey(new Date());

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

  useFadeUpEffect('.date-picker, .selected-date-performance, .upcoming-performances');

  return (
    <div className="sub-page-section performance-list">
      <div className="inner">
        <div className="date-picker-container">
          <DatePicker
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            performancesByDate={performancesByDate}
          />

          {/* ==================================================
              Selected Date
          ================================================== */}

          <div className="selected-date-performance">
            <div className="performance-list-header">
              <div>
                {/* <p>SELECTED DATE</p> */}
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
                <p>선택한 날짜에는 예정된 공연이 없습니다.</p>
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
              <p>현재 예정된 공연이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
