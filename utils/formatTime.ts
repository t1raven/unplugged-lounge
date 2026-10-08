export function formatTime(date: string) {
  const performanceDate = new Date(date);

  const hours = String(performanceDate.getHours()).padStart(2, '0');

  const minutes = String(performanceDate.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
}
