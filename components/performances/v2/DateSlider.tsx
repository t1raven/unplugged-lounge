'use client';

import { useEffect, useRef } from 'react';
import { formatDate } from '@/utils/date';

import type { Performance } from '@/types/performance';

import './DateSlider.scss';

interface Props {
  currentDate: Date;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  performancesByDate: Record<string, Performance[]>;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export default function DateSlider({
  currentDate,
  selectedDate,
  onSelectDate,
  performancesByDate,
}: Props) {
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const selectedItem = itemRefs.current[selectedDate];

    selectedItem?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, [selectedDate]);

  function getMonthDates(year: number, month: number) {
    const lastDay = new Date(year, month, 0).getDate();

    return Array.from({ length: lastDay }, (_, index) => {
      const day = index + 1;
      const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dateObject = new Date(`${date}T00:00:00`);

      return {
        date,
        day,
        weekday: dateObject.getDay(),
      };
    });
  }

  const dates = getMonthDates(currentDate.getUTCFullYear(), currentDate.getUTCMonth() + 1);

  return (
    <div className="date-slider">
      {dates.map((item) => {
        const dateKey = formatDate(item.date);
        const todayKey = formatDate(new Date());
        const isToday = dateKey === todayKey;
        const isSelected = dateKey === selectedDate.replaceAll('-', '.');
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
            onClick={() => onSelectDate(item.date)}
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

            <div className="date-slider__dot">
              {!isPast &&
                dayPerformances.length > 0 &&
                dayPerformances.map((item, index) => <span key={index} />)}
            </div>
          </button>
        );
      })}
    </div>
  );
}
