import { weekdayFormatter } from './formatter';

export function formatWeekDay(date: string | Date, simple = false) {
  const weekday = weekdayFormatter.format(typeof date === 'string' ? new Date(date) : date);
  return simple ? weekday.slice(0, 1) : weekday;
}
