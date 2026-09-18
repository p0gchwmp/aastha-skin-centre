(() => {
  const body = document.body;
  if (!body?.classList.contains('concept-page')) return;

  /* Fix keyboard entry into the treatment rail. */
  const rail = document.querySelector('#treatments [data-drag-rail]');
  if (rail && rail.tabIndex < 0) rail.tabIndex = 0;

  /* Expose the existing Explore palette on mobile without adding a new nav system. */
  const headerShell = document.querySelector('.concept-nav .concept-shell');
  const book = headerShell?.querySelector(':scope > .nav-cta');
  if (headerShell && book && !headerShell.querySelector('.v41-header-actions')) {
    const actions = document.createElement('div');
    actions.className = 'v41-header-actions';

    const explore = document.createElement('button');
    explore.type = 'button';
    explore.className = 'v41-mobile-explore';
    explore.setAttribute('aria-label', 'Explore website');
    explore.setAttribute('aria-haspopup', 'dialog');
    explore.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.6-3.6"></path></svg>';

    headerShell.insertBefore(actions, book);
    actions.append(explore, book);

    explore.addEventListener('click', () => {
      const desktopTrigger = document.querySelector('.v39-explore-trigger');
      desktopTrigger?.click();
    });
  }

  /* Refine the existing command palette into a true combobox model. */
  const observer = new MutationObserver(() => {
    const overlay = document.querySelector('.v39-command');
    if (!overlay || overlay.dataset.v41Combobox === '1') return;
    const input = overlay.querySelector('.v39-command-search input');
    const results = overlay.querySelector('.v39-command-results');
    if (!input || !results) return;

    overlay.dataset.v41Combobox = '1';

    const normalizeOptions = () => {
      const options = [...results.querySelectorAll('.v39-command-option')];
      options.forEach((option) => {
        option.tabIndex = -1;
        option.addEventListener('focus', () => input.focus(), { once: true });
      });
    };

    const resultObserver = new MutationObserver(normalizeOptions);
    resultObserver.observe(results, { childList: true, subtree: true });
    normalizeOptions();

    /* The dialog's focus trap should now cycle only close + search. */
    overlay.addEventListener('keydown', (event) => {
      if (event.key !== 'Tab') return;
      const close = overlay.querySelector('.v39-command-close');
      const focusables = [close, input].filter(Boolean);
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }, true);
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
