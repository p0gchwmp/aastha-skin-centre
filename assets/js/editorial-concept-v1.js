(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const progress = document.querySelector('.scroll-progress');
  const updateProgress = () => {
    if (!progress) return;
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = `${max > 0 ? Math.min(100, (scrollY / max) * 100) : 0}%`;
  };
  addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  if (!reduced && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('[data-reveal]').forEach((el) => revealObserver.observe(el));
  } else {
    document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-visible'));
  }

  document.querySelectorAll('[data-drag-rail]').forEach((rail) => {
    let down = false;
    let startX = 0;
    let startScroll = 0;
    rail.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      down = true;
      startX = e.clientX;
      startScroll = rail.scrollLeft;
      rail.classList.add('is-dragging');
      rail.setPointerCapture?.(e.pointerId);
    });
    rail.addEventListener('pointermove', (e) => {
      if (!down) return;
      rail.scrollLeft = startScroll - (e.clientX - startX) * 1.15;
    });
    const stop = () => {
      down = false;
      rail.classList.remove('is-dragging');
    };
    rail.addEventListener('pointerup', stop);
    rail.addEventListener('pointercancel', stop);
    rail.addEventListener('pointerleave', () => {
      if (down) stop();
    });
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
      concernStage.classList.remove('bump');
      requestAnimationFrame(() => concernStage.classList.add('bump'));
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
    }, { rootMargin: '-25% 0px -45% 0px', threshold: [0.1, 0.5, 0.9] });
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

  if (!reduced && matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll('.hero-art').forEach((art) => {
      art.addEventListener('pointermove', (e) => {
        const rect = art.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        art.style.transform = `perspective(900px) rotateY(${x * 3}deg) rotateX(${y * -3}deg)`;
      });
      art.addEventListener('pointerleave', () => { art.style.transform = ''; });
    });
  }
})();
