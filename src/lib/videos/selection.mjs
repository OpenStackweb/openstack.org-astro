// Eligibility is separate from ranking: channel popularity is not OpenStack relevance.
export const CHANNEL_ID = 'UCQ74G2gKXdpwZkXEsclzcrA';
export const CHANNEL_URL = 'https://www.youtube.com/@OpenInfraFoundation';
export const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
const openstack = /\bopenstack\b/i;
const otherProject =
  /\b(kata(?: containers)?|starlingx|gerrit|zuul|gitbutler|jujutsu|jgit|kubernetes|ceph|terraform|opentofu)\b/i;
const component =
  /\b(nova|neutron|cinder|keystone|glance|ironic|swift|manila|octavia|placement|heat|horizon|kolla|kayobe|magnum|trove|ceilometer|designate)\b/i;
const technicalContext =
  /\b(bare[ -]metal|cloud|compute|networking|storage|identity|load balancing|deployment|orchestration|project updates?|operators?)\b/i;

export function descriptionContext(description = '') {
  // Ignore channel boilerplate, links, hashtag lists and the remainder after them.
  return String(description)
    .split(/\r?\n/)
    .slice(0, 12)
    .filter((line) => !/^\s*(https?:|#|subscribe|follow|learn more at)/i.test(line))
    .join('\n')
    .split(
      /we build communities|this channel features|the open infra(?:structure)? foundation supports|subscribe to (?:our|the) channel/i,
    )[0]
    .slice(0, 800);
}

export function relevance(video, { includeIds = [], excludeIds = [] } = {}) {
  if (!VIDEO_ID.test(video.id || '') || video.channelId !== CHANNEL_ID)
    return 'wrong-channel-or-id';
  if (!video.public || video.live || !Number.isFinite(Date.parse(video.publishedAt)))
    return 'unavailable';
  if (excludeIds.includes(video.id)) return 'editor-excluded';
  if (includeIds.includes(video.id)) return 'editor-included';
  const title = video.title || '';
  if (openstack.test(title)) return 'openstack-title';
  const context = descriptionContext(video.description);
  // Cross-project talks need explicit integration context, not a passing mention.
  if (otherProject.test(title)) {
    const project = title.match(otherProject)[0].toLowerCase();
    const connectsProjects = context
      .split(/[.!?\n]+/)
      .some(
        (sentence) =>
          sentence.toLowerCase().includes(project) &&
          openstack.test(sentence) &&
          /\b(integrat(?:e|es|ed|ing|ion)|running|deploy(?:ing|ment)?|on top of|using|used|with)\b/i.test(
            sentence,
          ),
      );
    return connectsProjects ? 'openstack-integration' : 'other-project';
  }
  if (component.test(title) && (technicalContext.test(title) || openstack.test(context)))
    return 'openstack-component';
  if (video.openstackPlaylist) return 'openstack-playlist';
  if (
    /\b(this (?:talk|session|presentation)|we (?:explore|discuss|demonstrate|present)|learn how)\b/i.test(
      context,
    ) &&
    openstack.test(context)
  )
    return 'openstack-description';
  return 'ambiguous';
}
export const acceptedReason = (reason) =>
  !['wrong-channel-or-id', 'unavailable', 'editor-excluded', 'other-project', 'ambiguous'].includes(
    reason,
  );

export function yearAgo(now) {
  const date = new Date(now);
  const month = date.getUTCMonth();
  date.setUTCFullYear(date.getUTCFullYear() - 1);
  if (date.getUTCMonth() !== month) date.setUTCDate(0);
  return date.getTime();
}

export function selectVideos(videos, options = {}, now = Date.now()) {
  const unique = [...new Map(videos.map((video) => [video.id, video])).values()];
  const eligible = unique.filter(
    (video) => acceptedReason(relevance(video, options)) && Date.parse(video.publishedAt) <= now,
  );
  const byDate = (a, b) =>
    Date.parse(b.publishedAt) - Date.parse(a.publishedAt) || a.id.localeCompare(b.id);
  const recent = [...eligible].sort(byDate).slice(0, 4);
  const recentIds = new Set(recent.map((video) => video.id));
  const popular = eligible
    .filter(
      (video) =>
        Number.isSafeInteger(video.views) &&
        !recentIds.has(video.id) &&
        Date.parse(video.publishedAt) >= yearAgo(now),
    )
    .sort((a, b) => b.views - a.views || byDate(a, b))
    .slice(0, 4);
  return { recent, popular };
}
