// Delegated listeners belong to this element, not the initial page DOM. They
// reconnect when Tina replaces an island, and also handle replaced children.
class ArchiveFaq extends HTMLElement {
  private listeners?: AbortController;

  connectedCallback() {
    this.listeners?.abort();
    this.listeners = new AbortController();
    const options = { signal: this.listeners.signal };
    this.addEventListener(
      'input',
      (event) => {
        if (event.target instanceof HTMLInputElement && event.target.id === 'question-search')
          this.filter();
      },
      options,
    );
    this.addEventListener(
      'click',
      (event) => {
        if (!(event.target instanceof Element)) return;
        if (event.target.closest('[data-contact-open]')) {
          const dialog = this.querySelector<HTMLDialogElement>('#faq-contact');
          if (dialog && !dialog.open) dialog.showModal();
        }
        if (event.target.closest('.faq-layout nav a')) {
          const search = this.querySelector<HTMLInputElement>('#question-search');
          if (search) search.value = '';
          this.filter();
        }
      },
      options,
    );
  }

  disconnectedCallback() {
    this.listeners?.abort();
  }

  private filter() {
    const search = this.querySelector<HTMLInputElement>('#question-search');
    const status = this.querySelector<HTMLElement>('[data-faq-count]');
    if (!search || !status) return;
    const term = search.value.trim().toLocaleLowerCase();
    let count = 0;
    this.querySelectorAll<HTMLElement>('[data-faq-category]').forEach((category) => {
      let matches = 0;
      category.querySelectorAll<HTMLElement>('[data-search-text]').forEach((item) => {
        item.hidden = !(item.dataset.searchText || '').includes(term);
        if (!item.hidden) matches++;
      });
      category.hidden = matches === 0;
      count += matches;
    });
    status.hidden = !term;
    status.textContent = count ? `Results (${count})` : 'No results were found.';
  }
}

if (!customElements.get('archive-faq')) customElements.define('archive-faq', ArchiveFaq);
