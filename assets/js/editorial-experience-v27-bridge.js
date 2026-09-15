(() => {
  if (!document.body?.classList.contains('concept-page')) return;
  const path = location.pathname.replace(/\/+$/, '/') || '/';
  const slug = path.split('/').filter(Boolean).pop() || '';
  const safe = value => (value || '').replace(/\s+/g,' ').trim();
  document.addEventListener('aastha:context', event => {
    const value = safe(event.detail?.value);
    if (!value || !slug) return;
    try { sessionStorage.setItem(`aastha-v26-context:${slug}`, value); } catch(e) {}
    const current = document.querySelector('[data-v26-current]');
    if (current) current.textContent = value;
    const href = `/concept/book-appointment/?context=${encodeURIComponent(value)}&from=${encodeURIComponent(slug)}`;
    const direct = document.querySelector('[data-v26-book]');
    if (direct) direct.href = href;
    document.querySelectorAll('a[href^="/concept/book-appointment/"]').forEach(link => {
      if (!link.closest('.v26-drawer')) link.href = href;
    });
  });
})();
