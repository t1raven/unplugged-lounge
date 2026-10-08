import { getDateParts } from './formatter';

export function formatDDay(date: string) {
  const { year: todayYear, month: todayMonth, day: todayDay } = getDateParts(new Date());
  const { year, month, day } = getDateParts(date);

  // 한국 날짜를 UTC 기준으로 비교해 실행 환경의 시간대와 서머타임 영향을 제거합니다.
  const today = Date.UTC(Number(todayYear), Number(todayMonth) - 1, Number(todayDay));
  const target = Date.UTC(Number(year), Number(month) - 1, Number(day));
  const diffTime = target - today;

  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'D-DAY';
  }

  return `D-${diffDays}`;
}
