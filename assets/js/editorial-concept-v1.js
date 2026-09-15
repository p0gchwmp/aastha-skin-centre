(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const progress = document.querySelector('.scroll-progress');
  let progressRAF = 0;
  const updateProgress = () => {
    progressRAF = 0;
    if (!progress) return;
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = `${max > 0 ? Math.min(100, (scrollY / max) * 100) : 0}%`;
  };
  const requestProgress = () => {
    if (!progressRAF) progressRAF = requestAnimationFrame(updateProgress);
  };
  addEventListener('scroll', requestProgress, { passive: true });
  addEventListener('resize', requestProgress, { passive: true });
  updateProgress();

  if (!reduced && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('[data-reveal]').forEach((el) => revealObserver.observe(el));
  } else {
    document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-visible'));
  }

  /* Click-safe drag rail: normal clicks navigate; dragging only starts after movement. */
  document.querySelectorAll('[data-drag-rail]').forEach((rail) => {
    let pointerId = null;
    let startX = 0;
    let startScroll = 0;
    let dragging = false;
    let moved = false;
    let raf = 0;
    let nextScroll = 0;

    rail.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      pointerId = event.pointerId;
      startX = event.clientX;
      startScroll = rail.scrollLeft;
      dragging = false;
      moved = false;
    });

    rail.addEventListener('pointermove', (event) => {
      if (pointerId !== event.pointerId) return;
      const delta = event.clientX - startX;
      if (!dragging && Math.abs(delta) < 7) return;
      if (!dragging) {
        dragging = true;
        moved = true;
        rail.classList.add('is-dragging');
        rail.setPointerCapture?.(pointerId);
      }
      nextScroll = startScroll - delta;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          rail.scrollLeft = nextScroll;
          raf = 0;
        });
      }
    }, { passive: true });

    const stop = (event) => {
      if (pointerId !== null && event?.pointerId != null && event.pointerId !== pointerId) return;
      if (pointerId !== null) rail.releasePointerCapture?.(pointerId);
      pointerId = null;
      dragging = false;
      rail.classList.remove('is-dragging');
      setTimeout(() => { moved = false; }, 0);
    };
    rail.addEventListener('pointerup', stop);
    rail.addEventListener('pointercancel', stop);

    /* Suppress the click only when the gesture was genuinely a drag. */
    rail.addEventListener('click', (event) => {
      if (!moved) return;
      event.preventDefault();
      event.stopPropagation();
      moved = false;
    }, true);
  });

  const concernStage = document.querySelector('[data-concern-stage]');
  const concernButtons = [...document.querySelectorAll('[data-concern]')];
  if (concernStage && concernButtons.length) {
    const title = concernStage.querySelector('[data-concern-title]');
    const copy = concernStage.querySelector('[data-concern-copy]');
    const link = concernStage.querySelector('[data-concern-link]');
    const activate = (button) => {
      concernButtons.forEach((b) => b.setAttribute('aria-selected', String(b === button)));
      if (title) title.textContent = button.dataset.title || '';
      if (copy) copy.textContent = button.dataset.copy || '';
      if (link) link.href = button.dataset.href || '#';
      concernStage.style.background = button.dataset.background || '';
    };
    concernButtons.forEach((button) => {
      button.addEventListener('click', () => activate(button));
      button.addEventListener('mouseenter', () => {
        if (matchMedia('(hover:hover)').matches) activate(button);
      });
    });
  }

  const clinicPanel = document.querySelector('[data-clinic-panel]');
  const clinicButtons = [...document.querySelectorAll('[data-clinic]')];
  if (clinicPanel && clinicButtons.length) {
    const name = clinicPanel.querySelector('[data-clinic-name]');
    const address = clinicPanel.querySelector('[data-clinic-address]');
    const hours = clinicPanel.querySelector('[data-clinic-hours]');
    const directions = clinicPanel.querySelector('[data-clinic-directions]');
    const details = clinicPanel.querySelector('[data-clinic-details]');
    const activateClinic = (button) => {
      clinicButtons.forEach((b) => b.setAttribute('aria-selected', String(b === button)));
      if (name) name.textContent = button.dataset.name || '';
      if (address) address.textContent = button.dataset.address || '';
      if (hours) hours.innerHTML = button.dataset.hours || '';
      if (directions) directions.href = button.dataset.directions || '#';
      if (details) details.href = button.dataset.details || '#';
    };
    clinicButtons.forEach((button) => button.addEventListener('click', () => activateClinic(button)));
  }

  const timelineSteps = [...document.querySelectorAll('.timeline-step')];
  const timelineSticky = document.querySelector('.timeline-sticky');
  if (timelineSteps.length && timelineSticky && 'IntersectionObserver' in window) {
    const stickyTitle = timelineSticky.querySelector('[data-timeline-title]');
    const stickyCopy = timelineSticky.querySelector('[data-timeline-copy]');
    const timelineObserver = new IntersectionObserver((entries) => {
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      timelineSteps.forEach((step) => step.classList.toggle('is-active', step === visible.target));
      if (stickyTitle) stickyTitle.textContent = visible.target.dataset.title || '';
      if (stickyCopy) stickyCopy.textContent = visible.target.dataset.copy || '';
    }, { rootMargin: '-25% 0px -45% 0px', threshold: [0.1, 0.5] });
    timelineSteps.forEach((step) => timelineObserver.observe(step));
  }

  const patternStage = document.querySelector('[data-pattern-stage]');
  const patternButtons = [...document.querySelectorAll('[data-pattern]')];
  if (patternStage && patternButtons.length) {
    const title = patternStage.querySelector('[data-pattern-title]');
    const copy = patternStage.querySelector('[data-pattern-copy]');
    const note = patternStage.querySelector('[data-pattern-note]');
    const activatePattern = (button) => {
      patternButtons.forEach((b) => b.setAttribute('aria-selected', String(b === button)));
      if (title) title.textContent = button.dataset.title || '';
      if (copy) copy.textContent = button.dataset.copy || '';
      if (note) note.textContent = button.dataset.note || '';
    };
    patternButtons.forEach((button) => button.addEventListener('click', () => activatePattern(button)));
  }
})();
