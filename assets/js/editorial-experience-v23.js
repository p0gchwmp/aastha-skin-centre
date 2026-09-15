(() => {
  const body = document.body;
  if (!body?.classList.contains('concept-page')) return;
  const path = location.pathname.replace(/\/+$/, '/') || '/';
  const finePointer = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const route = (href) => href;

  const atlasData = {
    forehead:{label:'Forehead',title:'Forehead breakouts & pigment',copy:'Forehead acne, post-acne marks and pigment change can look similar at a glance but follow different pathways.',links:[['Acne','/concept/acne-treatment/'],['Pigmentation','/concept/pigmentation-treatment/'],['Melasma','/concept/melasma-treatment/']]},
    cheeks:{label:'Cheeks',title:'Cheeks & mid-face',copy:'Acne, marks, melasma, redness and scars can overlap across the cheeks. Start with the dominant concern rather than a treatment name.',links:[['Acne','/concept/acne-treatment/'],['Acne scars','/concept/acne-scar-treatment/'],['Pigmentation','/concept/pigmentation-treatment/'],['Rosacea','/concept/rosacea-treatment/']]},
    undereye:{label:'Under-eye',title:'Under-eye changes',copy:'Dark circles, pigment and texture around the eyes need assessment before choosing peels, lasers or other procedures.',links:[['Dark circles','/concept/dark-circles-under-eye-treatment/'],['Pigmentation','/concept/pigmentation-treatment/']]},
    jaw:{label:'Jaw / chin',title:'Jawline & chin',copy:'Breakouts here may be persistent or recurrent. Pattern, severity and associated symptoms help determine the next step.',links:[['Acne','/concept/acne-treatment/'],['Acne scars','/concept/acne-scar-treatment/']]},
    lips:{label:'Lips',title:'Lip pigmentation',copy:'Darkening of the lips can have several causes. Irritation, habits, sun exposure and medical context may all matter.',links:[['Dark lips','/concept/dark-lips-treatment/'],['Pigmentation','/concept/pigmentation-treatment/']]},
    scalp:{label:'Scalp',title:'Scalp & hair',copy:'Hair fall, thinning, patches, dandruff and scalp inflammation are different problems and should not be treated as one category.',links:[['Hair fall','/concept/hair-fall-treatment/'],['Alopecia areata','/concept/alopecia-areata-treatment/'],['Dandruff','/concept/seborrheic-dermatitis-dandruff/'],['Hair transplant','/concept/hair-transplant/']]}
  };

  const buildAtlas = () => {
    if (path !== '/concept/conditions/') return;
    const old = document.querySelector('[data-atlas]');
    if (!old || old.dataset.v23 === '1') return;
    old.dataset.v23 = '1';
    old.className = 'v23-atlas';
    old.removeAttribute('data-atlas');
    old.innerHTML = `
      <div class="v23-atlas-visual">
        <div class="v23-atlas-top"><small>Interactive concern atlas</small><span>Hover or tap a region<br>Educational navigation only</span></div>
        <div class="v23-atlas-pulse" aria-hidden="true"></div>
        <svg class="v23-face-svg" viewBox="0 0 520 520" role="img" aria-label="Stylised face and scalp concern map">
          <path class="v23-face-outline" d="M168 102c24-49 78-77 139-72 76 6 133 65 132 145-1 60-30 103-67 136-23 21-38 47-42 78-4 28-24 52-54 59-35 8-70-9-87-40-12-22-17-49-36-64-39-31-63-73-65-126-2-48 20-89 80-116Z"/>
          <path class="v23-face-detail" d="M202 216c17-14 38-19 60-15M315 201c19-4 39 1 54 14M264 241c-4 24-10 44-7 57 4 12 18 18 34 15M219 342c25 19 77 20 103-1M150 139c39-30 90-43 145-36 49 6 88 26 116 59"/>
          <path tabindex="0" class="v23-region" data-region="scalp" d="M154 129c26-68 95-102 162-91 59 9 108 51 120 109-64-32-211-39-282-18Z"/>
          <path tabindex="0" class="v23-region" data-region="forehead" d="M173 139c68-23 170-16 233 13l-22 82H184Z"/>
          <path tabindex="0" class="v23-region" data-region="cheeks" d="M151 235h86l6 106-63 37c-26-27-42-70-29-143Zm142 0h94c4 52-10 99-49 136l-57-31Z"/>
          <path tabindex="0" class="v23-region" data-region="undereye" d="M188 207c28-19 62-19 88 1l-11 35h-75Zm104 1c29-18 61-16 84 4l-6 31h-72Z"/>
          <path tabindex="0" class="v23-region" data-region="jaw" d="M182 371l59-34 40 5 59 32c-11 51-34 80-72 80-43 0-70-29-86-83Z"/>
          <path tabindex="0" class="v23-region" data-region="lips" d="M222 331c31-15 69-14 98 1-27 29-72 31-98-1Z"/>
        </svg>
      </div>
      <div class="v23-atlas-panel">
        <div class="v23-atlas-region-list">${Object.entries(atlasData).map(([key,item],i)=>`<button type="button" data-v23-region-button="${key}" aria-pressed="${i===0}">${item.label}</button>`).join('')}</div>
        <div class="v23-atlas-copy"><small>Selected region</small><h3 data-v23-atlas-title></h3><p data-v23-atlas-copy></p><div class="v23-atlas-links" data-v23-atlas-links></div></div>
        <div class="v23-atlas-note">This is a navigation tool, not a diagnosis. Similar-looking concerns can need different treatment.</div>
      </div>`;

    const title = old.querySelector('[data-v23-atlas-title]');
    const copy = old.querySelector('[data-v23-atlas-copy]');
    const links = old.querySelector('[data-v23-atlas-links]');
    const buttons = [...old.querySelectorAll('[data-v23-region-button]')];
    const regions = [...old.querySelectorAll('[data-region]')];
    let active = 'forehead';
    const set = (key) => {
      const item = atlasData[key]; if (!item) return;
      active = key;
      title.textContent = item.title; copy.textContent = item.copy;
      links.innerHTML = item.links.map(([label,href])=>`<a href="${route(href)}">${label} <span>↗</span></a>`).join('');
      buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v23RegionButton===key)));
      regions.forEach(r=>r.classList.toggle('is-active',r.dataset.region===key));
    };
    buttons.forEach(b=>b.addEventListener('click',()=>set(b.dataset.v23RegionButton)));
    regions.forEach(r=>{
      r.addEventListener('click',()=>set(r.dataset.region));
      r.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();set(r.dataset.region);}});
      if (finePointer) r.addEventListener('pointerenter',()=>set(r.dataset.region),{passive:true});
    });
    set(active);
  };

  const procedureConfigs = {
    'chemical-peels':{active:'surface',label:'Chemical peel',copy:'Peels act at different levels depending on the agent and strength selected.',tabs:[['surface','Superficial peel','Primarily surface / upper epidermal action.'],['epidermal','Selected deeper peel','Can extend further depending on the exact peel.']]},
    'mnrf-treatment':{active:'dermal',label:'MNRF',copy:'Microneedling radiofrequency delivers controlled energy below the surface through insulated or non-insulated needles, depending on the system.',tabs:[['dermal','MNRF','Relative dermal target.']]},
    'fractional-co2-laser':{active:'dermal',label:'Fractional CO₂',copy:'Fractional resurfacing creates microscopic treatment columns through the surface into deeper skin.',tabs:[['dermal','Fractional CO₂','Surface plus dermal remodelling.']]},
    'laser-hair-reduction':{active:'follicular',label:'Laser hair reduction',copy:'Laser hair reduction aims at pigment in hair structures below the skin surface.',tabs:[['follicular','Hair follicle target','Relative follicular target.']]},
    'q-switched-laser-toning':{active:'epidermal',label:'Q-switched laser',copy:'The treatment target depends on the pigment being treated and its location.',tabs:[['epidermal','Pigment target','Illustrative pigment-targeting view.']]}
  };

  const buildDepthExplorer = () => {
    const slug = path.split('/').filter(Boolean).pop() || '';
    const config = procedureConfigs[slug]; if (!config) return;
    if (document.querySelector('.v23-depth-section')) return;
    const hero = document.querySelector('.editorial-hero');
    if (!hero) return;
    const section = document.createElement('section');
    section.className = 'v23-depth-section';
    section.innerHTML = `<div class="concept-shell v23-depth-shell">
      <div class="v23-depth-copy"><span class="kicker">Interactive treatment target</span><h2>Where the treatment is aimed.</h2><p>${config.copy}</p><div class="v23-depth-tabs">${config.tabs.map(([key,label],i)=>`<button type="button" data-v23-target="${key}" aria-pressed="${i===0}">${label}</button>`).join('')}</div><p class="v23-depth-disclaimer">Simplified educational illustration only. It does not show exact millimetre depth, device settings or an individual treatment plan.</p></div>
      <div class="v23-depth-stage" data-target="${config.active}">
        <div class="v23-skin"><div class="v23-layer surface"><span>Surface</span></div><div class="v23-layer epidermis"><span>Epidermal zone</span></div><div class="v23-layer dermis"><span>Dermal zone</span></div><div class="v23-target-beam" aria-hidden="true"></div><div class="v23-follicle" aria-hidden="true"></div></div>
        <div class="v23-depth-label"><div><small>Selected modality</small><strong data-v23-depth-title>${config.label}</strong></div><p data-v23-depth-copy>${config.tabs[0][2]}</p></div>
      </div>
    </div>`;
    hero.insertAdjacentElement('afterend',section);
    const stage = section.querySelector('.v23-depth-stage');
    const title = section.querySelector('[data-v23-depth-title]');
    const text = section.querySelector('[data-v23-depth-copy]');
    section.querySelectorAll('[data-v23-target]').forEach((button,index)=>button.addEventListener('click',()=>{
      const [key,label,desc] = config.tabs[index];
      stage.dataset.target = key; title.textContent = label; text.textContent = desc;
      section.querySelectorAll('[data-v23-target]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    }));
    if (finePointer && !reduced) {
      let rafId = 0, latest;
      stage.addEventListener('pointermove',event=>{latest=event;if(rafId)return;rafId=requestAnimationFrame(()=>{rafId=0;const r=stage.getBoundingClientRect();stage.style.setProperty('--v23-mx',`${event.clientX-r.left}px`);stage.style.setProperty('--v23-my',`${event.clientY-r.top}px`);});},{passive:true});
      stage.addEventListener('pointerleave',()=>{stage.style.removeProperty('--v23-mx');stage.style.removeProperty('--v23-my');},{passive:true});
    }
  };

  buildAtlas();
  buildDepthExplorer();
})();
