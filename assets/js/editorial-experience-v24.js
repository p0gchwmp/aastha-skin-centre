(() => {
  const body = document.body;
  if (!body?.classList.contains('concept-page')) return;
  const path = location.pathname.replace(/\/+$/, '/') || '/';
  const slug = path.split('/').filter(Boolean).pop() || 'home';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover:hover) and (pointer:fine)').matches;

  const raf = (fn) => {
    let id = 0, args;
    return (...next) => {
      args = next;
      if (id) return;
      id = requestAnimationFrame(() => { id = 0; fn(...args); });
    };
  };

  const familyFromSlug = () => {
    const groups = {
      'hair-scalp':['hair-fall-treatment','hair-transplant','prp-gfc-hair-treatment','seborrheic-dermatitis-dandruff','alopecia-areata-treatment'],
      'pigmentation':['pigmentation-treatment','melasma-treatment','freckles-treatment','dark-circles-under-eye-treatment','dark-lips-treatment','black-neck-acanthosis-nigricans-treatment','vitiligo-treatment','sun-damage-treatment'],
      'medical-dermatology':['eczema-atopic-dermatitis-treatment','contact-dermatitis-treatment','psoriasis-treatment','urticaria-hives-treatment','fungal-infection-treatment','skin-allergy-treatment','scabies-treatment','molluscum-contagiosum-treatment','lichen-planus-treatment','paediatric-dermatology','sti-std-treatment'],
      'aesthetic-dermatology':['hifu-treatment','rf-skin-tightening','hydrafacial-medifacial','botulinum-toxin-dermal-fillers','cryolipolysis-body-contouring','ipl-photofacial'],
      'minor-procedures':['wart-mole-skin-tag-removal','dpn-seborrheic-keratosis-removal','corn-removal-treatment','cyst-lipoma-removal','skin-abscess-incision-drainage','ingrown-toenail-nail-surgery','skin-biopsy','xanthelasma-removal','skin-cancer-screening'],
      'laser-dermatology':['laser-hair-reduction','q-switched-laser-toning','laser-tattoo-removal','fractional-co2-laser','white-hair-removal']
    };
    return Object.entries(groups).find(([,slugs])=>slugs.includes(slug))?.[0] || '';
  };

  const family = body.dataset.pageFamily || familyFromSlug();

  const signatureProfiles = {
    'hair-scalp':{
      eyebrow:'Hair & scalp navigator',heading:'What pattern are you noticing?',
      states:[
        {label:'More shedding',title:'More hair coming out than usual',copy:'A shedding pattern is different from gradual density loss. Timing, triggers and duration help guide assessment.',links:[['Hair fall','/concept/hair-fall-treatment/'],['PRP / GFC overview','/concept/prp-gfc-hair-treatment/']]},
        {label:'Gradual thinning',title:'Density is reducing over time',copy:'Pattern, family history, scalp findings and future progression matter before choosing supportive procedures or transplant planning.',links:[['Hair fall','/concept/hair-fall-treatment/'],['Hair transplant','/concept/hair-transplant/']]},
        {label:'Smooth patches',title:'A defined patch has appeared',copy:'Patchy loss follows a different pathway from diffuse shedding or patterned thinning and deserves direct assessment.',links:[['Alopecia areata','/concept/alopecia-areata-treatment/']]},
        {label:'Flaking / itch',title:'The scalp itself is symptomatic',copy:'Flaking, itch and inflammation can coexist with hair concerns but should not be treated as the same problem.',links:[['Dandruff / seborrheic dermatitis','/concept/seborrheic-dermatitis-dandruff/'],['Hair fall','/concept/hair-fall-treatment/']]}
      ]
    },
    'pigmentation':{
      eyebrow:'Pigmentation navigator',heading:'What changed first?',
      states:[
        {label:'After inflammation',title:'Colour followed acne, irritation or a rash',copy:'Post-inflammatory colour change is approached differently from melasma or isolated sun spots.',links:[['Pigmentation','/concept/pigmentation-treatment/'],['Acne','/concept/acne-treatment/']]},
        {label:'Symmetrical patches',title:'Facial patches are recurring or symmetrical',copy:'A melasma-type pattern often needs trigger control and maintenance, not simply a stronger procedure.',links:[['Melasma','/concept/melasma-treatment/'],['Pigmentation','/concept/pigmentation-treatment/']]},
        {label:'Freckles / sun spots',title:'Small spots are becoming more visible',copy:'Freckles and sun-related spots have different behaviour from diffuse pigmentation and should be assessed before treatment.',links:[['Freckles & sun spots','/concept/freckles-treatment/'],['Sun damage','/concept/sun-damage-treatment/']]},
        {label:'White patches',title:'The concern is loss of colour',copy:'White patches need a different diagnostic pathway from dark pigmentation because several conditions can look similar.',links:[['Vitiligo','/concept/vitiligo-treatment/']]}
      ]
    },
    'medical-dermatology':{
      eyebrow:'Medical skin navigator',heading:'What changes the assessment?',
      states:[
        {label:'Sudden / spreading',title:'It appeared quickly or is spreading',copy:'Speed, distribution and associated symptoms can change how urgently a rash or eruption should be assessed.',links:[['Conditions directory','/concept/conditions/'],['Book assessment','/concept/book-appointment/']]},
        {label:'Mostly itchy',title:'Itch is the main symptom',copy:'Allergy, eczema, scabies, fungal infection and other inflammatory conditions can overlap visually.',links:[['Skin allergy','/concept/skin-allergy-treatment/'],['Eczema','/concept/eczema-atopic-dermatitis-treatment/'],['Scabies','/concept/scabies-treatment/']]},
        {label:'Pain / discharge',title:'Pain, tenderness or discharge is present',copy:'Painful or draining lesions may need a different pathway from uncomplicated inflammatory rashes.',links:[['Skin abscess','/concept/skin-abscess-incision-drainage/'],['Book assessment','/concept/book-appointment/']]},
        {label:'Recurring / chronic',title:'It keeps returning or has persisted',copy:'Recurring skin disease often needs the diagnosis, triggers and maintenance plan reviewed together.',links:[['Psoriasis','/concept/psoriasis-treatment/'],['Contact dermatitis','/concept/contact-dermatitis-treatment/'],['Urticaria','/concept/urticaria-hives-treatment/']]}
      ]
    },
    'aesthetic-dermatology':{
      eyebrow:'Aesthetic planning navigator',heading:'What is the actual goal?',
      states:[
        {label:'Skin quality',title:'Texture, hydration or surface quality',copy:'Skin-quality concerns sit in a different category from laxity, volume or expression movement.',links:[['Hydrafacial / Medifacial','/concept/hydrafacial-medifacial/'],['Chemical peels','/concept/chemical-peels/']]},
        {label:'Laxity',title:'The concern is skin laxity',copy:'Laxity should be separated from volume loss before choosing tightening or lifting-oriented options.',links:[['HIFU','/concept/hifu-treatment/'],['RF skin tightening','/concept/rf-skin-tightening/']]},
        {label:'Expression',title:'Movement-related lines are the concern',copy:'Expression-related lines and volume-related changes are assessed differently and should not share a preset injection map.',links:[['Botulinum toxin & fillers','/concept/botulinum-toxin-dermal-fillers/']]},
        {label:'Volume / contour',title:'The concern is shape or volume',copy:'Facial proportions, anatomy and the specific area matter more than a one-size-fits-all treatment package.',links:[['Botulinum toxin & fillers','/concept/botulinum-toxin-dermal-fillers/']]}
      ]
    },
    'minor-procedures':{
      eyebrow:'Procedure navigator',heading:'What needs attention first?',
      states:[
        {label:'Stable growth',title:'A stable bump or growth is the concern',copy:'Warts, skin tags, DPN and other benign-appearing growths still need identification before removal.',links:[['Warts, moles & skin tags','/concept/wart-mole-skin-tag-removal/'],['DPN / seborrheic keratosis','/concept/dpn-seborrheic-keratosis-removal/']]},
        {label:'Changing / bleeding',title:'A lesion is changing or bleeding',copy:'A changing, bleeding or non-healing lesion should be assessed before any cosmetic removal decision.',links:[['Skin cancer screening','/concept/skin-cancer-screening/'],['Skin biopsy','/concept/skin-biopsy/']]},
        {label:'Pain / infection',title:'The lesion is painful or inflamed',copy:'Pain, warmth, discharge or rapid swelling can shift the priority from removal to infection assessment.',links:[['Skin abscess','/concept/skin-abscess-incision-drainage/'],['Cyst / lipoma','/concept/cyst-lipoma-removal/']]},
        {label:'Nail issue',title:'The problem is around a nail',copy:'Painful nail edges, infection risk and recurrence change whether conservative care or a procedure is considered.',links:[['Ingrown toenail / nail surgery','/concept/ingrown-toenail-nail-surgery/']]}
      ]
    },
    'laser-dermatology':{
      eyebrow:'Laser target navigator',heading:'What is the treatment target?',
      states:[
        {label:'Hair',title:'The target is pigmented hair',copy:'Hair colour, skin tone, body area and growth cycle all matter when planning laser hair reduction.',links:[['Laser hair reduction','/concept/laser-hair-reduction/'],['White / grey hair','/concept/white-hair-removal/']]},
        {label:'Pigment',title:'The target is selected pigment',copy:'Different pigment patterns sit at different levels and do not all belong on the same laser pathway.',links:[['Q-switched laser','/concept/q-switched-laser-toning/'],['Pigmentation','/concept/pigmentation-treatment/']]},
        {label:'Tattoo ink',title:'The target is tattoo pigment',copy:'Ink colour, density, depth and prior treatment all influence the removal plan and number of sessions.',links:[['Laser tattoo removal','/concept/laser-tattoo-removal/']]},
        {label:'Texture',title:'The goal is resurfacing or remodelling',copy:'Texture and scar remodelling are different targets from hair or pigment and need their own risk-benefit discussion.',links:[['Fractional CO₂','/concept/fractional-co2-laser/'],['Acne scars','/concept/acne-scar-treatment/']]}
      ]
    }
  };

  const skipSlugs = new Set(['home','conditions','treatments','acne-treatment','acne-scar-treatment','dr-cheena-langer','book-appointment','contact','locations','blog','media','about','privacy-policy','medical-disclaimer','terms-and-conditions','appointment-request-received','admin']);

  const buildSignature = () => {
    const profile = signatureProfiles[family];
    if (!profile || skipSlugs.has(slug) || document.querySelector('.v23-depth-section,.v24-signature')) return;
    const hero = document.querySelector('.editorial-hero');
    if (!hero) return;

    const section = document.createElement('section');
    section.className = 'v24-signature';
    section.setAttribute('aria-label',profile.heading);
    section.innerHTML = `<div class="concept-shell"><div class="v24-signature-shell">
      <div class="v24-signature-menu"><span class="kicker">${profile.eyebrow}</span><h2>${profile.heading}</h2><div class="v24-signature-options" role="group" aria-label="Choose what best matches your concern">${profile.states.map((state,index)=>`<button type="button" data-v24-state="${index}" aria-pressed="${index===0}"><span>${String(index+1).padStart(2,'0')}</span><strong>${state.label}</strong></button>`).join('')}</div></div>
      <div class="v24-signature-stage"><div class="v24-signature-content"><small>Selected path</small><h3 data-v24-title></h3><p data-v24-copy></p><div class="v24-signature-links" data-v24-links></div></div><div class="v24-orbit" aria-hidden="true"><div class="v24-orbit-scale"><i></i></div><div class="v24-orbit-ring"></div><div class="v24-orbit-dot"></div><div class="v24-orbit-core"><strong data-v24-number>01</strong><span data-v24-orbit-label></span></div></div></div>
    </div></div>`;
    hero.insertAdjacentElement('afterend',section);

    const stage = section.querySelector('.v24-signature-stage');
    const title = section.querySelector('[data-v24-title]');
    const copy = section.querySelector('[data-v24-copy]');
    const links = section.querySelector('[data-v24-links]');
    const number = section.querySelector('[data-v24-number]');
    const orbitLabel = section.querySelector('[data-v24-orbit-label]');
    const orbit = section.querySelector('.v24-orbit');
    const buttons = [...section.querySelectorAll('[data-v24-state]')];
    const storageKey = `aastha-guide:${slug}`;
    let active = Math.max(0,Math.min(profile.states.length-1,Number(sessionStorage.getItem(storageKey) || 0)));
    let timer = 0;

    const paint = (index, animate=true) => {
      active = (index + profile.states.length) % profile.states.length;
      const state = profile.states[active];
      if (animate && !reduced) stage.classList.add('is-changing');
      clearTimeout(timer);
      timer = setTimeout(()=>{
        title.textContent = state.title;
        copy.textContent = state.copy;
        links.innerHTML = state.links.map(([label,href])=>`<a href="${href}">${label} <span>↗</span></a>`).join('');
        number.textContent = String(active+1).padStart(2,'0');
        orbitLabel.textContent = state.label;
        orbit.style.setProperty('--v24-angle',`${active * (360/profile.states.length)}deg`);
        buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===active)));
        stage.classList.remove('is-changing');
        try{sessionStorage.setItem(storageKey,String(active));}catch(e){}
      }, animate && !reduced ? 100 : 0);
    };

    buttons.forEach((button,index)=>{
      button.addEventListener('click',()=>paint(index));
      button.addEventListener('keydown',event=>{
        if(event.key==='ArrowDown'||event.key==='ArrowRight'){event.preventDefault();const next=(index+1)%buttons.length;buttons[next].focus();paint(next);}
        if(event.key==='ArrowUp'||event.key==='ArrowLeft'){event.preventDefault();const next=(index-1+buttons.length)%buttons.length;buttons[next].focus();paint(next);}
      });
    });

    if (finePointer && !reduced) {
      const move = raf((event)=>{
        const rect = stage.getBoundingClientRect();
        const x = Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width));
        const y = Math.max(0,Math.min(1,(event.clientY-rect.top)/rect.height));
        stage.style.setProperty('--v24-mx',`${(x*100).toFixed(1)}%`);
        stage.style.setProperty('--v24-my',`${(y*100).toFixed(1)}%`);
        orbit.style.setProperty('--v24-rx',`${((.5-y)*3).toFixed(2)}deg`);
        orbit.style.setProperty('--v24-ry',`${((x-.5)*4).toFixed(2)}deg`);
      });
      stage.addEventListener('pointermove',move,{passive:true});
      stage.addEventListener('pointerleave',()=>{orbit.style.setProperty('--v24-rx','0deg');orbit.style.setProperty('--v24-ry','0deg');},{passive:true});
    }
    paint(active,false);
  };

  const polishAtlas = () => {
    const atlas = document.querySelector('.v23-atlas');
    if (!atlas) return;
    const visual = atlas.querySelector('.v23-atlas-visual');
    const panel = atlas.querySelector('.v23-atlas-panel');
    const title = atlas.querySelector('[data-v23-atlas-title]');
    if (!visual || !panel || !title) return;

    atlas.addEventListener('click',event=>{
      if (!event.target.closest('[data-v23-region-button],[data-region]')) return;
      panel.classList.add('is-changing');
      setTimeout(()=>panel.classList.remove('is-changing'),reduced?0:180);
    },true);
    if (finePointer && !reduced) {
      const move = raf((event)=>{
        const rect = visual.getBoundingClientRect();
        const dx=(event.clientX-rect.left)/rect.width-.5;
        const dy=(event.clientY-rect.top)/rect.height-.5;
        visual.style.setProperty('--v24-atlas-x',`${(dx*9).toFixed(2)}px`);
        visual.style.setProperty('--v24-atlas-y',`${(dy*7).toFixed(2)}px`);
      });
      visual.addEventListener('pointermove',move,{passive:true});
      visual.addEventListener('pointerleave',()=>{visual.style.setProperty('--v24-atlas-x','0px');visual.style.setProperty('--v24-atlas-y','0px');},{passive:true});
    }
  };

  const polishDepthExplorer = () => {
    const section = document.querySelector('.v23-depth-section');
    if (!section) return;
    const stage = section.querySelector('.v23-depth-stage');
    const tabs = [...section.querySelectorAll('[data-v23-target]')];
    if (!stage) return;
    if (!stage.querySelector('.v24-depth-scale')) {
      const scale=document.createElement('div');scale.className='v24-depth-scale';scale.setAttribute('aria-hidden','true');scale.innerHTML='<span>Surface</span><span>Upper skin</span><span>Deeper skin</span>';stage.appendChild(scale);
    }
    tabs.forEach((button,index)=>{
      button.addEventListener('click',()=>{stage.classList.add('is-pulsing');setTimeout(()=>stage.classList.remove('is-pulsing'),reduced?0:420);});
      button.addEventListener('keydown',event=>{
        if(event.key==='ArrowRight'||event.key==='ArrowDown'){event.preventDefault();tabs[(index+1)%tabs.length]?.focus();tabs[(index+1)%tabs.length]?.click();}
        if(event.key==='ArrowLeft'||event.key==='ArrowUp'){event.preventDefault();tabs[(index-1+tabs.length)%tabs.length]?.focus();tabs[(index-1+tabs.length)%tabs.length]?.click();}
      });
    });
  };

  const polishSections = () => {
    const sections=[...document.querySelectorAll('.editorial-section')];
    if (!('IntersectionObserver' in window) || reduced) { sections.forEach(section=>section.classList.add('is-v24-visible')); return; }
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-v24-visible');observer.unobserve(entry.target);}}),{threshold:.08,rootMargin:'0px 0px -8% 0px'});
    sections.forEach(section=>observer.observe(section));
  };

  buildSignature();
  polishAtlas();
  polishDepthExplorer();
  polishSections();
})();
