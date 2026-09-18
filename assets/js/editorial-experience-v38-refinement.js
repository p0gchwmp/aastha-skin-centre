(() => {
  const body = document.body;
  if (!body?.classList.contains('concept-page')) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const rovingTabs = ({ buttons, panel, orientation = 'horizontal' }) => {
    if (!buttons.length) return;

    const setSelected = (button, { click = false, focus = false } = {}) => {
      buttons.forEach((item) => {
        const selected = item === button;
        item.setAttribute('aria-selected', String(selected));
        item.tabIndex = selected ? 0 : -1;
      });
      if (click) button.click();
      if (focus) button.focus({ preventScroll: true });
    };

    buttons.forEach((button, index) => {
      button.id ||= `v38-tab-${Math.random().toString(36).slice(2, 8)}-${index + 1}`;
      if (panel) {
        panel.id ||= `v38-panel-${Math.random().toString(36).slice(2, 8)}`;
        button.setAttribute('aria-controls', panel.id);
      }

      button.addEventListener('click', () => setSelected(button));
      button.addEventListener('keydown', (event) => {
        const horizontal = orientation === 'horizontal';
        const nextKeys = horizontal ? ['ArrowRight', 'ArrowDown'] : ['ArrowDown', 'ArrowRight'];
        const previousKeys = horizontal ? ['ArrowLeft', 'ArrowUp'] : ['ArrowUp', 'ArrowLeft'];
        let next = null;
        if (nextKeys.includes(event.key)) next = (index + 1) % buttons.length;
        if (previousKeys.includes(event.key)) next = (index - 1 + buttons.length) % buttons.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = buttons.length - 1;
        if (next === null) return;
        event.preventDefault();
        setSelected(buttons[next], { click: true, focus: true });
      });
    });

    const initial = buttons.find((button) => button.getAttribute('aria-selected') === 'true') || buttons[0];
    setSelected(initial);
    if (panel && initial?.id) {
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', initial.id);
      buttons.forEach((button) => button.addEventListener('click', () => {
        if (button.id) panel.setAttribute('aria-labelledby', button.id);
      }));
    }
  };

  /* Concern explorer keeps the existing content controller; v38 adds roving keyboard semantics. */
  rovingTabs({
    buttons: [...document.querySelectorAll('.concern-selector [role="tab"][data-concern]')],
    panel: document.querySelector('[data-concern-stage]'),
    orientation: 'vertical',
  });

  /* Clinic switch: same visual design, correct tab keyboard behavior. */
  rovingTabs({
    buttons: [...document.querySelectorAll('#clinics [role="tab"][data-clinic]')],
    panel: document.querySelector('#clinics [data-clinic-panel]'),
    orientation: 'vertical',
  });

  /* Treatment rail: keyboard navigation and truthful previous/next states. */
  const rail = document.querySelector('#treatments [data-drag-rail]');
  const toolbar = document.querySelector('#treatments .v35-rail-toolbar');
  if (rail && toolbar) {
    const cards = [...rail.querySelectorAll('.drag-card')];
    const previous = toolbar.querySelector('[data-v35-prev]');
    const next = toolbar.querySelector('[data-v35-next]');
    const count = toolbar.querySelector('.v35-rail-count');

    rail.tabIndex ||= 0;
    rail.setAttribute('role', 'region');
    rail.setAttribute('aria-label', 'Treatment library');

    const currentIndex = () => {
      if (!cards.length) return 0;
      const left = rail.getBoundingClientRect().left;
      let best = 0;
      let distance = Infinity;
      cards.forEach((card, index) => {
        const delta = Math.abs(card.getBoundingClientRect().left - left);
        if (delta < distance) {
          distance = delta;
          best = index;
        }
      });
      return best;
    };

    const sync = () => {
      const index = currentIndex();
      if (previous) previous.disabled = index <= 0;
      if (next) next.disabled = index >= cards.length - 1;
      if (count) count.textContent = `${String(index + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
    };

    const go = (index) => {
      const target = Math.max(0, Math.min(cards.length - 1, index));
      cards[target]?.scrollIntoView({
        behavior: reduced ? 'auto' : 'smooth',
        inline: 'start',
        block: 'nearest',
      });
    };

    rail.addEventListener('keydown', (event) => {
      const index = currentIndex();
      if (event.key === 'ArrowRight') { event.preventDefault(); go(index + 1); }
      else if (event.key === 'ArrowLeft') { event.preventDefault(); go(index - 1); }
      else if (event.key === 'Home') { event.preventDefault(); go(0); }
      else if (event.key === 'End') { event.preventDefault(); go(cards.length - 1); }
    });

    let frame = 0;
    rail.addEventListener('scroll', () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        sync();
      });
    }, { passive: true });
    addEventListener('resize', sync, { passive: true });
    sync();
  }

  /* Care journey: preserve the scroll-linked story but expose the active step semantically. */
  const chapters = [...document.querySelectorAll('#approach [data-process-chapter]')];
  const processButtons = [...document.querySelectorAll('#approach [data-process-target]')];
  if (chapters.length && processButtons.length) {
    const activate = (id) => {
      processButtons.forEach((button) => {
        const active = button.dataset.processTarget === id;
        button.classList.toggle('is-active', active);
        if (active) button.setAttribute('aria-current', 'step');
        else button.removeAttribute('aria-current');
      });
    };

    processButtons.forEach((button) => {
      button.addEventListener('click', () => activate(button.dataset.processTarget || ''));
    });

    if ('IntersectionObserver' in window) {
      const ratios = new Map();
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => ratios.set(entry.target.id, entry.intersectionRatio));
        let best = chapters[0]?.id || '';
        let bestRatio = -1;
        chapters.forEach((chapter) => {
          const ratio = ratios.get(chapter.id) || 0;
          if (ratio > bestRatio) {
            best = chapter.id;
            bestRatio = ratio;
          }
        });
        if (bestRatio > 0) activate(best);
      }, {
        rootMargin: '-18% 0px -42% 0px',
        threshold: [0, .15, .35, .55, .75],
      });
      chapters.forEach((chapter) => observer.observe(chapter));
    }

    activate(processButtons.find((button) => button.classList.contains('is-active'))?.dataset.processTarget || chapters[0]?.id || '');
  }
})();
