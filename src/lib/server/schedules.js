import { renderEditorialBody } from './editorial.mjs';
import { scheduleRoute } from '../schedule-routes.js';
import assets from '../content/schedule-assets.json' with { type: 'json' };

const cache = new Map();
async function dataset(key, fetcher) {
  const path = assets[key];
  if (!path) return null;
  if (!cache.has(path)) {
    const pending = (async () => {
      const response = await fetcher(path);
      if (!response.ok) throw new Error('Archived programme data is temporarily unavailable.');
      return response.json();
    })();
    cache.set(path, pending);
    pending.catch(() => cache.delete(path));
  }
  return cache.get(path);
}

export async function schedulePageFor(path, fetcher, assetBinding, origin) {
  const route = scheduleRoute(path);
  if (!route) return null;
  // Cloudflare's internal binding reads the deployed asset directly. SvelteKit's
  // ordinary server fetch can make a public request for a static file, which
  // reaches the Access login page instead of JSON on protected staging.
  const readAsset = assetBinding
    ? (file) => assetBinding.fetch(new URL(file, origin).href)
    : fetcher;
  const schedule = await dataset(route.key, readAsset);
  if (!schedule) return null;
  const summary = ({ body, learning, materials, attachment, ...event }) => event;
  if (route.kind === 'speaker') {
    const speakers = await dataset('speakers', readAsset);
    const profile = speakers[route.id];
    const related = schedule.events.filter((event) =>
      event.speakers.some((s) => s.id === route.id),
    );
    if (!profile || !related.length) return null;
    const path = `${schedule.path}speakers/${route.id}`;
    return {
      kind: 'speaker',
      schedule: {
        ...schedule,
        events: related.filter((event) => schedule.speakerEventIds.includes(event.id)).map(summary),
      },
      speaker: { ...profile, path, html: renderEditorialBody(profile.body, path) },
    };
  }
  if (route.kind === 'event') {
    const event = schedule.events.find((entry) => entry.id === route.id);
    if (!event) return null;
    return {
      kind: 'event',
      schedule: { ...schedule, events: [] },
      event: {
        ...event,
        html: renderEditorialBody(event.body, event.path),
        learningHtml: renderEditorialBody(event.learning || '', event.path),
      },
    };
  }
  return {
    kind: route.kind,
    schedule:
      route.kind === 'calendar' ? schedule : { ...schedule, events: schedule.events.map(summary) },
  };
}
