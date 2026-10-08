export const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export const weekdayFormatter = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  weekday: 'long',
});

export const timeFormatter = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

export function getDateParts(date: Date | string) {
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  const parts = dateFormatter.formatToParts(parsedDate);

  return {
    year: parts.find((part) => part.type === 'year')!.value,
    month: parts.find((part) => part.type === 'month')!.value,
    day: parts.find((part) => part.type === 'day')!.value,
  };
}
