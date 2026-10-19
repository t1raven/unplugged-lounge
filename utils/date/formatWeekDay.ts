import { getDateParts } from './formatter';

export function formatWeekDay(date: string | Date, type: 'short' | 'long' = 'long') {
  const { weekday } = getDateParts(date);

  return type === 'short' ? weekday.slice(0, 1) : weekday;
}
