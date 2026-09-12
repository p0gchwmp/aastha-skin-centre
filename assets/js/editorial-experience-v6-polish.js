(() => {
  const finder = document.querySelector('.v5-route');
  const enhanceFinder = () => {
    if (!finder) return;
    const activeArea = finder.querySelector('[data-v5-area][aria-pressed="true"]')?.dataset.v5Area;
    const title = finder.querySelector('[data-v5-result-title]');
    const copy = finder.querySelector('[data-v5-result-copy]');
    const link = finder.querySelector('[data-v5-result-link]');
    const grid = finder.querySelector('[data-v5-concerns]');
    if (!grid) return;
    const rewires = [
      [/smooth bald patches/i,'Alopecia areata','Sudden smooth patchy loss can fit alopecia areata and should be distinguished from fungal or scarring hair loss.','/concept/alopecia-areata-treatment/'],
      [/flaking \/ itchy scalp/i,'Dandruff & seborrheic dermatitis','Recurring scalp scale, itching and facial/ear involvement can fit seborrheic dermatitis.','/concept/seborrheic-dermatitis-dandruff/'],
      [/wart-like growth/i,'Wart assessment','Warts can resemble other growths; confirm the diagnosis before freezing, cautery or home treatment.','/concept/wart-mole-skin-tag-removal/'],
      [/mole changing \/ bleeding/i,'Changing mole assessment','Changing, bleeding or unusual pigmented lesions should be assessed before cosmetic removal.','/concept/wart-mole-skin-tag-removal/'],
      [/skin tags \/ benign bumps/i,'Skin tag / benign growth assessment','A suspected skin tag should be identified before removal because other lesions can look similar.','/concept/wart-mole-skin-tag-removal/']
    ];
    [...grid.querySelectorAll('.v5-concern')].forEach(btn => {
      const label = btn.querySelector('strong')?.textContent || '';
      const match = rewires.find(([rx]) => rx.test(label));
      if (!match) return;
      btn.dataset.resultTitle = match[1]; btn.dataset.resultCopy = match[2]; btn.dataset.resultHref = match[3];
    });
    if ((activeArea === 'face' || activeArea === 'body') && !grid.querySelector('[data-v6-vitiligo-route]')) {
      const btn = document.createElement('button');
      btn.type='button'; btn.className='v5-concern'; btn.setAttribute('aria-pressed','false'); btn.dataset.v6VitiligoRoute='true';
      btn.innerHTML='<small>07</small><strong>White depigmented patches</strong>';
      btn.addEventListener('click', () => {
        grid.querySelectorAll('.v5-concern').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));
        if(title)title.textContent='Vitiligo / white-patch assessment';
        if(copy)copy.textContent='Not every white patch is vitiligo. Pattern, scale, activity and distribution help separate vitiligo from other causes.';
        if(link)link.href='/concept/vitiligo-treatment/';
      });
      grid.appendChild(btn);
    }
  };
  enhanceFinder();
  finder?.addEventListener('click', e => { if (e.target.closest('[data-v5-area]')) setTimeout(enhanceFinder,0); });

  const related = {
    '/concept/prp-gfc-hair-treatment/':[['Hair fall','Start with the hair-loss diagnosis','/concept/hair-fall-treatment/'],['Alopecia areata','See a different patchy-loss pathway','/concept/alopecia-areata-treatment/'],['Hair transplant','Understand surgical suitability','/concept/hair-transplant/']],
    '/concept/seborrheic-dermatitis-dandruff/':[['Hair fall','Separate shedding from scalp inflammation','/concept/hair-fall-treatment/'],['Psoriasis','Compare another scaly scalp condition','/concept/psoriasis-treatment/'],['Conditions','Browse medical dermatology','/concept/conditions/']],
    '/concept/alopecia-areata-treatment/':[['Hair fall','Compare gradual thinning and shedding','/concept/hair-fall-treatment/'],['Dandruff','Explore scalp inflammation and scale','/concept/seborrheic-dermatitis-dandruff/'],['Book','Request patchy-hair-loss assessment','/book-appointment/']],
    '/concept/vitiligo-treatment/':[['Conditions','Browse other skin conditions','/concept/conditions/'],['Pigmentation','Compare pigment increase vs pigment loss','/concept/pigmentation-treatment/'],['Book','Request white-patch assessment','/book-appointment/']],
    '/concept/laser-tattoo-removal/':[['Q-switched laser','Understand pigment-targeting laser principles','/concept/q-switched-laser-toning/'],['Treatments','Browse laser and procedural care','/concept/treatments/'],['Book','Request tattoo assessment','/book-appointment/']],
    '/concept/wart-mole-skin-tag-removal/':[['Conditions','Browse skin-growth concerns','/concept/conditions/'],['Treatments','Browse minor procedures','/concept/treatments/'],['Book','Request lesion assessment','/book-appointment/']]
  };
  const rows = related[location.pathname];
  const footer = document.querySelector('.concept-footer');
  if (rows && footer && !document.querySelector('.v4-related')) {
    const section = document.createElement('section');
    section.className='v4-related';
    section.innerHTML=`<div class="concept-shell"><div class="v4-related-head"><h2>Continue exploring.</h2><span>Related paths</span></div><div class="v4-related-grid">${rows.map(([t,d,h],i)=>`<a class="v4-related-card" href="${h}"><small>0${i+1}</small><strong>${t}</strong><span>${d} →</span></a>`).join('')}</div></div>`;
    footer.insertAdjacentElement('beforebegin',section);
  }
})();
