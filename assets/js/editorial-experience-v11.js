(() => {
  const body = document.body;
  if (!body || !body.classList.contains('concept-page')) return;
  body.classList.add('v11-copy-polish');

  const path = location.pathname.replace(/\/{2,}/g, '/');

  /* ---------- Copy refinement ----------
     Preview layer only. These are patient-facing wording improvements, not
     medical-content changes. Once approved, they can be baked into source HTML. */
  const exact = (selector, from, to) => {
    document.querySelectorAll(selector).forEach(el => {
      if (el.textContent.trim() === from) el.textContent = to;
    });
  };
  const html = (selector, value) => {
    const el = document.querySelector(selector);
    if (el) el.innerHTML = value;
  };

  const isHome = path === '/' || path === '/concept/' || path === '/concept';
  if (isHome) {
    html('.editorial-hero .hero-title', 'Dermatology, <em>with clarity.</em>');
    exact('.editorial-hero .hero-copy',
      'Consult Dr. Cheena Langer, MBBS, MD Dermatology, for diagnosis-led medical dermatology, acne and scar care, pigmentation, hair and scalp concerns, lasers and selected aesthetic procedures.',
      'Consult Dr. Cheena Langer, MBBS, MD Dermatology, for diagnosis-led care across medical dermatology, acne and scars, pigmentation, hair and scalp concerns, lasers and selected aesthetic procedures.');
    exact('#concerns .section-copy',
      'Explore the concern first. This tool does not diagnose a condition; it simply takes you to the most relevant dermatologist-led information.',
      'Start with the concern. We’ll guide you to the most relevant information and treatment pathways without pretending to diagnose online.');
    exact('#finder .display-heading', 'A faster way into the site.', 'Find the right place to begin.');
    exact('#finder .section-copy',
      'Choose where the concern is and what it feels closest to. This is navigation—not diagnosis—and it points you toward the most relevant information.',
      'Choose the area and the concern that feels closest. We’ll point you toward the most relevant guide while keeping diagnosis where it belongs: in consultation.');
    exact('#treatments .display-heading', 'A clinic, organised like chapters.', 'Explore care by concern and treatment.');
    exact('#treatments .section-copy',
      'Drag through the areas patients most often explore. The interaction is playful; the pathways stay clinically clear.',
      'Move through the clinic’s main treatment areas, with each pathway linked back to diagnosis, suitability and realistic expectations.');
    exact('#approach .detail-intro',
      'The original site had more medical depth. This version keeps that depth but turns the consultation pathway into a scroll-linked story instead of a dense block of cards.',
      'Every plan begins with understanding the concern, examining the pattern and explaining the options before treatment is selected.');
    exact('#doctor .display-heading', 'Diagnosis before treatment.', 'Clinical judgement before treatment.');
    const doctorHeads = [...document.querySelectorAll('#doctor .display-heading')];
    if (doctorHeads[1] && doctorHeads[1].textContent.trim() === 'Clear diagnosis. Realistic options. Individual plans.') {
      doctorHeads[1].textContent = 'Considered diagnosis. Clear options. Individual plans.';
    }
    exact('#directory .display-heading', 'Go deeper without getting lost.', 'Explore the clinic in more detail.');
    exact('#directory .section-copy',
      'The site can stay visually bold while still giving search engines and patients the detailed pathways your original website had.',
      'Browse conditions, treatments and clinic information while staying within one clear care pathway.');
  }

  if (/\/concept\/dr-cheena-langer\/?$/.test(path)) {
    exact('#profile .display-heading', 'Diagnosis before treatment.', 'Clinical judgement before treatment.');
    exact('#focus .display-heading', 'Clinical depth without a wall of cards.', 'Areas of care.');
    exact('#focus .section-copy',
      'The same breadth from the original profile is here, but organised as a direct, editorial directory.',
      'Explore the main clinical areas Dr. Cheena Langer evaluates across medical, procedural, laser, hair and aesthetic dermatology.');
    exact('#principles .display-heading', 'More medicine. Less package-selling.', 'Treatment shaped around the individual.');
    exact('#principles .section-copy',
      'The original site’s diagnosis-first philosophy becomes a set of large editorial statements rather than small UI cards.',
      'History, examination, priorities and realistic expectations guide the plan before medicines or procedures are selected.');
    exact('#consultation .section-copy',
      'Drag through the consultation journey. Critical information stays readable even without the interaction.',
      'From first history to follow-up, each step has a purpose in reaching a clearer diagnosis and a more appropriate plan.');
    document.querySelectorAll('#faq .faq-answer-v2 p').forEach(p => {
      if (p.textContent.includes('The approved clinic statement is that Dr. Cheena Langer has more than 20 years in medicine.')) {
        p.textContent = 'Dr. Cheena Langer has more than 20 years in medicine.';
      }
    });
  }

  if (/\/concept\/pigmentation-treatment\/?$/.test(path)) {
    html('.editorial-hero .hero-title', 'Pigmentation is a <em>pattern</em>, not one diagnosis.');
    exact('#patterns .display-heading', 'What kind of pigmentation are we talking about?', 'Which pigment pattern are we looking at?');
    exact('#patterns .section-copy',
      'Tap through common presentations from the original guide. This is educational—it cannot diagnose a patch from a website.',
      'Explore common pigment patterns and why they are approached differently. This is educational and cannot diagnose a patch online.');
    exact('#plan .display-heading', 'Different depth. Different tool.', 'Different pattern. Different strategy.');
    exact('#plan .section-copy',
      'The original page is explicit that one brightening cream, peel or laser is not appropriate for every pigmentation concern.',
      'A brightening cream, peel or laser is not appropriate for every pigmentation concern; diagnosis, depth and skin response guide the choice.');
    document.querySelectorAll('.v3-accordion .answer').forEach(el => {
      el.textContent = el.textContent.replace('The original guide treats photoprotection as part of the treatment and relapse-prevention plan, not as an optional extra.', 'Yes. Photoprotection is part of treatment and relapse prevention, not an optional extra.');
    });
  }

  if (/\/concept\/hair-fall-treatment\/?$/.test(path)) {
    html('.editorial-hero .hero-title', 'Understand the <em>pattern</em> before choosing treatment.');
    exact('#patterns .section-copy',
      'Switch between common patterns described on the original page. These are educational descriptions, not self-diagnosis.',
      'Explore common hair-loss patterns and why the distinction matters. These descriptions are educational, not a self-diagnosis tool.');
    exact('#assessment .display-heading', 'The consultation is detective work.', 'Hair-loss assessment is pattern recognition.');
    exact('.editorial-section:nth-of-type(4) .display-heading', 'The cause list is broad for a reason.', 'Different patterns point to different causes.');
    document.querySelectorAll('.v3-accordion .answer').forEach(el => {
      el.textContent = el.textContent
        .replace('are among the reasons the original page recommends dermatology assessment.', 'are reasons to consider earlier dermatology assessment.')
        .replace('The original guide emphasizes identifying the cause and correcting a confirmed deficiency rather than automatically starting supplements for every form of hair loss.', 'Supplements are most useful when they address a confirmed deficiency or a clearly identified need; they are not a universal treatment for every form of hair loss.');
    });
  }

  if (/\/concept\/treatments\/?$/.test(path)) {
    html('.editorial-hero .hero-title', 'Treatments chosen around <em>diagnosis and suitability.</em>');
    exact('#directory .display-heading', 'Choose a treatment family.', 'Explore by treatment family.');
    exact('#directory .section-copy',
      'The original treatment directory is preserved here, but compressed into a filterable editorial interface instead of a long stack of cards.',
      'Browse medical, laser, hair, scar, aesthetic and minor-procedure pathways, then open the guide most relevant to your concern.');
    exact('.editorial-section:nth-of-type(4) .display-heading', 'A treatment name is not a diagnosis.', 'Start with the concern, then consider the treatment.');
  }

  /* Strip prototype language that should never be patient-facing on any page. */
  const prototypePhrases = [
    ['The original page', 'This guide'],
    ['The original guide', 'This guide'],
    ['The original site', 'The clinic information'],
    ['the original page', 'this guide'],
    ['the original guide', 'this guide'],
    ['the original site', 'the clinic information']
  ];
  document.querySelectorAll('main p, main .answer, main .faq-answer-v2 p').forEach(el => {
    let text = el.textContent;
    let next = text;
    prototypePhrases.forEach(([from,to]) => { next = next.replaceAll(from,to); });
    if (next !== text) el.textContent = next;
  });

  /* ---------- Palette lab ---------- */
  const palettes = {
    current: {label:'Current / Aastha', desc:'Wine · ivory · bronze · charcoal', cls:'', sw:['#731c3a','#f4efe6','#b68a61','#171313']},
    bordeaux: {label:'Bordeaux & Bone', desc:'Deeper wine · bone · bronze · near-black', cls:'v11-palette-bordeaux', sw:['#59162f','#f2ece2','#b78e66','#160f12']},
    midnight: {label:'Midnight & Oxblood', desc:'Navy-black · oxblood · brass · ivory', cls:'v11-palette-midnight', sw:['#0d1118','#62213a','#b69462','#f3efe7']},
    forest: {label:'Forest & Burgundy', desc:'Forest-black · burgundy · antique gold · stone', cls:'v11-palette-forest', sw:['#141b17','#632333','#aa8b63','#f0ede5']},
    plum: {label:'Plum & Champagne', desc:'Deep plum · sand · champagne · near-black', cls:'v11-palette-plum', sw:['#2d2030','#f3ede5','#b99a73','#171218']}
  };
  const paletteClasses = Object.values(palettes).map(p=>p.cls).filter(Boolean);
  const applyPalette = key => {
    paletteClasses.forEach(cls => body.classList.remove(cls));
    const palette = palettes[key] || palettes.current;
    if (palette.cls) body.classList.add(palette.cls);
    localStorage.setItem('aastha-preview-palette', key);
    document.querySelectorAll('.v11-palette-option').forEach(btn => btn.setAttribute('aria-pressed', String(btn.dataset.palette === key)));
  };

  const lab = document.createElement('div');
  lab.className = 'v11-palette-lab';
  lab.innerHTML = `
    <button class="v11-palette-toggle" type="button" aria-expanded="false">Palette</button>
    <div class="v11-palette-panel" role="dialog" aria-label="Preview colour palettes">
      <div class="v11-palette-head"><div><small>Preview only</small><strong>Colour lab</strong></div><small>Shift + P</small></div>
      <div class="v11-palette-options">
        ${Object.entries(palettes).map(([key,p]) => `<button class="v11-palette-option" type="button" data-palette="${key}" aria-pressed="false"><span class="v11-palette-swatches">${p.sw.map(c=>`<i style="background:${c}"></i>`).join('')}</span><span><strong>${p.label}</strong><small>${p.desc}</small></span></button>`).join('')}
      </div>
      <p class="v11-palette-note">Your choice is saved only in this browser preview. It does not affect production.</p>
    </div>`;
  body.appendChild(lab);
  const toggle = lab.querySelector('.v11-palette-toggle');
  const setOpen = open => { lab.classList.toggle('is-open', open); toggle.setAttribute('aria-expanded', String(open)); };
  toggle.addEventListener('click', () => setOpen(!lab.classList.contains('is-open')));
  lab.querySelectorAll('.v11-palette-option').forEach(btn => btn.addEventListener('click', () => applyPalette(btn.dataset.palette)));
  document.addEventListener('pointerdown', e => { if (lab.classList.contains('is-open') && !lab.contains(e.target)) setOpen(false); });
  addEventListener('keydown', e => {
    if (e.shiftKey && e.key.toLowerCase() === 'p') { e.preventDefault(); setOpen(!lab.classList.contains('is-open')); }
    if (e.key === 'Escape') setOpen(false);
  });
  applyPalette(localStorage.getItem('aastha-preview-palette') || 'current');
})();
