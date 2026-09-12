const escape = (value) =>
  String(value || '')
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
const date = (seconds) =>
  new Date(seconds * 1000)
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z');
function fold(line) {
  let output = '',
    width = 0;
  for (const character of line) {
    const bytes = new TextEncoder().encode(character).length;
    if (width + bytes > 75) {
      output += '\r\n ';
      width = 1;
    }
    output += character;
    width += bytes;
  }
  return output;
}
export function scheduleCalendar(schedule, eventId = null) {
  const events =
    eventId === null ? schedule.events : schedule.events.filter((event) => event.id === eventId);
  if (!events.length) return null;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//OpenStack//Summit archive//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escape(schedule.title)}`,
  ];
  for (const event of events)
    lines.push(
      'BEGIN:VEVENT',
      `UID:summit-${schedule.id}-event-${event.id}@openstack.org`,
      `DTSTAMP:${date(event.start)}`,
      `DTSTART:${date(event.start)}`,
      `DTEND:${date(event.end)}`,
      `SUMMARY:${escape(event.title)}`,
      `LOCATION:${escape(schedule.rooms[event.room]?.name || '')}`,
      `URL:https://www.openstack.org${event.path}`,
      'END:VEVENT'
    );
  lines.push('END:VCALENDAR');
  return lines.map(fold).join('\r\n') + '\r\n';
}
