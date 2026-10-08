import { formatDate } from './formatDate';
import { formatWeekDay } from './formatWeekDay';
import { formatTime } from './formatTime';

export function formatDateTime(date: Date | string) {
  const fullDate = formatDate(new Date(date));
  const weekday = formatWeekDay(new Date(date));
  const time = formatTime(new Date(date));

  return `${fullDate} ${weekday} ${time}`;
}
