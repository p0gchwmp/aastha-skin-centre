(() => {
  const body = document.body;
  const root = document.documentElement;
  if (!body || !body.classList.contains('concept-page')) return;

  /* v12 now owns palette personalization only. Dark mode is retired. */
  document.querySelector('.v11-palette-lab')?.remove();
  [...body.classList].filter(cls => cls.startsWith('v11-palette-')).forEach(cls => body.classList.remove(cls));
  root.dataset.aasthaMode = 'light';
  localStorage.removeItem('aastha-preview-theme-mode');

  const palettes = {
    current: {label:'Aastha', desc:'Wine · ivory · bronze · charcoal', sw:['#731c3a','#f4efe6','#b68a61','#171315']},
    bordeaux: {label:'Bordeaux & Bone', desc:'Deep wine · bone · bronze · near-black', sw:['#59162f','#f2ece2','#b78e66','#160f12']},
    midnight: {label:'Midnight & Oxblood', desc:'Ink navy · oxblood · brass · warm ivory', sw:['#11151d','#62213a','#b69462','#f3efe7']},
    forest: {label:'Forest & Burgundy', desc:'Forest ink · burgundy · antique gold · stone', sw:['#111714','#632333','#aa8b63','#f0ede5']},
    plum: {label:'Plum & Champagne', desc:'Deep plum · sand · champagne · near-black', sw:['#2d2030','#54233e','#b99a73','#f3ede5']}
  };

  const validPalette = key => Object.prototype.hasOwnProperty.call(palettes, key) ? key : 'current';
  let storedPalette = localStorage.getItem('aastha-preview-theme-palette') || localStorage.getItem('aastha-preview-palette') || 'current';

  const apply = (paletteKey, persist = true) => {
    const palette = validPalette(paletteKey);
    root.dataset.aasthaPalette = palette;
    root.dataset.aasthaMode = 'light';
    if (persist) localStorage.setItem('aastha-preview-theme-palette', palette);
    document.querySelectorAll('[data-v12-palette]').forEach(btn => btn.setAttribute('aria-pressed', String(btn.dataset.v12Palette === palette)));
    const badge = document.querySelector('.v12-mode-badge');
    if (badge) badge.textContent = palettes[palette].label;
  };

  const lab = document.createElement('div');
  lab.className = 'v12-theme-lab v12-palette-only';
  lab.innerHTML = `
    <button class="v12-theme-toggle" type="button" aria-expanded="false" aria-label="Choose website colour palette">Colour</button>
    <div class="v12-theme-panel" role="dialog" aria-label="Choose website colour palette">
      <div class="v12-theme-head"><small>Your preference</small><strong>Choose your look</strong></div>
      <div class="v12-theme-options">
        ${Object.entries(palettes).map(([key,p]) => `<button class="v12-theme-option" type="button" data-v12-palette="${key}" aria-pressed="false"><span class="v12-theme-swatches">${p.sw.map(c=>`<i style="background:${c}"></i>`).join('')}</span><span><strong>${p.label}</strong><small>${p.desc}</small></span></button>`).join('')}
      </div>
      <p class="v12-theme-note">Choose the colour mood you prefer. It changes the whole site and stays selected on this browser.</p>
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
    apply(storedPalette);
  }));

  document.addEventListener('pointerdown', event => {
    if (lab.classList.contains('is-open') && !lab.contains(event.target)) setOpen(false);
  });
  addEventListener('keydown', event => {
    if (event.shiftKey && event.key.toLowerCase() === 'p') {
      event.preventDefault();
      setOpen(!lab.classList.contains('is-open'));
    }
    if (event.key === 'Escape') setOpen(false);
  });

  apply(storedPalette, false);
})();
