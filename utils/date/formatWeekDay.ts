import { getDateParts } from './formatter';

export function formatWeekDay(date: string | Date, simple = false) {
  const { weekday } = getDateParts(date);

  return simple ? weekday.slice(0, 1) : weekday;
}
