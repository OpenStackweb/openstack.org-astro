import { storyGroups, storySelection } from './catalog.mjs';

const root = document.querySelector<HTMLElement>('.use-cases');
if (root) {
  const cards = [...root.querySelectorAll<HTMLElement>('[data-story]')];
  const stories = cards.map((card) => JSON.parse(card.dataset.story!));
  const byId = new Map(stories.map((story, index) => [story.id, cards[index]]));
  const groups = root.querySelector<HTMLElement>('[data-groups]')!;
  const input = root.querySelector<HTMLInputElement>('#story-search')!;
  const count = root.querySelector<HTMLElement>('[data-count]')!;
  const clear = root.querySelector<HTMLButtonElement>('.clear')!;
  let display = 'grid';

  function render() {
    const selection = storySelection(location.hash);
    const selected = storyGroups(stories, selection);
    input.value = selection.search || '';
    root!.querySelectorAll<HTMLButtonElement>('[data-view]').forEach((button) => {
      button.setAttribute(
        'aria-pressed',
        String(button.dataset.view === selection.view && !selection.search && !selection.tag),
      );
    });
    const fragment = document.createDocumentFragment();
    for (const group of selected) {
      const section = document.createElement('section');
      section.className = 'story-group';
      if (group.id) section.id = group.id;
      if (group.title) {
        const heading = document.createElement('h2');
        heading.textContent = group.title;
        section.appendChild(heading);
      }
      const grid = document.createElement('div');
      grid.className = `story-cards${display === 'list' ? ' cases-list' : ''}`;
      for (const story of group.stories) grid.appendChild(byId.get(story.id)!);
      section.appendChild(grid);
      fragment.append(section);
    }
    groups.replaceChildren(fragment);
    const total = selected.reduce((sum, group) => sum + group.stories.length, 0);
    const label = total === 1 ? count.dataset.singularLabel : count.dataset.label;
    count.textContent = `${total} ${label}${selection.tag ? ` · ${selection.tag}` : ''}`;
    clear.hidden = !selection.search && !selection.tag;
    root!.querySelector<HTMLElement>('.empty')!.hidden = total !== 0;
    if (selection.section && selection.section !== 'first')
      document.getElementById(selection.section)?.scrollIntoView();
  }
  function select(key: string, value = 'first') {
    const hash = new URLSearchParams({ [key]: value }).toString();
    if (location.hash.slice(1) === hash) render();
    else location.hash = hash;
  }
  root.addEventListener('click', (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>('button');
    if (!button) return;
    if (button.dataset.view) select(button.dataset.view);
    if (button.dataset.tag) {
      select('tag', button.dataset.tag);
      clear.focus();
    }
    if (button.classList.contains('clear')) select('date');
    if (button.dataset.display) {
      display = button.dataset.display;
      root
        .querySelectorAll<HTMLButtonElement>('[data-display]')
        .forEach((item) =>
          item.setAttribute('aria-pressed', String(item.dataset.display === display)),
        );
      groups
        .querySelectorAll('.story-cards')
        .forEach((grid) => grid.classList.toggle('cases-list', display === 'list'));
    }
  });
  root.querySelector('[data-story-search]')!.addEventListener('submit', (event) => {
    event.preventDefault();
    select('search', input.value.trim());
  });
  for (const image of root.querySelectorAll<HTMLImageElement>('.story-image img')) {
    const fallback = () => {
      image.classList.add('image-placeholder');
      image.src = '/images/openstack-logo.svg';
    };
    image.addEventListener('error', fallback, { once: true });
    if (image.complete && !image.naturalWidth) fallback();
  }
  const hero = root.querySelector<HTMLElement>('.cases-hero')!;
  const cover = hero.querySelector<HTMLElement>('.cases-hero-copy')!;
  const poster = hero.querySelector<HTMLImageElement>('img')!;
  const player = hero.querySelector<HTMLElement>('[data-video-player]')!;
  const play = hero.querySelector<HTMLButtonElement>('[data-play-video]')!;
  const close = hero.querySelector<HTMLButtonElement>('.close-video')!;
  play.addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.title = hero.getAttribute('aria-label')!;
    iframe.src = `https://www.youtube-nocookie.com/embed/${hero.dataset.videoId}?autoplay=1`;
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
    iframe.allowFullscreen = true;
    player.insertBefore(iframe, player.firstChild);
    cover.hidden = poster.hidden = true;
    player.hidden = false;
    close.focus();
  });
  close.addEventListener('click', () => {
    player.querySelector('iframe')?.remove();
    player.hidden = true;
    cover.hidden = poster.hidden = false;
    play.focus();
  });
  window.addEventListener('hashchange', render);
  render();
}
