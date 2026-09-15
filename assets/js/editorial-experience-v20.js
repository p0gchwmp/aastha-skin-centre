(() => {
  const body = document.body;
  if (!body?.classList.contains('concept-page')) return;
  const path = location.pathname.replace(/\/+$/, '/') || '/';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Old v8 dossier nodes should never coexist with the newer hero treatment. */
  document.querySelectorAll('.v8-clinical-plate').forEach(el => el.remove());

  /* Active state for the sticky On this page rail. */
  const pageMap = document.querySelector('.v7-page-map');
  if (pageMap && 'IntersectionObserver' in window) {
    const links = [...pageMap.querySelectorAll('a[href^="#"]')];
    const pairs = links.map(link => [link, document.querySelector(link.getAttribute('href'))]).filter(([,section]) => section);
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(e => e.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      pairs.forEach(([link,section]) => link.classList.toggle('is-active', section === visible.target));
      const active = pairs.find(([,section]) => section === visible.target)?.[0];
      active?.scrollIntoView({behavior:'auto',block:'nearest',inline:'center'});
    }, {rootMargin:'-18% 0px -68% 0px',threshold:[.01,.18]});
    pairs.forEach(([,section]) => observer.observe(section));
    pairs[0]?.[0].classList.add('is-active');
  }

  /* Patient-facing wording cleanup on the acne benchmark. */
  if (path === '/concept/acne-treatment/') {
    const set = (selector, text) => { const el = document.querySelector(selector); if (el) el.textContent = text; };
    set('#patterns .section-copy','Choose the closest pattern to see why treatment planning can change. These descriptions are educational, not diagnostic.');
    set('#signs .display-heading','What are you noticing?');
    set('#signs .section-copy','Choose the closest description to understand the term and why it can matter.');
    set('#when-to-see .display-heading','When acne is worth assessing early.');
    set('#assessment .display-heading','What the dermatologist assesses.');
  }

  /* Compact personalization control. It highlights useful existing content;
     it never reorders the page or pretends to diagnose the user. */
  const utility = /^\/concept\/(?:book-appointment|contact|appointment-request-received|blog(?:\/|$)|media(?:\/|$)|about|privacy-policy|medical-disclaimer|terms-and-conditions|admin(?:\/|$))/.test(path);
  const detailPage = body.classList.contains('treatment-page') && !utility;
  if (!detailPage || document.querySelector('.v20-personalize')) return;

  const existing = new Set([...document.querySelectorAll('main section[id]')].map(s => s.id));
  const pick = (...ids) => ids.find(id => existing.has(id));
  const family = body.dataset.pageFamily || '';
  const title = document.querySelector('h1')?.textContent?.replace(/\s+/g,' ').trim() || 'this guide';

  const familyProfiles = {
    'acne-scars': [
      ['Understand the pattern', pick('patterns','overview'), 'Start with the type and severity before jumping to a procedure.'],
      ['Marks or scars', pick('signs','assessment','overview'), 'Colour change and true textural scars are different problems.'],
      ['When to get help', pick('when-to-see','assessment'), 'See the situations where earlier assessment is sensible.'],
      ['Treatment route', pick('route','possibilities'), 'Go straight to the order in which treatment is usually considered.']
    ],
    'pigmentation': [
      ['Understand the pigment', pick('patterns','overview'), 'Different pigment patterns can need different strategies.'],
      ['Possible triggers', pick('causes','assessment','overview'), 'Sun, inflammation, hormones and irritation can change the plan.'],
      ['Assessment', pick('assessment','when-to-see'), 'See what a dermatologist looks at before choosing treatment.'],
      ['Treatment options', pick('route','possibilities'), 'Jump to the treatment sequence and available approaches.']
    ],
    'hair-scalp': [
      ['Understand the pattern', pick('patterns','overview'), 'Shedding, thinning, smooth patches and scalp disease are not the same.'],
      ['Possible causes', pick('causes','assessment','overview'), 'Medical context and scalp health can change the pathway.'],
      ['When to get help', pick('when-to-see','assessment'), 'See when hair or scalp changes deserve earlier review.'],
      ['Treatment options', pick('route','possibilities'), 'Jump to the treatment sequence and realistic options.']
    ],
    'medical-dermatology': [
      ['Understand the condition', pick('patterns','overview'), 'Start with what the skin is doing and where it is happening.'],
      ['Red flags / timing', pick('when-to-see','assessment'), 'See when examination should happen sooner.'],
      ['Assessment', pick('assessment','causes'), 'See what history and examination can change.'],
      ['Management', pick('route','possibilities'), 'Jump to the practical management pathway.']
    ],
    'laser-dermatology': [
      ['Am I a fit?', pick('assessment','overview','patterns'), 'Suitability depends on the target, skin type and the indication.'],
      ['What affects response?', pick('causes','patterns','assessment'), 'See the factors that can change predictability.'],
      ['Treatment sequence', pick('route','possibilities'), 'See how sessions and review fit together.'],
      ['Aftercare', pick('faq','route'), 'Jump to practical follow-through and common questions.']
    ],
    'aesthetic-dermatology': [
      ['Am I suitable?', pick('assessment','overview'), 'Start with anatomy, skin quality and the type of change you want.'],
      ['What changes the plan?', pick('patterns','causes','assessment'), 'Different goals and anatomy can point to different options.'],
      ['Treatment route', pick('route','possibilities'), 'See the sequence before comparing procedures.'],
      ['Recovery / review', pick('faq','route'), 'Jump to practical expectations and follow-up.']
    ],
    'minor-procedures': [
      ['Identify first', pick('patterns','overview'), 'The first step is confirming what the lesion or problem actually is.'],
      ['When to assess', pick('when-to-see','assessment'), 'Changing, painful or uncertain lesions need examination before removal.'],
      ['Procedure options', pick('route','possibilities'), 'See what procedural choices may be discussed.'],
      ['Aftercare', pick('faq','route'), 'Jump to recovery and follow-up information.']
    ]
  };

  const generic = [
    ['Understand it', pick('patterns','overview'), `Start with the clearest explanation of ${title.toLowerCase()}.`],
    ['Assessment', pick('assessment','when-to-see'), 'See what can change diagnosis or treatment planning.'],
    ['Treatment', pick('route','possibilities'), 'Jump to the treatment sequence and options.'],
    ['Questions', pick('faq'), 'Go straight to practical questions and follow-up.']
  ];
  const intents = (familyProfiles[family] || generic).filter(([,target]) => target);
  if (intents.length < 2) return;

  const bar = document.createElement('section');
  bar.className = 'v20-personalize';
  bar.setAttribute('aria-label','Personalize this guide');
  bar.innerHTML = `<div class="concept-shell v20-personalize-inner">
    <div class="v20-personalize-title"><small>Make this guide yours</small><strong>What matters most?</strong></div>
    <div class="v20-personalize-options">${intents.map(([label,,],i)=>`<button type="button" aria-pressed="${i===0}" data-v20-intent="${i}">${label}</button>`).join('')}</div>
    <div class="v20-personalize-result"><p data-v20-personal-note>${intents[0][2]}</p><a data-v20-personal-link href="#${intents[0][1]}">Take me there →</a></div>
  </div>`;

  const insertionPoint = pageMap || document.querySelector('.editorial-hero');
  insertionPoint?.insertAdjacentElement('afterend', bar);

  const buttons = [...bar.querySelectorAll('[data-v20-intent]')];
  const note = bar.querySelector('[data-v20-personal-note]');
  const link = bar.querySelector('[data-v20-personal-link]');
  const storageKey = `aastha-guide-intent:${path}`;

  const activate = index => {
    index = Math.max(0, Math.min(index, intents.length - 1));
    buttons.forEach((button,i) => button.setAttribute('aria-pressed',String(i===index)));
    const [,target,copy] = intents[index];
    note.textContent = copy;
    link.href = `#${target}`;
    try { sessionStorage.setItem(storageKey,String(index)); } catch {}
  };
  let saved = 0;
  try { saved = Number(sessionStorage.getItem(storageKey) || 0); } catch {}
  activate(Number.isFinite(saved) ? saved : 0);
  buttons.forEach((button,index) => button.addEventListener('click',()=>activate(index)));

  link.addEventListener('click', event => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'});
    target.classList.remove('v20-target-flash');
    requestAnimationFrame(()=>target.classList.add('v20-target-flash'));
    setTimeout(()=>target.classList.remove('v20-target-flash'),1100);
  });
})();
