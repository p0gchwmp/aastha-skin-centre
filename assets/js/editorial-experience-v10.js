(() => {
  const body = document.body;
  if (!body || !body.classList.contains('concept-page')) return;
  body.classList.add('v10-polish');

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer:fine)').matches;
  const path = location.pathname;

  /* Restrained page-family accents. Same brand, slightly different clinical mood. */
  const accents = [
    [/acne|scar|mnrf|fractional-co2/, '#b98582', '185,133,130'],
    [/pigment|melasma|freckles|dark-circles|dark-lips|q-switched|chemical-peels|ipl|sun-damage/, '#9b8399', '155,131,153'],
    [/hair|alopecia|seborrheic/, '#83937f', '131,147,127'],
    [/laser-hair|tattoo|hifu|rf-skin/, '#b68a61', '182,138,97'],
    [/eczema|psoriasis|urticaria|fungal|vitiligo|rosacea|lichen-planus|contact-dermatitis/, '#7f9398', '127,147,152'],
    [/botulinum|fillers|hydrafacial|medifacial/, '#b98272', '185,130,114'],
    [/dr-cheena|locations|book-appointment|contact/, '#b99a75', '185,154,117']
  ];
  const accent = accents.find(([re]) => re.test(path)) || [null, '#b68a61', '182,138,97'];
  body.style.setProperty('--v10-accent', accent[1]);
  body.style.setProperty('--v10-accent-rgb', accent[2]);
  body.style.setProperty('--v10-accent-soft', `color-mix(in srgb, ${accent[1]} 62%, #f4e5d5 38%)`);

  /* Section line choreography. No content movement or reordering. */
  const sections = [...document.querySelectorAll('.editorial-section')];
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => entry.target.classList.toggle('v10-inview', entry.isIntersecting));
    }, { rootMargin: '-8% 0px -72% 0px', threshold: 0 });
    sections.forEach(section => sectionObserver.observe(section));
  } else {
    sections.forEach(section => section.classList.add('v10-inview'));
  }

  /* Subtle 3D hero depth on desktop pointer devices. */
  if (!reduced && finePointer) {
    document.querySelectorAll('.editorial-hero .hero-art').forEach((art) => {
      art.addEventListener('pointermove', (event) => {
        const rect = art.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
        art.style.setProperty('--v10-rx', `${(x - .5) * 5}deg`);
        art.style.setProperty('--v10-ry', `${(.5 - y) * 5}deg`);
        art.style.setProperty('--v10-mx', `${x * 100}%`);
        art.style.setProperty('--v10-my', `${y * 100}%`);
      }, { passive: true });
      art.addEventListener('pointerleave', () => {
        art.style.setProperty('--v10-rx', '0deg');
        art.style.setProperty('--v10-ry', '0deg');
        art.style.setProperty('--v10-mx', '50%');
        art.style.setProperty('--v10-my', '50%');
      });
    });
  }

  /* Cursor-responsive clinical lens on interactive information stages. */
  const lensTargets = document.querySelectorAll('.pattern-stage,.concern-stage,.route-result,.v3-choice-result,.v8-topic-stage,.v3-atlas-stage,.v6-compass-stage');
  lensTargets.forEach((target) => {
    target.classList.add('v10-lens');
    if (!finePointer || reduced) return;
    target.addEventListener('pointermove', (event) => {
      const rect = target.getBoundingClientRect();
      target.style.setProperty('--v10-lx', `${((event.clientX - rect.left) / rect.width) * 100}%`);
      target.style.setProperty('--v10-ly', `${((event.clientY - rect.top) / rect.height) * 100}%`);
    }, { passive: true });
  });

  /* Horizontal rails: visible progress + restrained wheel assistance on desktop. */
  document.querySelectorAll('[data-drag-rail]').forEach((rail) => {
    const wrap = rail.closest('.drag-wrap') || rail.parentElement;
    if (!wrap || wrap.querySelector(':scope > .v10-rail-meta')) return;
    wrap.classList.add('v10-rail-shell');
    const meta = document.createElement('div');
    meta.className = 'v10-rail-meta';
    meta.innerHTML = '<small>Drag / swipe</small><span class="v10-rail-track"><i></i></span><span class="v10-rail-count">0%</span>';
    wrap.appendChild(meta);
    const track = meta.querySelector('.v10-rail-track');
    const count = meta.querySelector('.v10-rail-count');
    const update = () => {
      const max = Math.max(0, rail.scrollWidth - rail.clientWidth);
      const p = max ? Math.max(0, Math.min(1, rail.scrollLeft / max)) : 0;
      track.style.setProperty('--v10-progress', p.toFixed(3));
      count.textContent = `${Math.round(p * 100)}%`;
      meta.hidden = max < 8;
    };
    rail.addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update, { passive: true });
    requestAnimationFrame(update);

    if (finePointer && !reduced) {
      rail.addEventListener('wheel', (event) => {
        const max = Math.max(0, rail.scrollWidth - rail.clientWidth);
        if (!max || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
        const atStart = rail.scrollLeft <= 1;
        const atEnd = rail.scrollLeft >= max - 1;
        if ((event.deltaY < 0 && atStart) || (event.deltaY > 0 && atEnd)) return;
        event.preventDefault();
        rail.scrollLeft += event.deltaY * .72;
      }, { passive: false });
    }
  });

  /* Focus one comparison/card at a time, without moving or hiding content. */
  const focusGroups = document.querySelectorAll('.v5-compare,.editorial-grid,.v4-facts,.v5-index-grid');
  focusGroups.forEach((group) => {
    const children = [...group.children].filter(el => el.matches('article,a,div'));
    if (children.length < 2 || children.length > 9) return;
    group.classList.add('v10-focus-group');
    const clear = () => {
      group.classList.remove('v10-has-focus');
      children.forEach(child => child.classList.remove('v10-is-focus'));
    };
    children.forEach((child) => {
      const enter = () => {
        group.classList.add('v10-has-focus');
        children.forEach(c => c.classList.toggle('v10-is-focus', c === child));
      };
      child.addEventListener('pointerenter', enter);
      child.addEventListener('focusin', enter);
    });
    group.addEventListener('pointerleave', clear);
    group.addEventListener('focusout', (event) => { if (!group.contains(event.relatedTarget)) clear(); });
  });

  /* Existing right-side dots now explain themselves on hover/focus. */
  document.querySelectorAll('.v3-side-index a[href^="#"]').forEach((link) => {
    const target = document.querySelector(link.getAttribute('href'));
    const raw = target?.querySelector('.section-no,.kicker,h2')?.textContent?.trim().replace(/\s+/g, ' ');
    if (raw) link.dataset.v10Label = raw.slice(0, 44);
  });

  /* Calm contextual preview for high-value internal links. */
  if (finePointer) {
    const preview = document.createElement('aside');
    preview.className = 'v10-link-preview';
    preview.setAttribute('aria-hidden', 'true');
    preview.innerHTML = '<small>Continue exploring</small><strong></strong><p></p>';
    document.body.appendChild(preview);
    const titleEl = preview.querySelector('strong');
    const copyEl = preview.querySelector('p');

    const routeMeta = [
      [/acne-treatment/, 'Acne', 'Active acne, severity, marks and scar risk.'],
      [/acne-scar-treatment/, 'Acne scars', 'Scar morphology, activity and procedure sequencing.'],
      [/pigmentation-treatment/, 'Pigmentation', 'Melasma, PIH, depth and maintenance-led planning.'],
      [/melasma-treatment/, 'Melasma', 'Diagnosis, photoprotection, triggers and maintenance.'],
      [/hair-fall-treatment/, 'Hair fall', 'Shedding, thinning, scalp disease and cause-first assessment.'],
      [/hair-transplant/, 'Hair transplant', 'Candidacy, donor planning and long-term hair-loss strategy.'],
      [/laser-hair-reduction/, 'Laser hair reduction', 'Hair calibre, skin tone, treatment cycles and realistic reduction.'],
      [/mnrf-treatment/, 'MNRF', 'Microneedling radiofrequency for selected scar and texture concerns.'],
      [/fractional-co2-laser/, 'Fractional CO₂', 'Resurfacing depth, recovery and pigment-risk planning.'],
      [/chemical-peels/, 'Chemical peels', 'Peel depth, indication, skin type and recovery.'],
      [/q-switched-laser-toning/, 'Q-switched laser', 'Pigment diagnosis, spot treatment and laser-toning distinctions.'],
      [/hifu-treatment/, 'HIFU', 'Focused ultrasound for selected laxity after anatomy assessment.'],
      [/rf-skin-tightening/, 'RF tightening', 'Surface radiofrequency for selected firmness concerns.'],
      [/hydrafacial-medifacial/, 'Medifacial', 'Customised surface-care pathways for hydration and congestion.'],
      [/botulinum-toxin-dermal-fillers/, 'Injectables', 'Movement, volume, anatomy and natural-result planning.'],
      [/vitiligo-treatment/, 'Vitiligo', 'White-patch diagnosis, activity and distribution.'],
      [/eczema-atopic-dermatitis-treatment/, 'Eczema', 'Barrier repair, flare control and trigger-aware care.'],
      [/psoriasis-treatment/, 'Psoriasis', 'Skin, scalp and nail patterns with long-term disease control.'],
      [/urticaria-hives-treatment/, 'Urticaria', 'Acute, chronic and inducible hive patterns.'],
      [/fungal-infection-treatment/, 'Fungal infection', 'Diagnosis, recurrence and avoiding steroid-modified infection.'],
      [/dr-cheena-langer/, 'Dr. Cheena Langer', 'MBBS, MD Dermatology · consultant-led care in Jammu.'],
      [/locations/, 'Clinic locations', 'Karan Nagar and Paloura consultation details.'],
      [/book-appointment/, 'Book consultation', 'Choose your branch, concern and preferred timing.']
    ];
    const describe = (href, fallback) => {
      const meta = routeMeta.find(([re]) => re.test(href));
      if (meta) return [meta[1], meta[2]];
      return [fallback.replace(/\s+/g, ' ').trim().slice(0, 58) || 'Explore', 'Open this guide in the Aastha clinical library.'];
    };
    document.querySelectorAll('.drag-card,.hover-item,.v5-index-grid a,.related-care-links a').forEach((link) => {
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || !url.pathname.startsWith('/concept/')) return;
      const show = () => {
        const [title, copy] = describe(url.pathname, link.textContent);
        titleEl.textContent = title;
        copyEl.textContent = copy;
        preview.classList.add('is-visible');
        preview.setAttribute('aria-hidden', 'false');
      };
      const hide = () => { preview.classList.remove('is-visible'); preview.setAttribute('aria-hidden', 'true'); };
      link.addEventListener('pointerenter', show);
      link.addEventListener('pointerleave', hide);
      link.addEventListener('focus', show);
      link.addEventListener('blur', hide);
    });
  }

  /* Keyboard-friendly tab/explorer controls. */
  const tabGroups = document.querySelectorAll('[role="tablist"],.pattern-tabs,.v8-topic-tabs');
  tabGroups.forEach((group) => {
    const controls = [...group.querySelectorAll('button,[role="tab"]')].filter(el => !el.disabled);
    if (controls.length < 2) return;
    controls.forEach((control, index) => {
      control.addEventListener('keydown', (event) => {
        let next = null;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = controls[(index + 1) % controls.length];
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = controls[(index - 1 + controls.length) % controls.length];
        if (event.key === 'Home') next = controls[0];
        if (event.key === 'End') next = controls[controls.length - 1];
        if (!next) return;
        event.preventDefault();
        next.focus();
        next.click();
      });
    });
  });

  /* Treatment route gets an active-chapter glow, preserving v8 theatre structure. */
  document.querySelectorAll('.v8-route-theatre .process-content').forEach((content) => {
    const chapters = [...content.querySelectorAll('.process-chapter')];
    if (chapters.length < 2 || !('IntersectionObserver' in window)) return;
    content.classList.add('v10-route-tracking');
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter(e => e.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      chapters.forEach(chapter => chapter.classList.toggle('v10-route-active', chapter === visible.target));
    }, { rootMargin: '-25% 0px -45% 0px', threshold: [.1,.35,.65] });
    chapters.forEach(chapter => observer.observe(chapter));
    chapters[0]?.classList.add('v10-route-active');
  });
})();
