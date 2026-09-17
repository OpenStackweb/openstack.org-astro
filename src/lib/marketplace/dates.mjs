// Summit Marketplace supplies Unix seconds. Explicit UTC avoids server/browser day changes.
const formatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
});
export function courseDate(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return 'To be confirmed';
  const date = new Date(seconds * 1000);
  return Number.isFinite(date.valueOf()) ? formatter.format(date) : 'To be confirmed';
}
