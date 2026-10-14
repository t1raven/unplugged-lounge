import { getDateParts } from './formatter';

export function formatTime(date: string | Date) {
  const { hour, minute } = getDateParts(date);

  return `${hour}:${minute}`;
}
