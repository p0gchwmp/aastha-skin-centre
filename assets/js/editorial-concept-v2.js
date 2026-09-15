(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // One sitewide running strip only.
  const hero = document.querySelector('.editorial-hero');
  if (hero && !document.querySelector('.marquee-band,.v3-marquee')) {
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
  const countEls = [...document.querySelectorAll('[data-count]')].filter((el) => el.dataset.counted !== 'true');
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
      }), { threshold: .35 });
      countEls.forEach((el) => io.observe(el));
    } else countEls.forEach(animateCount);
  }

  // Educational route finder: body area determines the relevant choices.
  const finder = document.querySelector('[data-route-finder]');
  if (finder) {
    const areaButtons = [...finder.querySelectorAll('[data-route-group="area"]')];
    const concernButtons = [...finder.querySelectorAll('[data-route-group="concern"]')];
    const title = finder.querySelector('[data-route-title]');
    const copy = finder.querySelector('[data-route-copy]');
    const link = finder.querySelector('[data-route-link]');
    const state = { area: 'face', concern: 'acne' };

    const options = {
      face: [
        ['acne','Breakouts'],['pigmentation','Pigmentation'],['rash','Redness / rash'],['ageing','Skin ageing'],['unwanted-hair','Unwanted hair']
      ],
      scalp: [
        ['hair','Hair fall'],['rash','Flaking / itch'],['patches','Smooth patches'],['bumps','Scalp bumps']
      ],
      body: [
        ['rash','Rash / infection'],['acne','Body acne'],['pigmentation','Dark patches'],['unwanted-hair','Unwanted hair'],['growth','Growth / lump']
      ]
    };

    const routes = {
      'face:acne': ['Acne & breakouts','Explore active acne, marks and scar pathways.','/concept/acne-treatment/'],
      'face:pigmentation': ['Pigmentation','Explore melasma, post-acne marks and uneven tone.','/concept/pigmentation-treatment/'],
      'face:rash': ['Facial redness or rash','Start with medical dermatology pathways for redness, irritation and recurring facial rashes.','/concept/conditions/'],
      'face:ageing': ['Skin ageing','Explore consultation-led options for skin quality, expression lines, laxity and volume change.','/concept/botulinum-toxin-dermal-fillers/'],
      'face:unwanted-hair': ['Unwanted facial hair','Explore laser hair reduction after suitability assessment.','/concept/laser-hair-reduction/'],
      'scalp:hair': ['Hair fall & thinning','Explore shedding, thinning and scalp assessment.','/concept/hair-fall-treatment/'],
      'scalp:rash': ['Flaking, itch or scalp inflammation','Explore dandruff and seborrheic-dermatitis pathways.','/concept/seborrheic-dermatitis-dandruff/'],
      'scalp:patches': ['Patchy hair loss','Explore alopecia areata and other patchy hair-loss pathways.','/concept/alopecia-areata-treatment/'],
      'scalp:bumps': ['Scalp bumps or irritation','Start with the wider condition directory when the scalp problem is not clearly hair loss.','/concept/conditions/'],
      'body:rash': ['Body rash / infection','Explore fungal infection and other medical dermatology pathways.','/concept/fungal-infection-treatment/'],
      'body:acne': ['Body acne','Explore acne affecting the chest, shoulders or back.','/concept/acne-treatment/'],
      'body:pigmentation': ['Dark patches on the body','Explore pigmentation pathways and causes before choosing a procedure.','/concept/pigmentation-treatment/'],
      'body:unwanted-hair': ['Unwanted body hair','Explore laser hair reduction after skin and hair assessment.','/concept/laser-hair-reduction/'],
      'body:growth': ['Growth, mole, wart or lump','Explore assessment-led minor-procedure pathways.','/concept/wart-mole-skin-tag-removal/']
    };

    const updateResult = () => {
      const result = routes[`${state.area}:${state.concern}`] || ['Book an assessment','If the pattern does not fit a clear information pathway, start with direct dermatology assessment.','/concept/book-appointment/'];
      if (title) title.textContent = result[0];
      if (copy) copy.textContent = result[1];
      if (link) { link.href = result[2]; link.textContent = 'Open this pathway →'; }
    };

    const renderConcernOptions = (area, preferred) => {
      const set = options[area] || [];
      concernButtons.forEach((button, index) => {
        const item = set[index];
        if (!item) { button.hidden = true; button.setAttribute('aria-pressed','false'); return; }
        const [value,label] = item;
        button.hidden = false;
        button.dataset.routeValue = value;
        button.textContent = label;
      });
      const values = set.map(([value])=>value);
      state.concern = values.includes(preferred) ? preferred : values[0];
      concernButtons.forEach(button => button.setAttribute('aria-pressed',String(!button.hidden && button.dataset.routeValue===state.concern)));
      updateResult();
    };

    areaButtons.forEach(button => button.addEventListener('click', () => {
      areaButtons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
      state.area = button.dataset.routeValue;
      renderConcernOptions(state.area,state.concern);
    }));
    concernButtons.forEach(button => button.addEventListener('click', () => {
      if (button.hidden) return;
      concernButtons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
      state.concern = button.dataset.routeValue;
      updateResult();
    }));
    renderConcernOptions(state.area,state.concern);
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
      }, { rootMargin: '-25% 0px -45% 0px', threshold:[.1,.4] });
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
})();