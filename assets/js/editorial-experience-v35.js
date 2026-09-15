(() => {
  const body = document.body;
  if (!body?.classList.contains('concept-page')) return;

  const onHome = !!document.querySelector('#finder') && !!document.querySelector('#treatments') && !!document.querySelector('#clinics');
  if (!onHome) return;

  /* Treatment rail controls: drag stays available, but not required. */
  const rail = document.querySelector('#treatments [data-drag-rail]');
  if (rail && !rail.parentElement?.querySelector('.v35-rail-toolbar')) {
    const cards = [...rail.querySelectorAll('.drag-card')];
    const toolbar = document.createElement('div');
    toolbar.className = 'v35-rail-toolbar';
    toolbar.innerHTML = `
      <span class="v35-rail-copy">Browse the main care pathways</span>
      <div class="v35-rail-actions" aria-label="Treatment library controls">
        <button type="button" data-v35-prev aria-label="Previous treatment">←</button>
        <span class="v35-rail-count" aria-live="polite">01 / ${String(cards.length).padStart(2,'0')}</span>
        <button type="button" data-v35-next aria-label="Next treatment">→</button>
      </div>`;
    rail.before(toolbar);

    const count = toolbar.querySelector('.v35-rail-count');
    let current = 0;
    const updateCount = () => {
      if (count) count.textContent = `${String(current + 1).padStart(2,'0')} / ${String(cards.length).padStart(2,'0')}`;
    };
    const go = (index) => {
      if (!cards.length) return;
      current = Math.max(0, Math.min(cards.length - 1, index));
      cards[current].scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', inline: 'start', block: 'nearest' });
      updateCount();
    };
    toolbar.querySelector('[data-v35-prev]')?.addEventListener('click', () => go(current - 1));
    toolbar.querySelector('[data-v35-next]')?.addEventListener('click', () => go(current + 1));

    let frame = 0;
    rail.addEventListener('scroll', () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const railRect = rail.getBoundingClientRect();
        const anchor = railRect.left + Math.min(120, railRect.width * .18);
        let best = { index: current, distance: Infinity };
        cards.forEach((card, index) => {
          const distance = Math.abs(card.getBoundingClientRect().left - anchor);
          if (distance < best.distance) best = { index, distance };
        });
        current = best.index;
        updateCount();
      });
    }, { passive: true });
  }

  /* Replace homepage placeholder doctor art with a verified credential handoff. */
  const doctorGrid = document.querySelector('#doctor .hero-grid');
  if (doctorGrid && !doctorGrid.querySelector('.v35-doctor-card')) {
    const card = document.createElement('article');
    card.className = 'v35-doctor-card';
    card.innerHTML = `
      <div>
        <span class="v35-doctor-label">Your dermatologist</span>
        <h3>Dr. Cheena Langer</h3>
      </div>
      <div class="v35-doctor-meta" aria-label="Doctor credentials and clinic facts">
        <div><strong>MBBS · MD Dermatology</strong><span>Consultant dermatologist</span></div>
        <div><strong>20+ years</strong><span>in medicine</span></div>
        <div><strong>2 Jammu clinics</strong><span>Karan Nagar · Paloura</span></div>
        <div><strong>Diagnosis-led care</strong><span>skin · hair · laser · procedures</span></div>
      </div>`;
    doctorGrid.prepend(card);
  }

  /* Number branch choices without changing the source content. */
  const clinicButtons = [...document.querySelectorAll('#clinics [data-clinic]')];
  clinicButtons.forEach((button, index) => {
    if (button.querySelector('.v35-branch-no')) return;
    const badge = document.createElement('span');
    badge.className = 'v35-branch-no';
    badge.textContent = `0${index + 1}`;
    badge.style.cssText = 'display:block;margin-bottom:9px;font:800 .55rem/1 var(--sans);letter-spacing:.12em;text-transform:uppercase;opacity:.55';
    button.prepend(badge);
  });
})();
