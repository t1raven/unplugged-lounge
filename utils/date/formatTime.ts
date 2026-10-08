export function formatTime(date: string | Date) {
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  const hours = String(parsedDate.getHours()).padStart(2, '0');
  const minutes = String(parsedDate.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
}
