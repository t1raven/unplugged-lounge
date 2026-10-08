export function formatWeekDay(date: string | Date, simple = false) {
  const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const parsedDate = typeof date === 'string' ? new Date(date) : date;

  return simple ? weekdays[parsedDate.getDay()].slice(0, 1) : weekdays[parsedDate.getDay()];
}
