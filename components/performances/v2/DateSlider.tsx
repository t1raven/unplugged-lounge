'use client';

import { useEffect, useRef, useMemo } from 'react';
import { formatDate } from '@/utils/date';

import type { Performance } from '@/types/performance';

import './DateSlider.scss';

interface Props {
  currentDate: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  performancesByDate: Record<string, Performance[]>;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export default function DateSlider({
  currentDate,
  selectedDate,
  onSelectDate,
  performancesByDate,
}: Props) {
  console.log(currentDate, selectedDate);

  const dateSliderDates = useMemo(() => {
    const lastDay = new Date(
      Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth() + 1, 0),
    ).getUTCDate();

    return Array.from({ length: lastDay }, (_, index) => {
      const day = index + 1;
      const date = `${currentDate.getUTCFullYear()}-${String(currentDate.getUTCMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dateObject = new Date(`${date}T00:00:00`);

      return {
        date,
        day,
        weekday: dateObject.getDay(),
      };
    });
  }, [currentDate]);

  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const selectedKey = formatDate(selectedDate);
    const todayKey = formatDate(new Date());
    const hasDate = (dateKey: string) => dateSliderDates.some((item) => item.date === dateKey);

    // 표시 중인 월의 선택일 → 오늘 → 1일 순서로 스크롤합니다.
    const targetKey = hasDate(selectedKey)
      ? selectedKey
      : hasDate(todayKey)
        ? todayKey
        : dateSliderDates[0]?.date;
    const selectedItem = targetKey ? itemRefs.current[targetKey] : null;

    selectedItem?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, [dateSliderDates, selectedDate]);

  return (
    <div className="date-slider">
      {dateSliderDates.map((item) => {
        const dateKey = formatDate(item.date);
        const todayKey = formatDate(new Date());
        const isToday = dateKey === todayKey;
        const isSelected = dateKey === formatDate(selectedDate);
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
              'date-slider__item',
              isToday ? 'is-today' : '',
              isSelected ? 'is-selected' : '',
              isPast ? 'is-past' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-pressed={isSelected}
            onClick={() => onSelectDate(new Date(item.date))}
          >
            <span
              className={[
                'date-slider__weekday',
                item.weekday === 0 ? 'is-sun' : '',
                item.weekday === 6 ? 'is-sat' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {WEEKDAYS[item.weekday]}
            </span>

            <strong className="date-slider__day">{item.day}</strong>

            <div className="date-slider__indicator">
              {!isPast &&
                dayPerformances.length > 0 &&
                dayPerformances.map((item) => <span key={item._id} />)}
            </div>
          </button>
        );
      })}
    </div>
  );
}
