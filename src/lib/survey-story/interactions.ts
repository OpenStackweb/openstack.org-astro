const storyRoot = document.querySelector('.survey-story');
if (storyRoot) {
  storyRoot.querySelectorAll<HTMLButtonElement>('[data-metric]').forEach((button) => {
    button.addEventListener('click', () => {
      storyRoot
        .querySelectorAll<HTMLButtonElement>('[data-metric]')
        .forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
      storyRoot
        .querySelectorAll<HTMLElement>('[data-panel]')
        .forEach((panel) => (panel.hidden = panel.dataset.panel !== button.dataset.metric));
    });
  });
  const editionSelect = document.getElementById('story-edition');
  if (editionSelect instanceof HTMLSelectElement) {
    editionSelect.addEventListener('change', () => {
      storyRoot
        .querySelectorAll<HTMLElement>('[data-edition]')
        .forEach((panel) => (panel.hidden = panel.dataset.edition !== editionSelect.value));
    });
  }
}
