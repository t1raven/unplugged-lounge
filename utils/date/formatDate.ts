import { getDateParts } from './formatter';

export function formatDate(date: Date | string) {
  const { year, month, day } = getDateParts(date);

  return `${year}.${month}.${day}`;
}
