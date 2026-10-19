import { getDateParts } from './formatter';

export function formatDateTime(date: Date | string) {
  const { year, month, day, weekday, hour, minute } = getDateParts(date);

  return `${year}.${month}.${day} ${weekday} ${hour}:${minute}`;
}
