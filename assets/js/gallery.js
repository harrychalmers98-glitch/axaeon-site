// ---------- Gallery paging (art / fan art pages) ----------
// Shows the first BATCH artworks, hides the rest, and adds a "Show more"
// button beneath the gallery. The button reveals the next batch when clicked,
// and also triggers itself when it scrolls into view. Nothing in the HTML
// needs to change to add new art: just add another <figure class="artwork">.
(function () {
  const BATCH = 10;

  const gallery = document.querySelector('.gallery');
  if (!gallery) return;

  const items = Array.from(gallery.querySelectorAll('.artwork'));
  if (items.length <= BATCH) return;

  // Hide everything past the first batch, and take the src off those images
  // so the browser doesn't download them until they're revealed.
  let shown = BATCH;
  items.slice(BATCH).forEach(el => {
    el.classList.add('is-hidden');
    const img = el.querySelector('img');
    if (img && img.getAttribute('src')) {
      img.dataset.src = img.getAttribute('src');
      img.removeAttribute('src');
    }
  });

  const wrap = document.createElement('div');
  wrap.className = 'gallery-more';
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn-rune';
  wrap.appendChild(btn);
  gallery.after(wrap);

  function label() {
    btn.textContent = 'Show more (' + (items.length - shown) + ' remaining)';
  }

  let observer = null;
  let inView = false;

  function reveal() {
    items.slice(shown, shown + BATCH).forEach(el => {
      const img = el.querySelector('img');
      if (img && img.dataset.src) {
        img.src = img.dataset.src;
        delete img.dataset.src;
      }
      el.classList.remove('is-hidden');
    });
    shown = Math.min(shown + BATCH, items.length);
    if (shown >= items.length) {
      if (observer) observer.disconnect();
      wrap.remove();
    } else {
      label();
    }
  }

  label();
  btn.addEventListener('click', reveal);

  // ---- Auto-reveal when the button scrolls into view ----
  // Two guards keep this from revealing everything at once on page load:
  //  1. it only becomes active after the visitor has scrolled;
  //  2. it only fires once every currently visible image has finished
  //     loading (before that, images have no height, the gallery is
  //     collapsed, and the button would falsely appear to be "in view").
  if (!('IntersectionObserver' in window)) return;

  function visibleImagesLoaded() {
    return items.slice(0, shown).every(fig => {
      const img = fig.querySelector('img');
      return !img || img.complete;
    });
  }

  function maybeReveal() {
    if (inView && shown < items.length && visibleImagesLoaded()) reveal();
  }

  items.forEach(fig => {
    const img = fig.querySelector('img');
    if (img) img.addEventListener('load', maybeReveal);
  });

  observer = new IntersectionObserver(entries => {
    inView = entries.some(e => e.isIntersecting);
    maybeReveal();
  }, { rootMargin: '200px 0px' });

  window.addEventListener('scroll', () => observer.observe(wrap), { once: true, passive: true });
})();
