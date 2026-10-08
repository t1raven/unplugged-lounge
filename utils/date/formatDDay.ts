export function formatDDay(date: string) {
  const performanceDate = new Date(date);

  const todayDate = new Date();

  // 시간을 제거하고 날짜만 비교
  const today = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());

  const target = new Date(
    performanceDate.getFullYear(),
    performanceDate.getMonth(),
    performanceDate.getDate(),
  );

  const diffTime = target.getTime() - today.getTime();

  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'D-DAY';
  }

  return `D-${diffDays}`;
}
