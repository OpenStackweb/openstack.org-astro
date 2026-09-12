// Preserve meaningful labels when historical third-party logos disappear.
for (const image of document.querySelectorAll<HTMLImageElement>(
  '[data-image-fallback], .partner-grid img, .organizations-page img, .member-card .portrait img',
)) {
  const fallback = () => {
    const alternative = image.dataset.fallbackSrc;
    if (alternative && image.getAttribute('src') !== alternative) {
      delete image.dataset.fallbackSrc;
      image.src = alternative;
      return;
    }
    const label = document.createElement('span');
    label.textContent = image.alt;
    label.className = 'image-fallback';
    image.replaceWith(label);
  };
  image.addEventListener('error', fallback);
  if (image.complete && !image.naturalWidth) fallback();
}
