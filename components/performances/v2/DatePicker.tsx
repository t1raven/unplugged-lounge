'use client';

import { useMemo } from 'react';
import { formatDate } from '@/utils/date';

import type { Performance } from '@/types/performance';

import './DatePicker.scss';

interface Props {
  currentDate: Date;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  performancesByDate: Record<string, Performance[]>;
}

// ==================================================
// Date Helpers
// ==================================================

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const formatDateKey = (date: Date) => {
  return formatDate(date).replaceAll('.', '-');
};

export default function DatePicker({
  currentDate,
  selectedDate,
  onSelectDate,
  performancesByDate,
}: Props) {
  const todayKey = formatDateKey(new Date());

  const handleSelectDate = (date: Date) => {
    const dateKey = formatDateKey(date);

    // 오늘 이전 날짜 선택 불가
    if (dateKey < todayKey) {
      return;
    }

    onSelectDate(dateKey);
  };

  // ==================================================
  // Calendar Days
  // ==================================================

  const calendarDays = useMemo(() => {
    const days: Array<Date | null> = [];
    const firstDayIndex = new Date(
      Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), 1),
    ).getUTCDay();
    const lastDate = new Date(
      Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth() + 1, 0),
    ).getUTCDate();

    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }

    for (let date = 1; date <= lastDate; date++) {
      days.push(new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), date)));
    }

    while (days.length % 7 !== 0) {
      days.push(null);
    }

    return days;
  }, [currentDate]);

  return (
    <div className="date-picker">
      {/* ==================================================
          Weekdays
      ================================================== */}

      <div className="date-picker-weekdays">
        {WEEKDAYS.map((weekday) => (
          <div key={weekday} className="date-picker-weekday">
            {weekday}
          </div>
        ))}
      </div>

      {/* ==================================================
          Calendar
      ================================================== */}

      <div className="date-picker-grid">
        {calendarDays.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="date-picker-day is-empty"></div>;
          }

          const dateKey = formatDateKey(date);
          const isToday = dateKey === todayKey;
          const isSelected = dateKey === selectedDate;
          const isPast = dateKey < todayKey;

          const dayPerformances = performancesByDate[dateKey] ?? [];

          return (
            <button
              key={dateKey}
              type="button"
              disabled={isPast}
              className={[
                'date-picker-day',
                isToday ? 'is-today' : '',
                isSelected ? 'is-selected' : '',
                isPast ? 'is-past' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => handleSelectDate(date)}
            >
              <div className="date-picker-date">
                <span>{date.getUTCDate()}</span>
              </div>

              {/* 
                오늘은 지난 공연을 제외한
                실제 예정 공연이 있을 때만 표시
              */}
              <div className="date-picker-performance-indicator">
                {!isPast &&
                  dayPerformances.length > 0 &&
                  dayPerformances.map((item, index) => <span key={index} />)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
