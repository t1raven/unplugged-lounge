'use client';

import { useMemo } from 'react';
import { formatDate } from '@/utils/date';

import type { Performance } from '@/types/performance';

import './DatePicker.scss';

interface Props {
  currentDate: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  performancesByDate: Record<string, Performance[]>;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export default function DatePicker({
  currentDate,
  selectedDate,
  onSelectDate,
  performancesByDate,
}: Props) {
  console.log(currentDate, selectedDate);

  const datePickerDates = useMemo(() => {
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
      <div className="date-picker-weekdays">
        {WEEKDAYS.map((weekday) => (
          <div key={weekday} className="date-picker-weekday">
            {weekday}
          </div>
        ))}
      </div>

      <div className="date-picker-grid">
        {datePickerDates.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="date-picker-day is-empty"></div>;
          }

          const dateKey = formatDate(date);
          const todayKey = formatDate(new Date());
          const isToday = dateKey === todayKey;
          const isSelected = dateKey === formatDate(selectedDate);
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
              onClick={() => onSelectDate(date)}
            >
              <div className="date-picker-date">{date.getUTCDate()}</div>

              <div className="date-picker-performance-indicator">
                {!isPast &&
                  dayPerformances.length > 0 &&
                  dayPerformances.map((item) => <span key={item._id} />)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
