(() => {
  const main = document.querySelector('main');
  if (!main || !document.body.classList.contains('v9-acne-floor')) return;

  /* Utility/index pages may not have the treatment compass. Never leave a quick
     strip pointing at an anchor that does not exist. */
  const ensureId = (el, seed='section') => {
    if (!el) return '';
    if (!el.id) el.id = `v9-${seed}-${Math.random().toString(36).slice(2,7)}`;
    return el.id;
  };
  const fallback = [...main.children].find(el => el.matches('section:not(.editorial-hero):not(.v9-priority-strip)'));
  document.querySelectorAll('.v9-priority-strip a[href="#v9-compass"],.v9-signal-strip a[href="#v9-compass"]').forEach(a => {
    if (document.getElementById('v9-compass')) return;
    const id = ensureId(fallback,'details');
    if (id) a.href = `#${id}`;
    else a.removeAttribute('href');
  });

  /* Keep anchor navigation clear of the sticky navigation + page map. */
  main.querySelectorAll('[id]').forEach(el => {
    if (el.id) el.style.scrollMarginTop = '132px';
  });

  /* The first three priority destinations should remain first in the sticky
     page map even when older scripts rebuild the map after initial load. */
  requestAnimationFrame(() => {
    const map = document.querySelector('.v7-page-map .concept-shell > div');
    if (!map) return;
    const high = [...map.querySelectorAll('a[data-v9-priority="high"]')];
    high.reverse().forEach(a => map.prepend(a));
  });
})();
