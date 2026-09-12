// Rich-text embeds are restricted to individual YouTube videos. Other frames
// (including arbitrary HTML, forms and embedded applications) remain excluded.
export function editorialVideo(attributes) {
  try {
    const url = new URL(attributes.src, 'https://www.openstack.org/');
    if (
      !['www.youtube.com', 'youtube.com', 'www.youtube-nocookie.com'].includes(url.hostname) ||
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      url.port ||
      !/^\/embed\/[A-Za-z0-9_-]{11}$/.test(url.pathname)
    )
      return null;
    const start = url.searchParams.get('start');
    return {
      src: `https://www.youtube-nocookie.com${url.pathname}${start && /^\d{1,6}$/.test(start) ? `?start=${start}` : ''}`,
      title:
        typeof attributes.title === 'string' && attributes.title.trim()
          ? attributes.title.slice(0, 250)
          : 'Summit video',
      loading: 'lazy',
      allowfullscreen: '',
      referrerpolicy: 'strict-origin-when-cross-origin',
      allow: 'fullscreen; picture-in-picture',
    };
  } catch {
    return null;
  }
}
