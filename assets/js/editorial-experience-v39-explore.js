(() => {
  const body = document.body;
  if (!body?.classList.contains('concept-page')) return;

  const routes = [
    ['Start here','Concerns','Browse skin, hair and medical dermatology concerns','/concept/conditions/'],
    ['Start here','Find your route','Choose an area and concern on the homepage','/concept/#finder'],
    ['Start here','Treatments','Browse the full treatment library','/concept/treatments/'],
    ['Start here','Book consultation','Request an appointment with the clinic','/concept/book-appointment/'],
    ['Common guide','Acne','Active breakouts, marks and acne treatment','/concept/acne-treatment/'],
    ['Common guide','Acne scars','Scar-type planning and procedural options','/concept/acne-scar-treatment/'],
    ['Common guide','Pigmentation','Melasma, marks and uneven tone','/concept/pigmentation-treatment/'],
    ['Common guide','Hair fall','Shedding, thinning and scalp assessment','/concept/hair-fall-treatment/'],
    ['Common guide','Dandruff','Flaking, itch and seborrheic dermatitis','/concept/seborrheic-dermatitis-dandruff/'],
    ['Common guide','Laser hair reduction','Skin type, hair pattern and session planning','/concept/laser-hair-reduction/'],
    ['Clinic','Dr. Cheena Langer','Consultant dermatologist · MBBS · MD Dermatology','/concept/dr-cheena-langer/'],
    ['Clinic','Karan Nagar','Clinic timings, address and directions','/concept/locations/karan-nagar/'],
    ['Clinic','Paloura Chowk','Clinic timings, address and directions','/concept/locations/paloura/'],
    ['Learn','Skin journal','Patient education and dermatology articles','/concept/blog/'],
    ['Clinic','Contact','Phone, WhatsApp and clinic information','/concept/contact/'],
  ].map(([group,label,note,href], id) => ({ id, group, label, note, href }));

  let overlay = null;
  let input = null;
  let results = null;
  let active = 0;
  let matches = routes;
  let previousFocus = null;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const normalize = (value) => String(value || '').trim().toLowerCase();

  const ensureOverlay = () => {
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.className = 'v39-command';
    overlay.hidden = true;
    overlay.innerHTML = `
      <button class="v39-command-backdrop" type="button" aria-label="Close Explore"></button>
      <section class="v39-command-panel" role="dialog" aria-modal="true" aria-labelledby="v39-command-title" tabindex="-1">
        <header class="v39-command-head">
          <div><span>Aastha · Jammu</span><h2 id="v39-command-title">Explore the website</h2></div>
          <button class="v39-command-close" type="button" aria-label="Close Explore">×</button>
        </header>
        <label class="v39-command-search">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.6-3.6"></path></svg>
          <input type="search" role="combobox" aria-expanded="true" aria-autocomplete="list" aria-controls="v39-command-results" placeholder="Search acne, pigmentation, hair, doctor, clinics…" autocomplete="off">
          <kbd>⌘ K</kbd>
        </label>
        <div class="v39-command-results" id="v39-command-results" role="listbox"></div>
        <footer class="v39-command-foot"><span>↑ ↓ navigate</span><span>Enter open</span><span>Esc close</span></footer>
      </section>`;
    document.body.appendChild(overlay);

    input = overlay.querySelector('input');
    results = overlay.querySelector('.v39-command-results');
    overlay.querySelector('.v39-command-backdrop').addEventListener('click', close);
    overlay.querySelector('.v39-command-close').addEventListener('click', close);
    input.addEventListener('input', () => {
      const q = normalize(input.value);
      matches = !q ? routes : routes.filter((route) => normalize(`${route.group} ${route.label} ${route.note}`).includes(q));
      active = 0;
      render();
    });
    input.addEventListener('keydown', (event) => {
      if (!matches.length) return;
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        active = (active + 1) % matches.length;
        render();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        active = (active - 1 + matches.length) % matches.length;
        render();
      } else if (event.key === 'Enter') {
        event.preventDefault();
        openRoute(matches[active]);
      }
    });

    overlay.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== 'Tab') return;
      const panel = overlay.querySelector('.v39-command-panel');
      const focusable = [...panel.querySelectorAll('button:not([disabled]),input:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])')]
        .filter((el) => !el.hidden && el.getAttribute('aria-hidden') !== 'true');
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    render();
    return overlay;
  };

  const render = () => {
    if (!results || !input) return;
    if (!matches.length) {
      results.innerHTML = '<p class="v39-command-empty">No matching route. Try a broader term.</p>';
      input.removeAttribute('aria-activedescendant');
      return;
    }
    results.innerHTML = matches.map((route, index) => `
      <button type="button" class="v39-command-option${index === active ? ' is-active' : ''}" id="v39-command-option-${route.id}" role="option" aria-selected="${index === active}" data-index="${index}">
        <small>${route.group}</small><strong>${route.label}</strong><span>${route.note}</span><i aria-hidden="true">↗</i>
      </button>`).join('');
    input.setAttribute('aria-activedescendant', `v39-command-option-${matches[active].id}`);
    results.querySelectorAll('.v39-command-option').forEach((button) => {
      const index = Number(button.dataset.index);
      button.addEventListener('mouseenter', () => {
        active = index;
        render();
      }, { once: true });
      button.addEventListener('click', () => openRoute(matches[index]));
    });
    results.querySelector('.is-active')?.scrollIntoView({ block: 'nearest' });
  };

  const openRoute = (route) => {
    if (route?.href) location.assign(route.href);
  };

  function open() {
    const command = ensureOverlay();
    if (!command.hidden) return;
    previousFocus = document.activeElement;
    command.hidden = false;
    body.classList.add('v39-command-open');
    input.value = '';
    matches = routes;
    active = 0;
    render();
    requestAnimationFrame(() => {
      const panel = command.querySelector('.v39-command-panel');
      const M = window.Motion;
      if (!reduced && M?.animate) {
        M.animate(command.querySelector('.v39-command-backdrop'), { opacity: [0, 1] }, { duration: .18 });
        M.animate(panel, { opacity: [0, 1], y: [18, 0], scale: [.992, 1] }, { duration: .28, ease: [.22,.72,.24,1] });
      }
      input.focus();
    });
  }

  function close() {
    if (!overlay || overlay.hidden) return;
    body.classList.remove('v39-command-open');
    const finish = () => {
      overlay.hidden = true;
      previousFocus?.focus?.();
    };
    const M = window.Motion;
    if (!reduced && M?.animate) {
      const animation = M.animate(overlay.querySelector('.v39-command-panel'), { opacity: [1, 0], y: [0, 10] }, { duration: .14 });
      Promise.resolve(animation?.finished).then(finish, finish);
    } else finish();
  }

  const nav = document.querySelector('.concept-links');
  if (nav && !nav.querySelector('.v39-explore-trigger')) {
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'v39-explore-trigger';
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.innerHTML = 'Explore <kbd>⌘K</kbd>';
    trigger.addEventListener('click', open);
    nav.appendChild(trigger);
  }

  addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      open();
    }
  });
})();
