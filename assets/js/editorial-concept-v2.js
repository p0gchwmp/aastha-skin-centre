(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Sitewide running strip, injected consistently across concept pages.
  const hero = document.querySelector('.editorial-hero');
  if (hero && !document.querySelector('.marquee-band')) {
    const items = [
      'Acne & scars','Pigmentation','Hair & scalp','Medical dermatology',
      'Laser dermatology','Aesthetic dermatology','Karan Nagar','Paloura Chowk',
      'Diagnosis before treatment'
    ];
    const set = items.map((item) => `<span class="marquee-item">${item}</span>`).join('');
    const band = document.createElement('div');
    band.className = 'marquee-band';
    band.setAttribute('aria-label', 'Aastha Skin Centre care areas');
    band.innerHTML = `<div class="marquee-track"><div class="marquee-set">${set}</div><div class="marquee-set" aria-hidden="true">${set}</div></div>`;
    hero.insertAdjacentElement('afterend', band);
  }

  // Animated stats, only once when visible.
  const countEls = [...document.querySelectorAll('[data-count]')];
  if (countEls.length) {
    const animateCount = (el) => {
      if (el.dataset.counted === 'true') return;
      el.dataset.counted = 'true';
      const target = Number(el.dataset.count || 0);
      const suffix = el.dataset.suffix || '';
      if (reduced || !Number.isFinite(target)) { el.textContent = `${target}${suffix}`; return; }
      const start = performance.now();
      const duration = 650;
      const frame = (now) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = `${Math.round(target * eased)}${suffix}`;
        if (p < 1) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    };
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => entries.forEach((e) => {
        if (e.isIntersecting) { animateCount(e.target); io.unobserve(e.target); }
      }), { threshold: .4 });
      countEls.forEach((el) => io.observe(el));
    } else countEls.forEach(animateCount);
  }

  // Educational route finder: navigation only, never diagnostic.
  const finder = document.querySelector('[data-route-finder]');
  if (finder) {
    const choices = [...finder.querySelectorAll('[data-route-choice]')];
    const title = finder.querySelector('[data-route-title]');
    const copy = finder.querySelector('[data-route-copy]');
    const link = finder.querySelector('[data-route-link]');
    const state = { area: 'face', concern: 'acne' };
    const routes = {
      'face:acne': ['Acne & breakouts','Explore active acne, marks and scar pathways.','/concept/acne-treatment/'],
      'face:pigmentation': ['Pigmentation','Explore melasma, post-acne marks and uneven tone.','/concept/pigmentation-treatment/'],
      'face:ageing': ['Skin ageing','Explore consultation-led aesthetic and skin-quality options.','/concept/treatments/'],
      'scalp:hair': ['Hair & scalp','Explore hair fall, thinning and scalp concerns.','/concept/hair-fall-treatment/'],
      'body:rash': ['Medical dermatology','Explore rashes, infections and chronic skin concerns.','/concept/conditions/'],
      'body:acne': ['Body acne','Explore acne that affects the chest, shoulders or back.','/concept/acne-treatment/']
    };
    const update = () => {
      const result = routes[`${state.area}:${state.concern}`] || ['Start with a dermatologist','Your concern may need an individual assessment before choosing a pathway.','/concept/book-appointment/'];
      if (title) title.textContent = result[0];
      if (copy) copy.textContent = result[1];
      if (link) link.href = result[2];
    };
    choices.forEach((button) => button.addEventListener('click', () => {
      const group = button.dataset.routeGroup;
      finder.querySelectorAll(`[data-route-group="${group}"]`).forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
      state[group] = button.dataset.routeValue;
      update();
    }));
    update();
  }

  // Scroll-linked process navigation.
  const chapters = [...document.querySelectorAll('[data-process-chapter]')];
  const processButtons = [...document.querySelectorAll('[data-process-target]')];
  if (chapters.length && processButtons.length) {
    processButtons.forEach((button) => button.addEventListener('click', () => {
      document.getElementById(button.dataset.processTarget)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
    }));
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        const best = entries.filter((e) => e.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!best) return;
        processButtons.forEach((b) => b.classList.toggle('is-active', b.dataset.processTarget === best.target.id));
      }, { rootMargin: '-25% 0px -45% 0px', threshold:[.1,.45] });
      chapters.forEach((chapter) => io.observe(chapter));
    }
  }

  // Symptom education chips on treatment pages.
  const symptomChips = [...document.querySelectorAll('[data-symptom-chip]')];
  const symptomExplain = document.querySelector('[data-symptom-explain]');
  if (symptomChips.length && symptomExplain) {
    symptomChips.forEach((chip) => chip.addEventListener('click', () => {
      symptomChips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      symptomExplain.innerHTML = `<strong>${chip.dataset.title || chip.textContent}</strong><br>${chip.dataset.copy || ''}`;
    }));
  }

  // Active section dock for long pages.
  const dockSections = [...document.querySelectorAll('main section[id]')].filter((s) => s.id);
  if (dockSections.length >= 3 && innerWidth > 1000) {
    const dock = document.createElement('nav');
    dock.className = 'section-dock';
    dock.setAttribute('aria-label','Page sections');
    dock.innerHTML = dockSections.map((s, i) => `<a href="#${s.id}" aria-label="Section ${i + 1}">${i + 1}</a>`).join('');
    document.body.appendChild(dock);
    const links = [...dock.querySelectorAll('a')];
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        const best = entries.filter((e) => e.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!best) return;
        links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${best.target.id}`));
      }, { rootMargin:'-35% 0px -50% 0px', threshold:[.05,.3] });
      dockSections.forEach((s) => io.observe(s));
    }
  }
})();
