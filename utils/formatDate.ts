export function formatDate(date: string) {
  const performanceDate = new Date(date);

  const month = String(performanceDate.getMonth() + 1).padStart(2, '0');

  const day = String(performanceDate.getDate()).padStart(2, '0');

  return `${month}.${day}`;
}
