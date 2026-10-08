import { timeFormatter } from './formatter';

export function formatTime(date: string | Date) {
  const parts = timeFormatter.formatToParts(typeof date === 'string' ? new Date(date) : date);
  const hours = parts.find((part) => part.type === 'hour')!.value;
  const minutes = parts.find((part) => part.type === 'minute')!.value;

  return `${hours}:${minutes}`;
}
