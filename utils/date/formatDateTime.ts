import { formatDate } from './formatDate';
import { formatWeekDay } from './formatWeekDay';
import { formatTime } from './formatTime';

export function formatDateTime(date: Date | string) {
  return `${formatDate(date)} ${formatWeekDay(date)} ${formatTime(date)}`;
}
