(() => {
  const body = document.body;
  if (!body?.classList.contains('concept-page')) return;
  const path = location.pathname.replace(/\/+$/, '/') || '/';
  const slug = path.split('/').filter(Boolean).pop() || '';

  const groups = {
    acne:['acne-treatment','acne-scar-treatment','chickenpox-scar-treatment','keloid-hypertrophic-scar-treatment'],
    hair:['hair-fall-treatment','hair-transplant','prp-gfc-hair-treatment','seborrheic-dermatitis-dandruff','alopecia-areata-treatment'],
    pigment:['pigmentation-treatment','melasma-treatment','freckles-treatment','dark-circles-under-eye-treatment','dark-lips-treatment','black-neck-acanthosis-nigricans-treatment','vitiligo-treatment','sun-damage-treatment'],
    medical:['eczema-atopic-dermatitis-treatment','contact-dermatitis-treatment','psoriasis-treatment','urticaria-hives-treatment','fungal-infection-treatment','skin-allergy-treatment','scabies-treatment','molluscum-contagiosum-treatment','lichen-planus-treatment','paediatric-dermatology','sti-std-treatment'],
    aesthetic:['hifu-treatment','rf-skin-tightening','hydrafacial-medifacial','botulinum-toxin-dermal-fillers','cryolipolysis-body-contouring','ipl-photofacial'],
    minor:['wart-mole-skin-tag-removal','dpn-seborrheic-keratosis-removal','corn-removal-treatment','cyst-lipoma-removal','skin-abscess-incision-drainage','ingrown-toenail-nail-surgery','skin-biopsy','xanthelasma-removal','skin-cancer-screening'],
    laser:['laser-hair-reduction','q-switched-laser-toning','laser-tattoo-removal','fractional-co2-laser','white-hair-removal'],
    procedure:['chemical-peels','mnrf-treatment']
  };
  const family = Object.entries(groups).find(([,items]) => items.includes(slug))?.[0] || '';
  const familyLabel = {acne:'Acne & scars',hair:'Hair & scalp',pigment:'Pigmentation',medical:'Medical dermatology',aesthetic:'Aesthetic dermatology',minor:'Minor procedures',laser:'Laser dermatology',procedure:'Procedures'}[family] || 'Dermatology';

  const related = {
    acne:[['Acne','/concept/acne-treatment/'],['Acne scars','/concept/acne-scar-treatment/'],['Chemical peels','/concept/chemical-peels/']],
    hair:[['Hair fall','/concept/hair-fall-treatment/'],['PRP / GFC','/concept/prp-gfc-hair-treatment/'],['Hair transplant','/concept/hair-transplant/']],
    pigment:[['Pigmentation','/concept/pigmentation-treatment/'],['Melasma','/concept/melasma-treatment/'],['Q-switched laser','/concept/q-switched-laser-toning/']],
    medical:[['Conditions directory','/concept/conditions/'],['Eczema','/concept/eczema-atopic-dermatitis-treatment/'],['Skin allergy','/concept/skin-allergy-treatment/']],
    aesthetic:[['HIFU','/concept/hifu-treatment/'],['RF tightening','/concept/rf-skin-tightening/'],['Injectables','/concept/botulinum-toxin-dermal-fillers/']],
    minor:[['Warts, moles & skin tags','/concept/wart-mole-skin-tag-removal/'],['Skin biopsy','/concept/skin-biopsy/'],['Skin cancer screening','/concept/skin-cancer-screening/']],
    laser:[['Laser hair reduction','/concept/laser-hair-reduction/'],['Q-switched laser','/concept/q-switched-laser-toning/'],['Laser tattoo removal','/concept/laser-tattoo-removal/']],
    procedure:[['Chemical peels','/concept/chemical-peels/'],['MNRF','/concept/mnrf-treatment/'],['Fractional CO₂','/concept/fractional-co2-laser/']]
  };

  const safeText = value => (value || '').replace(/\s+/g,' ').trim();
  const pageTitle = safeText(document.querySelector('.editorial-hero h1, .hero-title, h1')?.textContent) || 'Dermatology consultation';
  let context = sessionStorage.getItem(`aastha-v26-context:${slug}`) || pageTitle;

  const bookingHref = () => `/concept/book-appointment/?context=${encodeURIComponent(context)}&from=${encodeURIComponent(slug)}`;
  const syncBookLinks = () => {
    if (!family) return;
    document.querySelectorAll('a[href^="/concept/book-appointment/"],a[href="/book-appointment/"]').forEach(link => {
      if (!link.closest('.v26-drawer')) link.href = bookingHref();
    });
  };

  const setContext = (value) => {
    const next = safeText(value);
    if (!next) return;
    context = next;
    try { sessionStorage.setItem(`aastha-v26-context:${slug}`,context); } catch(e) {}
    const current = document.querySelector('[data-v26-current]');
    if (current) current.textContent = context;
    const book = document.querySelector('[data-v26-book]');
    if (book) book.href = bookingHref();
    syncBookLinks();
  };

  const buildContextBar = () => {
    if (!family || document.querySelector('.v26-contextbar')) return;
    const hero = document.querySelector('.editorial-hero');
    if (!hero) return;
    const bar = document.createElement('div');
    bar.className = 'v26-contextbar';
    bar.innerHTML = `<div class="concept-shell v26-contextbar-inner">
      <div class="v26-context-label">${familyLabel}</div>
      <div class="v26-context-current" data-v26-current>${context}</div>
      <div class="v26-context-actions"><button type="button" data-v26-related>Related care</button><a class="v26-book" data-v26-book href="${bookingHref()}">Book with context</a></div>
    </div>`;
    hero.insertAdjacentElement('afterend',bar);
    bar.querySelector('[data-v26-related]').addEventListener('click',openDrawer);
    syncBookLinks();
  };

  const buildDrawer = () => {
    if (!family || document.querySelector('.v26-drawer')) return;
    const items = (related[family] || []).filter(([,href]) => !href.endsWith(`/${slug}/`)).slice(0,3);
    const drawer = document.createElement('div');
    drawer.className = 'v26-drawer'; drawer.hidden = true;
    drawer.setAttribute('role','dialog'); drawer.setAttribute('aria-modal','true'); drawer.setAttribute('aria-label','Related care');
    drawer.innerHTML = `<div class="v26-drawer-panel"><div class="v26-drawer-head"><div><span class="v25-kicker">Continue exploring</span><h2>Related care.</h2></div><button class="v26-drawer-close" type="button" aria-label="Close">×</button></div><div class="v26-related-grid">${items.map(([label,href],i)=>`<a class="v26-related-card" href="${href}"><small>${String(i+1).padStart(2,'0')} / ${familyLabel}</small><strong>${label}</strong><span>Open guide ↗</span></a>`).join('')}</div></div>`;
    document.body.append(drawer);
    drawer.querySelector('.v26-drawer-close').addEventListener('click',closeDrawer);
    drawer.addEventListener('click',e=>{ if(e.target===drawer) closeDrawer(); });
    document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&!drawer.hidden) closeDrawer(); });
  };
  const openDrawer = () => { const drawer=document.querySelector('.v26-drawer'); if(!drawer)return; drawer.hidden=false; document.documentElement.style.overflow='hidden'; drawer.querySelector('.v26-drawer-close')?.focus(); };
  const closeDrawer = () => { const drawer=document.querySelector('.v26-drawer'); if(!drawer)return; drawer.hidden=true; document.documentElement.style.overflow=''; document.querySelector('[data-v26-related]')?.focus(); };

  const observeInteractionContext = () => {
    document.addEventListener('input',e=>{
      if (e.target.matches('.v25-range')) {
        const labels=[...e.target.closest('.v25-hair-copy')?.querySelectorAll('.v25-range-labels span')||[]];
        setContext(labels[Number(e.target.value)]?.textContent || 'Hair concern');
      }
    });
    document.addEventListener('click',e=>{
      const pigment=e.target.closest('.v25-pigment-tabs button'); if(pigment) setContext(pigment.textContent);
      const quadrant=e.target.closest('.v25-quadrant'); if(quadrant) setContext(quadrant.querySelector('strong')?.textContent || quadrant.textContent);
      const gate=e.target.closest('.v25-gate'); if(gate) setContext(gate.querySelector('strong')?.textContent || gate.textContent);
      const node=e.target.closest('.v25-spectrum-node'); if(node) setContext(node.textContent);
      const depth=e.target.closest('[data-v23-target]'); if(depth) setContext(depth.textContent);
      const atlas=e.target.closest('[data-v23-region-button]'); if(atlas) setContext(atlas.textContent);
      const medical=e.target.closest('[data-answer]');
      if(medical) requestAnimationFrame(()=>setContext(document.querySelector('[data-v25-flow-result] strong')?.textContent || medical.textContent));
    });
  };

  const enhanceBooking = () => {
    if (path !== '/concept/book-appointment/') return;
    const params = new URLSearchParams(location.search);
    const incoming = safeText(params.get('context'));
    if (!incoming) return;
    const form = document.querySelector('[data-v8-booking-form]');
    if (!form) return;
    const banner = document.createElement('div');
    banner.className='v26-booking-context';
    banner.innerHTML=`<small>You came here for</small><strong>${incoming}</strong><button type="button">Clear</button>`;
    form.prepend(banner);
    const select=form.querySelector('select[name="concern"]');
    const lower=incoming.toLowerCase();
    const choose=(label)=>{const option=[...select.options].find(o=>o.textContent===label);if(option)select.value=option.value;};
    if(/scar/.test(lower)) choose('Acne scars');
    else if(/acne|pimple|breakout/.test(lower)) choose('Acne or pimples');
    else if(/pigment|melasma|freckle|dark lip|dark circle|sun spot/.test(lower)) choose('Pigmentation or melasma');
    else if(/hair transplant/.test(lower)) choose('Hair-transplant consultation');
    else if(/hair|scalp|shedding|thinning|alopecia|dandruff/.test(lower)) choose('Hair fall or scalp concern');
    else if(/fungal/.test(lower)) choose('Fungal infection');
    else if(/allergy|eczema|itch/.test(lower)) choose('Allergy, eczema or itching');
    else if(/psoriasis/.test(lower)) choose('Psoriasis');
    else if(/vitiligo|white patch/.test(lower)) choose('Vitiligo');
    else if(/nail|toenail/.test(lower)) choose('Nail concern');
    else if(/wart|mole|growth|dpn|xanthelasma|cyst|lipoma/.test(lower)) choose('Wart, mole or skin growth');
    else if(/laser hair/.test(lower)) choose('Laser hair reduction');
    else if(/hifu|rf|inject|volume|laxity|expression|skin quality|hydrafacial|medifacial/.test(lower)) choose('Aesthetic consultation');
    banner.querySelector('button').addEventListener('click',()=>{banner.remove();history.replaceState({},'',location.pathname);});
  };

  if (family) { buildDrawer(); buildContextBar(); observeInteractionContext(); }
  enhanceBooking();
})();
