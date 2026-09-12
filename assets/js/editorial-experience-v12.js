(() => {
  const body = document.body;
  const root = document.documentElement;
  if (!body || !body.classList.contains('concept-page')) return;

  /* v12 owns theming. v11 still owns copy polish, but its small palette lab is retired. */
  document.querySelector('.v11-palette-lab')?.remove();
  [...body.classList].filter(cls => cls.startsWith('v11-palette-')).forEach(cls => body.classList.remove(cls));

  const palettes = {
    current: {label:'Current / Aastha', desc:'Wine · ivory · bronze · charcoal', sw:['#731c3a','#f4efe6','#b68a61','#171315']},
    bordeaux: {label:'Bordeaux & Bone', desc:'Deep wine · bone · bronze · near-black', sw:['#59162f','#f2ece2','#b78e66','#160f12']},
    midnight: {label:'Midnight & Oxblood', desc:'Navy-black · oxblood · brass · warm ivory', sw:['#0d1118','#62213a','#b69462','#f3efe7']},
    forest: {label:'Forest & Burgundy', desc:'Forest-black · burgundy · antique gold · stone', sw:['#141b17','#632333','#aa8b63','#f0ede5']},
    plum: {label:'Plum & Champagne', desc:'Deep plum · sand · champagne · near-black', sw:['#2d2030','#54233e','#b99a73','#f3ede5']}
  };

  const validPalette = key => Object.prototype.hasOwnProperty.call(palettes, key) ? key : 'current';
  const validMode = mode => mode === 'dark' ? 'dark' : 'light';

  /* Carry over the old preview palette selection when v12 is first loaded. */
  let storedPalette = localStorage.getItem('aastha-preview-theme-palette');
  if (!storedPalette) storedPalette = localStorage.getItem('aastha-preview-palette') || 'current';
  let storedMode = localStorage.getItem('aastha-preview-theme-mode') || 'light';

  const apply = (paletteKey, mode, persist = true) => {
    const palette = validPalette(paletteKey);
    const themeMode = validMode(mode);
    root.dataset.aasthaPalette = palette;
    root.dataset.aasthaMode = themeMode;
    if (persist) {
      localStorage.setItem('aastha-preview-theme-palette', palette);
      localStorage.setItem('aastha-preview-theme-mode', themeMode);
    }
    document.querySelectorAll('[data-v12-palette]').forEach(btn => btn.setAttribute('aria-pressed', String(btn.dataset.v12Palette === palette)));
    document.querySelectorAll('[data-v12-mode]').forEach(btn => btn.setAttribute('aria-pressed', String(btn.dataset.v12Mode === themeMode)));
    const badge = document.querySelector('.v12-mode-badge');
    if (badge) badge.textContent = `${palettes[palette].label} · ${themeMode === 'dark' ? 'Dark' : 'Light'}`;
  };

  const lab = document.createElement('div');
  lab.className = 'v12-theme-lab';
  lab.innerHTML = `
    <button class="v12-theme-toggle" type="button" aria-expanded="false">Theme</button>
    <div class="v12-theme-panel" role="dialog" aria-label="Preview site themes">
      <div class="v12-theme-head"><small>Preview only · full site</small><strong>Theme lab</strong></div>
      <div class="v12-mode-switch" aria-label="Appearance mode">
        <button type="button" data-v12-mode="light" aria-pressed="false">Light</button>
        <button type="button" data-v12-mode="dark" aria-pressed="false">Dark mode</button>
      </div>
      <div class="v12-theme-options">
        ${Object.entries(palettes).map(([key,p]) => `<button class="v12-theme-option" type="button" data-v12-palette="${key}" aria-pressed="false"><span class="v12-theme-swatches">${p.sw.map(c=>`<i style="background:${c}"></i>`).join('')}</span><span><strong>${p.label}</strong><small>${p.desc}</small></span></button>`).join('')}
      </div>
      <p class="v12-theme-note">Palette now affects the entire preview: page surfaces, cards, explorers, treatment routes, navigation, FAQs, forms and utility UI. Dark mode works with every palette. Nothing here changes production.</p>
    </div>`;
  body.appendChild(lab);

  const badge = document.createElement('div');
  badge.className = 'v12-mode-badge';
  badge.setAttribute('aria-hidden','true');
  body.appendChild(badge);

  const toggle = lab.querySelector('.v12-theme-toggle');
  const setOpen = open => {
    lab.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };
  toggle.addEventListener('click', () => setOpen(!lab.classList.contains('is-open')));

  lab.querySelectorAll('[data-v12-palette]').forEach(btn => btn.addEventListener('click', () => {
    storedPalette = btn.dataset.v12Palette;
    apply(storedPalette, storedMode);
  }));
  lab.querySelectorAll('[data-v12-mode]').forEach(btn => btn.addEventListener('click', () => {
    storedMode = btn.dataset.v12Mode;
    apply(storedPalette, storedMode);
  }));

  document.addEventListener('pointerdown', event => {
    if (lab.classList.contains('is-open') && !lab.contains(event.target)) setOpen(false);
  });
  addEventListener('keydown', event => {
    if (event.shiftKey && event.key.toLowerCase() === 'p') {
      event.preventDefault();
      setOpen(!lab.classList.contains('is-open'));
    }
    if (event.shiftKey && event.key.toLowerCase() === 'd') {
      event.preventDefault();
      storedMode = storedMode === 'dark' ? 'light' : 'dark';
      apply(storedPalette, storedMode);
    }
    if (event.key === 'Escape') setOpen(false);
  });

  apply(storedPalette, storedMode, false);
})();
