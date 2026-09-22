(() => {
  const body = document.body;
  if (!body?.classList.contains('concept-page')) return;
  const path = location.pathname.replace(/\/+$/, '/') || '/';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cue = name => `/assets/images/visual-cues/${name}.jpg`;

  const photos = {
    acne: cue('acne-care'),
    pigment: cue('pigmentation-care'),
    pigmentPortrait: cue('pigmentation-care'),
    hair: cue('hair-scalp-care'),
    medical: cue('allergy-inflammatory-rashes'),
    laser: cue('complete-care'),
    procedure: cue('clinical-skin-care'),
    clinic: cue('two-clinic-locations'),
    vitiligo: cue('clinical-skin-care'),
  };

  const setImg = (img, src, alt, pos = '50% 50%') => {
    if (!img) return;
    img.src = src;
    img.alt = alt || '';
    img.style.objectPosition = pos;
    img.decoding = 'async';
    img.addEventListener('error', () => img.closest('.v30-card,.v30-treatment-tile,.hero-art,.v31-pigment-photo')?.classList.add('is-image-failed'), {once:true});
  };

  const patchImageLedHubs = () => {
    if (path === '/concept/conditions/') {
      setImg(document.querySelector('.editorial-hero .hero-art img'), photos.procedure, 'Dermatologist examining skin in a clinical setting', '54% 45%');
      const byHref = {
        '/concept/acne-treatment/':[photos.acne,'Close-up of acne-prone natural skin','50% 42%'],
        '/concept/pigmentation-treatment/':[photos.pigment,'Macro photograph of natural freckled and pigmented skin','50% 50%'],
        '/concept/hair-fall-treatment/':[photos.hair,'Close-up showing hair shedding and hair-loss concern','52% 48%'],
        '/concept/eczema-atopic-dermatitis-treatment/':[photos.medical,'Close-up of a person showing a visible skin concern','50% 46%'],
        '/concept/laser-hair-reduction/':[photos.laser,'Dermatology laser treatment in a clinic','50% 50%'],
        '/concept/wart-mole-skin-tag-removal/':[photos.procedure,'Dermatologist carrying out a skin procedure in clinic','50% 46%'],
      };
      document.querySelectorAll('.v30-card').forEach(card => {
        const cfg = byHref[card.getAttribute('href')];
        if (cfg) setImg(card.querySelector('img'), ...cfg);
      });
    }

    if (path === '/concept/treatments/') {
      setImg(document.querySelector('.editorial-hero .hero-art img'), photos.clinic, 'Dermatologist treating a patient in a modern clinic', '52% 46%');
      const byFilter = {
        medical:[photos.medical,'Visible skin concern','50% 45%'],
        scars:[photos.acne,'Natural acne-prone skin texture','50% 42%'],
        pigment:[photos.pigment,'Freckled and pigmented skin texture','50% 50%'],
        hair:[photos.hair,'Hair-loss concern','52% 48%'],
        aesthetic:[photos.clinic,'Dermatology clinic treatment','50% 48%'],
        procedures:[photos.procedure,'Clinical dermatology procedure','50% 46%'],
      };
      document.querySelectorAll('[data-v30-filter]').forEach(tile => {
        const cfg = byFilter[tile.dataset.v30Filter];
        if (cfg) setImg(tile.querySelector('img'), ...cfg);
      });
    }
  };

  const rebuildPigmentationExplorer = () => {
    if (path !== '/concept/pigmentation-treatment/') return;

    document.querySelectorAll('.v25-module').forEach(section => {
      if (section.querySelector('.v25-pigment')) section.remove();
    });

    const patterns = document.querySelector('#patterns');
    const old = patterns?.querySelector('.v3-choice-matrix');
    if (!patterns || !old || patterns.querySelector('.v31-pigment-deck')) return;

    const states = [
      {
        key:'melasma', label:'Symmetrical patches', eyebrow:'Recurring facial pigmentation', title:'Pattern matters more than darkness alone.',
        copy:'Melasma is usually discussed as a recurring facial pigmentation pattern. Distribution, triggers, skin tone, treatment history and relapse tendency all change the plan.',
        cue:'Often bilateral or symmetrical facial patches', plan:'Trigger control + medical treatment + maintenance', href:'/concept/melasma-treatment/', cta:'Read the melasma guide',
        image:photos.pigmentPortrait, alt:'Illustrative close-up portrait showing naturally pigmented facial skin', pos:'54% 46%'
      },
      {
        key:'pih', label:'After inflammation', eyebrow:'Post-inflammatory colour change', title:'Treat the inflammation that created the mark.',
        copy:'Colour left after acne, eczema, irritation or injury follows a different pathway from melasma. New inflammation can keep creating new marks.',
        cue:'Marks appear where inflammation or injury occurred', plan:'Control the cause before chasing the colour', href:'/concept/acne-treatment/', cta:'See acne + post-acne marks',
        image:photos.acne, alt:'Close-up of acne-prone skin, illustrating inflammation that can leave colour changes', pos:'50% 44%'
      },
      {
        key:'spots', label:'Freckles / sun spots', eyebrow:'Small discrete spots', title:'Discrete spots are not the same as diffuse pigmentation.',
        copy:'Freckles and sun-related spots can behave differently from broad facial patches. A changing or unusual-looking spot should be examined before cosmetic treatment.',
        cue:'Smaller, more discrete areas of pigment', plan:'Identify the lesion before choosing a procedure', href:'/concept/freckles-treatment/', cta:'Explore freckles + sun spots',
        image:photos.pigment, alt:'Macro photograph of naturally freckled skin', pos:'50% 50%'
      },
      {
        key:'depig', label:'White patches', eyebrow:'Loss of pigment', title:'Loss of colour is a different diagnostic pathway.',
        copy:'White patches are not a “lighter version” of dark pigmentation. Vitiligo and other causes of colour loss need their own assessment before treatment is discussed.',
        cue:'Areas lighter than the surrounding skin', plan:'Confirm the cause and whether the pattern is active', href:'/concept/vitiligo-treatment/', cta:'Read the vitiligo guide',
        image:photos.vitiligo, alt:'Dermatology consultation image used to illustrate assessment of pigment loss', pos:'50% 42%'
      }
    ];

    old.outerHTML = `<div class="v31-pigment-deck" data-v31-pigment>
      <div class="v31-pigment-photo"><img data-v31-pigment-img src="${states[0].image}" alt="${states[0].alt}" decoding="async"><span class="v31-photo-note">Illustrative photography · not diagnosis</span><div class="v31-photo-index"><small data-v31-photo-index>01 / 04</small><strong data-v31-photo-label>${states[0].label}</strong></div></div>
      <div class="v31-pigment-panel">
        <div class="v31-pigment-copy"><small data-v31-eyebrow>${states[0].eyebrow}</small><h3 data-v31-title>${states[0].title}</h3><p data-v31-copy>${states[0].copy}</p>
          <div class="v31-pigment-facts"><div><small>Common description</small><strong data-v31-cue>${states[0].cue}</strong></div><div><small>What changes the plan</small><strong data-v31-plan>${states[0].plan}</strong></div></div>
          <a class="v31-pigment-cta" data-v31-cta href="${states[0].href}">${states[0].cta} <span>↗</span></a>
        </div>
        <div class="v31-pigment-tabs">${states.map((s,i)=>`<button type="button" data-v31-state="${i}" aria-pressed="${i===0}"><img src="${s.image}" alt="" loading="lazy" decoding="async"><span><small>${String(i+1).padStart(2,'0')}</small><strong>${s.label}</strong></span></button>`).join('')}</div>
      </div>
    </div>`;

    const deck = patterns.querySelector('[data-v31-pigment]');
    const img = deck.querySelector('[data-v31-pigment-img]');
    const fields = {
      eyebrow:deck.querySelector('[data-v31-eyebrow]'), title:deck.querySelector('[data-v31-title]'), copy:deck.querySelector('[data-v31-copy]'),
      cue:deck.querySelector('[data-v31-cue]'), plan:deck.querySelector('[data-v31-plan]'), cta:deck.querySelector('[data-v31-cta]'),
      index:deck.querySelector('[data-v31-photo-index]'), label:deck.querySelector('[data-v31-photo-label]')
    };
    const tabs = [...deck.querySelectorAll('[data-v31-state]')];
    const activate = (i) => {
      const s = states[i]; if (!s) return;
      if (!reduced) { img.classList.add('is-changing'); setTimeout(()=>img.classList.remove('is-changing'),220); }
      setImg(img,s.image,s.alt,s.pos);
      fields.eyebrow.textContent=s.eyebrow; fields.title.textContent=s.title; fields.copy.textContent=s.copy;
      fields.cue.textContent=s.cue; fields.plan.textContent=s.plan; fields.cta.href=s.href; fields.cta.firstChild.textContent=`${s.cta} `;
      fields.index.textContent=`${String(i+1).padStart(2,'0')} / ${String(states.length).padStart(2,'0')}`; fields.label.textContent=s.label;
      tabs.forEach((b,n)=>b.setAttribute('aria-pressed',String(n===i)));
      try { sessionStorage.setItem('aastha:pigment-pattern',String(i)); } catch(e) {}
    };
    tabs.forEach((b,i)=>{
      b.addEventListener('click',()=>activate(i));
      if (matchMedia('(hover:hover) and (pointer:fine)').matches) b.addEventListener('pointerenter',()=>activate(i),{passive:true});
    });
    let initial=0; try { initial=Number(sessionStorage.getItem('aastha:pigment-pattern')||0)||0; } catch(e) {}
    activate(Math.max(0,Math.min(states.length-1,initial)));

    setImg(document.querySelector('.editorial-hero .hero-art img'), photos.pigmentPortrait, 'Close-up portrait showing natural facial pigmentation and freckles', '54% 44%');
  };

  const applyPatientPriorityNavigation = () => {
    const navLinks = document.querySelector('.concept-nav .concept-links');
    if (navLinks) {
      const links = [
        ['Concerns','/concept/conditions/'],
        ['Find your route','/concept/#finder'],
        ['Treatments','/concept/treatments/'],
        ['Doctor','/concept/dr-cheena-langer/'],
        ['Clinics','/concept/locations/']
      ];
      navLinks.innerHTML = links.map(([label,href])=>`<a href="${href}">${label}</a>`).join('');
      navLinks.setAttribute('aria-label','Primary patient navigation');
      navLinks.querySelectorAll('a').forEach(a=>{
        const href=a.getAttribute('href');
        if (href && !href.includes('#') && path===href) a.setAttribute('aria-current','page');
      });
    }

    document.querySelectorAll('.nav-cta').forEach(a=>{a.href='/concept/book-appointment/';a.textContent='Book consultation';});

    const list = document.querySelector('.v3-command-list');
    if (!list) return;
    const groups = [
      ['Start here',[
        ['01','Book consultation','Request an appointment','/concept/book-appointment/'],
        ['02','Concerns','Start with what you are noticing','/concept/conditions/'],
        ['03','Find your route','Guided navigation by concern','/concept/#finder'],
        ['04','Treatments','Browse the treatment directory','/concept/treatments/'],
        ['05','Dr. Cheena Langer','Consultant dermatologist','/concept/dr-cheena-langer/'],
        ['06','Clinics','Karan Nagar and Paloura','/concept/locations/']
      ]],
      ['Common patient guides',[
        ['07','Acne','Active acne, marks and recurrence','/concept/acne-treatment/'],
        ['08','Pigmentation','Melasma, marks and uneven tone','/concept/pigmentation-treatment/'],
        ['09','Hair fall','Shedding, thinning and scalp assessment','/concept/hair-fall-treatment/'],
        ['10','Acne scars','Scar-type assessment and options','/concept/acne-scar-treatment/'],
        ['11','Fungal infection','Recurring fungal rashes and tinea','/concept/fungal-infection-treatment/'],
        ['12','Laser hair reduction','Unwanted facial and body hair','/concept/laser-hair-reduction/'],
        ['13','Melasma','Recurring facial pigmentation','/concept/melasma-treatment/'],
        ['14','Hair transplant','Diagnosis and donor planning','/concept/hair-transplant/']
      ]],
      ['Learn + clinic',[
        ['15','Skin Journal','Patient education articles','/concept/blog/'],
        ['16','Media & updates','Conference, video and clinic updates','/concept/media/'],
        ['17','Karan Nagar','Clinic timings and directions','/concept/locations/karan-nagar/'],
        ['18','Paloura','Clinic timings and directions','/concept/locations/paloura/']
      ]]
    ];
    list.innerHTML = groups.map(([heading,items])=>`<div class="v31-command-group"><div class="v31-command-heading">${heading}</div>${items.map(([n,t,d,h])=>`<a class="v3-command-item" href="${h}" data-search="${(`${t} ${d} ${heading}`).toLowerCase()}"><small>${n}</small><div><strong>${t}</strong><small>${d}</small></div><span>↗</span></a>`).join('')}</div>`).join('');
  };

  const ready = () => {
    patchImageLedHubs();
    rebuildPigmentationExplorer();
    applyPatientPriorityNavigation();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready, {once:true}); else ready();
})();
