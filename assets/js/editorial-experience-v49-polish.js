(() => {
  const body = document.body;
  if (!body?.classList.contains('concept-page')) return;
  body.classList.add('v49-public-polish');

  /* Design-only palette controls were useful while prototyping, but should never
     float above the patient-facing website. Keep this defensive because older
     experience layers may have already mounted them before this final bundle runs. */
  const removeDesignTools = () => {
    document.querySelectorAll(
      '.v11-palette-lab,.v12-theme-lab,.v12-mode-badge,[data-theme-lab],[data-palette-lab]'
    ).forEach((el) => el.remove());

    document.querySelectorAll('button').forEach((button) => {
      const label = (button.textContent || '').trim().toLowerCase();
      if (!['colour', 'color', 'palette'].includes(label)) return;
      const parent = button.closest('[class*="palette"],[class*="theme"],[data-theme-lab],[data-palette-lab]');
      const fixed = getComputedStyle(button).position === 'fixed';
      if (parent) parent.remove();
      else if (fixed) button.remove();
    });
  };
  removeDesignTools();

  /* Keep the mobile header compact while preserving the full accessible label. */
  const headerBook = document.querySelector('.v41-header-actions .nav-cta');
  if (headerBook) {
    const fullLabel = headerBook.textContent.trim() || 'Book consultation';
    headerBook.setAttribute('aria-label', fullLabel);
    const media = matchMedia('(max-width: 520px)');
    const syncBookLabel = () => {
      headerBook.textContent = media.matches ? 'Book' : fullLabel;
    };
    syncBookLabel();
    media.addEventListener?.('change', syncBookLabel);
  }

  /* The fixed action bar should disappear when it would cover the footer, and it
     is redundant on the booking page itself. */
  const quickbar = document.querySelector('.v3-quickbar');
  const footer = document.querySelector('.concept-footer');
  if (quickbar) {
    const onBookingPage = location.pathname.replace(/\/+$/, '').endsWith('/book-appointment');
    if (onBookingPage) quickbar.classList.add('is-v49-hidden');
    else if (footer && 'IntersectionObserver' in window) {
      const footerObserver = new IntersectionObserver((entries) => {
        const visible = entries.some((entry) => entry.isIntersecting);
        quickbar.classList.toggle('is-v49-hidden', visible);
      }, { threshold: 0.02 });
      footerObserver.observe(footer);
    }
  }
})();
