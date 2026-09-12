import routes from './content/schedule-routes.json' with { type: 'json' };

export function scheduleRoute(path) {
  for (const [base, key] of Object.entries(routes)) {
    if (path === base || path === base.slice(0, -1)) return { key, base, kind: 'schedule' };
    if (!path.startsWith(base)) continue;
    const tail = path.slice(base.length).replace(/\/$/, '');
    if (tail === 'full') return { key, base, kind: 'full' };
    if (tail === 'calendar.ics') return { key, base, kind: 'calendar' };
    const speaker = /^speakers\/(\d+)$/.exec(tail);
    if (speaker) return { key, base, kind: 'speaker', id: Number(speaker[1]) };
    const event = /^events\/(\d+)(?:\/([^/]+))?$/.exec(tail);
    if (event) return { key, base, kind: 'event', id: Number(event[1]) };
  }
  return null;
}
