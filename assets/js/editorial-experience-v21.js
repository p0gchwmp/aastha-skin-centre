(() => {
  const body = document.body;
  if (!body?.classList.contains('concept-page')) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const path = location.pathname.replace(/\/+$/, '/') || '/';
  const slug = path.split('/').filter(Boolean).pop() || 'home';

  const raf = (fn) => {
    let queued = false;
    let lastArgs;
    return (...args) => {
      lastArgs = args;
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        fn(...lastArgs);
      });
    };
  };

  const familyProfiles = {
    'acne-scars': [
      ['Concern first','Start with what is active now.'],
      ['Pattern','Severity, marks and true scars are different.'],
      ['Context','Skin tone, triggers and previous treatment matter.'],
      ['Plan','Control first. Procedures come later when appropriate.']
    ],
    'pigmentation': [
      ['Pigment first','Name the pattern before choosing a procedure.'],
      ['Trigger','Sun, inflammation, heat and hormones can change the plan.'],
      ['Protection','Photoprotection is part of treatment, not an extra.'],
      ['Maintain','Pigment care often needs maintenance, not a one-off fix.']
    ],
    'hair-scalp': [
      ['Pattern first','Shedding, thinning, patches and scalp disease differ.'],
      ['Scalp','Inflammation and scalp health can change the pathway.'],
      ['Context','Nutrition, medicines and medical history may matter.'],
      ['Track','Progress is easier to judge when the pattern is documented.']
    ],
    'medical-dermatology': [
      ['Concern first','Start with symptoms, duration and body site.'],
      ['Examine','Similar-looking rashes can have different causes.'],
      ['Diagnose','Testing is useful only when it can change management.'],
      ['Review','Treatment changes when the skin response changes.']
    ],
    'laser-dermatology': [
      ['Indication first','A device only makes sense for the right target.'],
      ['Skin type','Tone, hair, pigment or tattoo colour can change settings.'],
      ['Sequence','Sessions and review matter more than one dramatic setting.'],
      ['Aftercare','Healing and pigment prevention are part of the result.']
    ],
    'aesthetic-dermatology': [
      ['Anatomy first','Treat the face or skin in front of you, not a trend.'],
      ['Suitability','Goals, anatomy and skin quality change the option.'],
      ['Restraint','Natural movement and proportion matter.'],
      ['Review','Small staged decisions beat a preset package.']
    ],
    'minor-procedures': [
      ['Identify first','Know what the lesion is before removing it.'],
      ['Site','Location, symptoms and healing risk change the method.'],
      ['Procedure','Choose the least disruptive appropriate option.'],
      ['Aftercare','Healing and review are part of the procedure.']
    ],
    'doctor-profile': [
      ['Clinical first','Diagnosis and medical context lead the consultation.'],
      ['Experience','More than 20 years in medicine.'],
      ['Breadth','Medical, hair, laser and selected procedural dermatology.'],
      ['Jammu','Consultation across Aastha’s two Jammu clinics.']
    ],
    'dermatology': [
      ['Concern first','Start with what you are actually noticing.'],
      ['Assessment','History and examination shape the next step.'],
      ['Options','Treatment follows diagnosis, skin context and priorities.'],
      ['Review','Progress and tolerability guide what changes next.']
    ]
  };

  const exactProfiles = {
    'acne-treatment': [
      ['Active acne first','New inflammation comes before scar procedures.'],
      ['Lesion type','Blackheads, inflamed pimples and deep acne differ.'],
      ['Scarring risk','Pain, depth and repeated inflammation can raise urgency.'],
      ['Maintain','Control is easier to keep than to rebuild after relapse.']
    ],
    'acne-scar-treatment': [
      ['Scar type first','Rolling, boxcar and ice-pick scars behave differently.'],
      ['Active acne','Ongoing acne is usually controlled before scar work.'],
      ['Skin tone','Pigment risk influences preparation and procedure choice.'],
      ['Combine','Different scar structures may need different techniques.']
    ],
    'melasma-treatment': [
      ['Melasma first','Treat it as a relapsing pigment condition.'],
      ['Triggers','Light, heat and hormones can keep reactivating colour.'],
      ['Layer care','Protection, medical treatment and procedures play different roles.'],
      ['Maintain','Recurrence control matters as much as initial lightening.']
    ],
    'hair-transplant': [
      ['Diagnosis first','Transplant only makes sense when the loss pattern is clear.'],
      ['Donor supply','Available donor hair is finite.'],
      ['Future loss','Today’s hairline should still make sense later.'],
      ['Density','Planning is about realistic redistribution, not unlimited hair.']
    ]
  };

  const enhanceMotionPlate = () => {
    const plate = document.querySelector('.hero-art.v18-authored-media .v18-media-composition--simple')?.closest('.hero-art');
    if (!plate || plate.classList.contains('v21-motion-plate')) return;

    const family = body.dataset.pageFamily || 'dermatology';
    const states = exactProfiles[slug] || familyProfiles[family] || familyProfiles.dermatology;
    const composition = plate.querySelector('.v18-media-composition--simple');
    const title = composition?.querySelector('.v18-media-core h3');
    const copy = composition?.querySelector('.v18-media-core p');
    if (!composition || !title || !copy || states.length < 2) return;

    plate.classList.add('v21-motion-plate');
    plate.tabIndex = 0;
    plate.setAttribute('role','group');
    plate.setAttribute('aria-label','Interactive clinical guide. Use arrow keys or the controls to explore.');
    plate.dataset.motionEngine = 'native';

    const hint = document.createElement('span');
    hint.className = 'v21-plate-hint';
    hint.textContent = finePointer ? 'Move · click to explore' : 'Tap to explore';
    composition.appendChild(hint);

    const nav = document.createElement('div');
    nav.className = 'v21-state-nav';
    nav.setAttribute('aria-label','Clinical guide states');
    nav.innerHTML = states.map(([label],index) => `
      <button type="button" aria-pressed="${index===0}" data-v21-state="${index}">
        <span>${String(index+1).padStart(2,'0')}</span><strong>${label}</strong>
      </button>`).join('');
    composition.appendChild(nav);

    let active = 0;
    let timer = 0;
    const setState = (index, announce = true) => {
      active = (index + states.length) % states.length;
      plate.classList.add('is-changing');
      clearTimeout(timer);
      timer = setTimeout(() => {
        title.textContent = states[active][0];
        copy.textContent = states[active][1];
        nav.querySelectorAll('button').forEach((button,i) => button.setAttribute('aria-pressed',String(i===active)));
        plate.classList.remove('is-changing');
        if (announce) title.setAttribute('aria-live','polite');
      }, reduced ? 0 : 115);
    };

    nav.querySelectorAll('button').forEach((button,index) => {
      button.addEventListener('click', event => {
        event.stopPropagation();
        setState(index);
      });
    });
    plate.addEventListener('click', event => {
      if (event.target.closest('button,a')) return;
      setState(active + 1);
    });
    plate.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') { event.preventDefault(); setState(active + 1); }
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') { event.preventDefault(); setState(active - 1); }
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setState(active + 1); }
    });

    if (finePointer && !reduced) {
      const move = raf((event) => {
        const rect = plate.getBoundingClientRect();
        const x = Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width));
        const y = Math.max(0,Math.min(1,(event.clientY-rect.top)/rect.height));
        plate.style.setProperty('--v21-x',`${(x*100).toFixed(2)}%`);
        plate.style.setProperty('--v21-y',`${(y*100).toFixed(2)}%`);
        plate.style.setProperty('--v21-rx',`${((.5-y)*3.2).toFixed(2)}deg`);
        plate.style.setProperty('--v21-ry',`${((x-.5)*4.2).toFixed(2)}deg`);
        plate.style.setProperty('--v21-depth','2px');
      });
      plate.addEventListener('pointermove',move,{passive:true});
      plate.addEventListener('pointerleave',() => {
        plate.style.setProperty('--v21-x','50%');
        plate.style.setProperty('--v21-y','50%');
        plate.style.setProperty('--v21-rx','0deg');
        plate.style.setProperty('--v21-ry','0deg');
        plate.style.setProperty('--v21-depth','0px');
      },{passive:true});
    }
  };

  const enhanceSurface = (element) => {
    if (!element || element.classList.contains('v21-surface')) return;
    element.classList.add('v21-surface');
    const glow = document.createElement('span');
    glow.className = 'v21-surface-glow';
    glow.setAttribute('aria-hidden','true');
    element.prepend(glow);
    if (finePointer && !reduced) {
      const move = raf((event) => {
        const rect = element.getBoundingClientRect();
        element.style.setProperty('--v21-sx',`${event.clientX-rect.left}px`);
        element.style.setProperty('--v21-sy',`${event.clientY-rect.top}px`);
      });
      element.addEventListener('pointermove',move,{passive:true});
    }
  };

  enhanceMotionPlate();
  document.querySelectorAll('.v4-fact,.editorial-panel,.v3-reading-card,.v18-journal-card,.v18-media-card').forEach(enhanceSurface);

  /* ---------------- Admin workspace ---------------- */
  if (!body.classList.contains('concept-admin')) return;

  const main = document.querySelector('.v18-admin-main');
  if (!main) return;

  const toolbar = document.createElement('div');
  toolbar.className = 'v21-admin-toolbar';
  toolbar.innerHTML = `
    <label class="v21-admin-search-wrap">
      <span class="sr-only">Search this admin page</span>
      <input class="v21-admin-search" type="search" placeholder="Search pages, guides, media or settings…" aria-label="Search this admin page">
      <kbd>/</kbd>
    </label>
    <span class="v21-admin-chip">Preview · isolated</span>
    <button class="v21-admin-view" type="button">View website ↗</button>`;
  main.prepend(toolbar);

  const search = toolbar.querySelector('.v21-admin-search');
  toolbar.querySelector('.v21-admin-view')?.addEventListener('click',()=>location.href='/concept/');
  addEventListener('keydown',event => {
    if (event.key === '/' && document.activeElement !== search && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || '')) {
      event.preventDefault();
      search.focus();
    }
  });

  const drawer = document.createElement('aside');
  drawer.className = 'v21-admin-drawer';
  drawer.setAttribute('aria-hidden','true');
  drawer.innerHTML = `
    <div class="v21-admin-drawer-head"><small>Content inspector</small><button class="v21-admin-drawer-close" type="button" aria-label="Close inspector">×</button></div>
    <div data-v21-admin-detail></div>`;
  document.body.appendChild(drawer);
  const detail = drawer.querySelector('[data-v21-admin-detail]');
  const closeDrawer = () => {
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden','true');
    document.querySelectorAll('.v18-admin-table tbody tr[aria-selected="true"]').forEach(row=>row.setAttribute('aria-selected','false'));
  };
  drawer.querySelector('.v21-admin-drawer-close')?.addEventListener('click',closeDrawer);
  addEventListener('keydown',event => { if (event.key === 'Escape' && drawer.classList.contains('is-open')) closeDrawer(); });

  const routeFor = (label) => {
    const text = label.toLowerCase();
    if (text.includes('homepage')) return '/concept/';
    if (text.includes('acne')) return '/concept/acne-treatment/';
    if (text.includes('cheena')) return '/concept/dr-cheena-langer/';
    if (text.includes('karan') || text.includes('paloura')) return '/concept/locations/';
    if (text.includes('blackhead')) return '/concept/blog/blackheads/';
    if (text.includes('whitehead')) return '/concept/blog/whiteheads/';
    if (text.includes('cystic')) return '/concept/blog/cystic-acne/';
    if (text.includes('journal') || text.includes('blog')) return '/concept/blog/';
    if (text.includes('media')) return '/concept/media/';
    return '/concept/';
  };

  const openInspector = ({title,type='Content',state='Preview',copy='',route=''}) => {
    detail.innerHTML = `
      <h2>${title}</h2>
      <p>${copy || 'Inspect the public-facing destination and the content role before editing. This preview does not publish to production.'}</p>
      <div class="v21-admin-drawer-meta">
        <div><small>Content type</small><strong>${type}</strong></div>
        <div><small>State</small><strong>${state}</strong></div>
      </div>
      <div class="v21-admin-drawer-actions">
        <a href="${route || routeFor(title)}">Open public preview <span>↗</span></a>
        <button type="button" data-v21-editor-preview>Open editor preview <span>→</span></button>
      </div>`;
    detail.querySelector('[data-v21-editor-preview]')?.addEventListener('click',() => {
      const p = detail.querySelector('p');
      if (p) p.textContent = 'Editor preview: title, summary, page media, CTAs and structured sections would map to Wagtail fields. The live production CMS is intentionally not being changed from this concept branch.';
    });
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden','false');
  };

  const rows = [...document.querySelectorAll('.v18-admin-table tbody tr')];
  rows.forEach(row => {
    row.tabIndex = 0;
    row.setAttribute('role','button');
    row.setAttribute('aria-selected','false');
    const cells = [...row.cells].map(cell=>cell.textContent.trim());
    const open = () => {
      rows.forEach(other=>other.setAttribute('aria-selected',String(other===row)));
      openInspector({title:cells[0] || 'Content',type:cells[1] || 'Page',state:cells[2] || 'Preview',copy:cells[3] || '',route:routeFor(cells[0] || '')});
    };
    row.addEventListener('click',open);
    row.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();open();}});
  });

  const cards = [...document.querySelectorAll('.v18-admin-card')];
  cards.forEach(card => {
    enhanceSurface(card);
    if (card.querySelector('a')) return;
    card.tabIndex = 0;
    card.setAttribute('role','button');
    const heading = card.querySelector('h3')?.textContent.trim() || 'Admin area';
    const copy = card.querySelector('p')?.textContent.trim() || '';
    const open = () => openInspector({title:heading,type:'Admin module',state:'Preview',copy,route:routeFor(heading)});
    card.addEventListener('click',open);
    card.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();open();}});
  });

  const filterTargets = [...new Set([...rows,...cards])];
  const empty = document.createElement('div');
  empty.className = 'v21-admin-empty';
  empty.textContent = 'No matching items on this admin page.';
  main.appendChild(empty);
  const filter = () => {
    const q = search.value.trim().toLowerCase();
    let visible = 0;
    filterTargets.forEach(item => {
      const match = !q || item.textContent.toLowerCase().includes(q);
      item.hidden = !match;
      if (match) visible++;
    });
    empty.style.display = q && visible === 0 ? 'block' : 'none';
  };
  search.addEventListener('input',filter);

  /* Preview action query states from Add page / New article / Upload media. */
  const action = new URLSearchParams(location.search).get('action');
  if (action) {
    const presets = {
      new: ['Create draft','Structured content','Draft','Choose a content type, enter the core fields, then preview before publishing through Wagtail.'],
      upload: ['Upload approved media','Media asset','Draft','Add real clinic, doctor, procedure or consented patient media with caption, source and usage metadata.']
    };
    const preset = presets[action];
    if (preset) openInspector({title:preset[0],type:preset[1],state:preset[2],copy:preset[3],route:'/concept/admin/'});
  }
})();
