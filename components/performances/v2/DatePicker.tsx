'use client';

import { useMemo, useRef, useEffect } from 'react';
import { useDevice } from '@/components/providers/DeviceProvider';
import Skeleton from '@/components/ui/Skeleton';

import type { Performance } from '@/types/performance';

import './DatePicker.scss';

interface Props {
  currentDate: Date;
  todayKey: string;
  selectedDateKey: string;
  onSelectDate: (dateKey: string) => void;
  performancesByDate: Record<string, Performance[]>;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export default function DatePicker({
  currentDate,
  todayKey,
  selectedDateKey,
  onSelectDate,
  performancesByDate,
}: Props) {
  const { isReady, isDesktop } = useDevice();

  const { datePickerSliderDates, datePickerGridDates } = useMemo(() => {
    const lastDay = new Date(
      Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth() + 1, 0),
    ).getUTCDate();

    const dates = Array.from({ length: lastDay }, (_, index) => {
      const day = index + 1;
      const date = `${currentDate.getUTCFullYear()}-${String(currentDate.getUTCMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dateObject = new Date(
        Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), day),
      );

      return {
        date,
        day,
        weekday: dateObject.getUTCDay(),
      };
    });
    const days: Array<(typeof dates)[number] | null> = [];
    const firstDayIndex = dates[0].weekday;

    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }

    days.push(...dates);

    while (days.length % 7 !== 0) {
      days.push(null);
    }

    return { datePickerSliderDates: dates, datePickerGridDates: days };
  }, [currentDate]);

  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const previousSelectedKey = useRef(selectedDateKey);

  useEffect(() => {
    const hasDate = (dateKey: string) =>
      datePickerSliderDates.some((item) => item.date === dateKey);

    // 표시 중인 월의 선택일 → 오늘 → 1일 순서로 스크롤합니다.
    const targetKey = hasDate(selectedDateKey)
      ? selectedDateKey
      : hasDate(todayKey)
        ? todayKey
        : datePickerSliderDates[0]?.date;
    const selectedItem = targetKey ? itemRefs.current[targetKey] : null;

    const selectedDateChanged = previousSelectedKey.current !== selectedDateKey;

    selectedItem?.scrollIntoView({
      behavior: selectedDateChanged ? 'smooth' : 'instant',
      inline: 'center',
      block: 'nearest',
    });

    previousSelectedKey.current = selectedDateKey;
  }, [datePickerSliderDates, selectedDateKey, todayKey, isReady, isDesktop]);

  return (
    <div className="date-picker">
      {!isReady ? (
        <Skeleton className="date-picker-skeleton" />
      ) : !isDesktop ? (
        <div className="date-picker-slider">
          {datePickerSliderDates.map((item) => {
            const dateKey = item.date;
            const isToday = dateKey === todayKey;
            const isSelected = dateKey === selectedDateKey;
            const isPast = dateKey < todayKey;
            const dayPerformances = performancesByDate[item.date] ?? [];

            return (
              <button
                key={item.date}
                disabled={isPast}
                ref={(element) => {
                  itemRefs.current[item.date] = element;
                }}
                type="button"
                className={[
                  'date-picker-slider__item',
                  isToday ? 'is-today' : '',
                  isSelected ? 'is-selected' : '',
                  isPast ? 'is-past' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-pressed={isSelected}
                onClick={() => onSelectDate(dateKey)}
              >
                <span
                  className={[
                    'date-picker-slider__weekday',
                    item.weekday === 0 ? 'is-sun' : '',
                    item.weekday === 6 ? 'is-sat' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {WEEKDAYS[item.weekday]}
                </span>

                <strong className="date-picker-slider__day">{item.day}</strong>

                <div className="date-picker-slider__indicator">
                  {!isPast &&
                    dayPerformances.length > 0 &&
                    dayPerformances.map((item) => <span key={item._id} />)}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <>
          <div className="date-picker-weekdays">
            {WEEKDAYS.map((weekday) => (
              <div key={weekday} className="date-picker-weekday">
                {weekday}
              </div>
            ))}
          </div>

          <div className="date-picker-grid">
            {datePickerGridDates.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="date-picker-day is-empty"></div>;
              }

              const dateKey = date.date;
              const isToday = dateKey === todayKey;
              const isSelected = dateKey === selectedDateKey;
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
                  aria-pressed={isSelected}
                  onClick={() => onSelectDate(dateKey)}
                >
                  <div className="date-picker-date">{date.day}</div>

                  <div className="date-picker-performance-indicator">
                    {!isPast &&
                      dayPerformances.length > 0 &&
                      dayPerformances.map((item) => <span key={item._id} />)}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
