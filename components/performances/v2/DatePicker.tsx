'use client';

import { useMemo, useState } from 'react';
import { formatDate } from '@/utils/date';

import type { Performance } from '@/types/performance';

import './DatePicker.scss';

interface Props {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  performancesByDate: Record<string, Performance[]>;
}

// ==================================================
// Date Helpers
// ==================================================

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const formatDateKey = (date: Date) => {
  return formatDate(date).replaceAll('.', '-');
};

export default function DatePicker({ selectedDate, setSelectedDate, performancesByDate }: Props) {
  const todayKey = formatDateKey(new Date());
  // 달력의 날짜는 한국 날짜를 담은 UTC 값으로 관리합니다.
  const today = new Date();

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

  const handleToday = () => {
    setCurrentDate(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)));

    setSelectedDate(todayKey);
  };

  const handleSelectDate = (date: Date) => {
    const dateKey = formatDateKey(date);

    // 오늘 이전 날짜 선택 불가
    if (dateKey < todayKey) {
      return;
    }

    setSelectedDate(dateKey);
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
          Calendar Header
      ================================================== */}

      <div className="date-picker-header">
        <div className="date-picker-title">
          <h2>{monthTitle}</h2>
        </div>

        <div className="date-picker-controls">
          {!(
            currentDate.getUTCFullYear() === today.getUTCFullYear() &&
            currentDate.getUTCMonth() === today.getUTCMonth()
          ) && (
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
            return <div key={`empty-${index}`} className="date-picker-day is-empty" />;
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
              {!isPast && dayPerformances.length > 0 && (
                <div className="date-picker-performance-indicator">
                  {dayPerformances.map((item, index) => (
                    <span key={index} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
