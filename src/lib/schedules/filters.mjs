export function eventDay(event, timeZone) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(event.start * 1000));
  const part = (type) => parts.find((item) => item.type === type).value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

const selected = (selection, value) =>
  !selection?.length || (Array.isArray(selection) ? selection : [selection]).includes(value);
const intersects = (selection, values) =>
  !selection?.length ||
  (Array.isArray(selection) ? selection : [selection]).some((value) => values.includes(value));

export function filterEvents(schedule, filters) {
  const term = (filters.query || '').trim().toLocaleLowerCase();
  return schedule.events
    .filter(
      (event) =>
        (!filters.day || eventDay(event, schedule.timeZone) === filters.day) &&
        selected(filters.track, event.track) &&
        selected(filters.room, event.room) &&
        selected(filters.type, event.type) &&
        selected(filters.level, event.level) &&
        intersects(filters.tag, event.tags) &&
        intersects(filters.group, event.groups || []) &&
        (!term ||
          [event.title, ...event.speakers.map((s) => s.name), schedule.tracks[event.track] || '']
            .join(' ')
            .toLocaleLowerCase()
            .includes(term))
    )
    .sort((a, b) => a.start - b.start || a.title.localeCompare(b.title));
}

export function eventTime(event, timeZone) {
  const format = new Intl.DateTimeFormat('en', {
    timeZone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
  const end = new Intl.DateTimeFormat('en', { timeZone, hour: 'numeric', minute: '2-digit' });
  return `${format.format(new Date(event.start * 1000))} – ${end.format(new Date(event.end * 1000))}`;
}
