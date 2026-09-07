// ---------- "Show more" for the Key Streams page ----------
// Shows the first BATCH stream entries (in page order, so newest first) and
// hides the rest behind a "Show more" button beneath the list. The button
// reveals the next batch on click, and also fires itself when scrolled into
// view. A year heading stays hidden until the first entry beneath it is shown.
// To add a stream, just add another <details class="stream-note"> under the
// right year heading — nothing else needs to change.
(function () {
  const BATCH = 10;

  const list = document.querySelector('.stream-list');
  if (!list) return;

  const items = Array.from(list.querySelectorAll('.stream-note'));
  if (items.length <= BATCH) return;

  // Which heading each entry belongs to (the nearest .year-heading above it).
  const headingOf = new Map();
  let current = null;
  Array.from(list.children).forEach(el => {
    if (el.classList.contains('year-heading')) current = el;
    else if (el.classList.contains('stream-note')) headingOf.set(el, current);
  });

  let shown = BATCH;
  items.slice(BATCH).forEach(el => el.classList.add('is-hidden'));
  updateHeadings();

  const wrap = document.createElement('div');
  wrap.className = 'gallery-more';
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn-rune';
  wrap.appendChild(btn);
  list.after(wrap);

  function label() {
    btn.textContent = 'Show more (' + (items.length - shown) + ' remaining)';
  }

  // Hide a year heading if every entry beneath it is hidden.
  function updateHeadings() {
    const visible = new Set();
    items.forEach(el => {
      if (!el.classList.contains('is-hidden')) visible.add(headingOf.get(el));
    });
    list.querySelectorAll('.year-heading').forEach(h => {
      h.classList.toggle('is-hidden', !visible.has(h));
    });
  }

  let observer = null;
  let inView = false;

  function reveal() {
    items.slice(shown, shown + BATCH).forEach(el => el.classList.remove('is-hidden'));
    shown = Math.min(shown + BATCH, items.length);
    updateHeadings();
    if (shown >= items.length) {
      if (observer) observer.disconnect();
      wrap.remove();
    } else {
      label();
    }
  }

  label();
  btn.addEventListener('click', reveal);

  // Auto-reveal when the button scrolls into view, but only once the visitor
  // has actually scrolled (so a short page doesn't reveal everything at once).
  if (!('IntersectionObserver' in window)) return;

  observer = new IntersectionObserver(entries => {
    inView = entries.some(e => e.isIntersecting);
    if (inView && shown < items.length) reveal();
  }, { rootMargin: '200px 0px' });

  window.addEventListener('scroll', () => observer.observe(wrap), { once: true, passive: true });
})();
