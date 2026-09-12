(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const path = location.pathname;

  /* ------------------------------------------------------------------
     Navigation lifecycle: never cache the page with the wine transition
     curtain closed over it. This specifically fixes browser Back/Forward.
  ------------------------------------------------------------------- */
  const resetTransientUI = () => {
    document.body?.classList.remove('is-transitioning');
    document.documentElement.classList.remove('is-transitioning');
    const palette = document.querySelector('.v3-command');
    if (palette && !palette.classList.contains('is-open')) document.body.style.overflow = '';
  };
  resetTransientUI();
  addEventListener('pageshow', resetTransientUI, { passive: true });
  addEventListener('pagehide', resetTransientUI, { passive: true });
  addEventListener('popstate', resetTransientUI, { passive: true });
  addEventListener('beforeunload', resetTransientUI, { passive: true });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) resetTransientUI(); });

  // Keep a slim reading-progress line on substantive pages.
  if (!document.querySelector('.v6-reading-progress')) {
    const progress = document.createElement('div');
    progress.className = 'v6-reading-progress';
    progress.setAttribute('aria-hidden','true');
    document.body.appendChild(progress);
    const updateProgress = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      progress.style.width = `${Math.min(100, Math.max(0, (scrollY / max) * 100))}%`;
    };
    updateProgress();
    addEventListener('scroll', updateProgress, { passive:true });
    addEventListener('resize', updateProgress, { passive:true });
  }

  /* ------------------------------------------------------------------
     Explore console: reorganize the accumulated destination list into
     meaningful groups and fix the title/subtitle collision shown in QA.
  ------------------------------------------------------------------- */
  const palette = document.querySelector('.v3-command');
  const list = palette?.querySelector('.v3-command-list');
  const search = palette?.querySelector('.v3-command-head input');
  if (palette && list && search && !palette.dataset.v6Organized) {
    palette.dataset.v6Organized = 'true';
    const items = [...list.querySelectorAll('.v3-command-item')];
    const classify = (item) => {
      const href = item.getAttribute('href') || '';
      const title = item.querySelector('strong')?.textContent?.toLowerCase() || '';
      if (/karan|paloura|location/.test(title) || href.includes('/locations/')) return 'Clinics';
      if (/home|doctor|book/.test(title)) return 'Start here';
      if (/conditions|acne|pigment|melasma|eczema|psoriasis|urticaria|fungal|vitiligo|alopecia|dandruff|hair fall/.test(title) && !/treatment directory/.test(item.textContent.toLowerCase())) return 'Concerns';
      return 'Treatments & procedures';
    };
    const order = ['Start here','Concerns','Treatments & procedures','Clinics'];
    const grouped = new Map(order.map(g => [g, []]));
    items.forEach(item => {
      const group = classify(item);
      if (!grouped.has(group)) grouped.set(group, []);
      grouped.get(group).push(item);
    });
    list.innerHTML = '';
    const meta = document.createElement('div');
    meta.className = 'v6-command-meta';
    meta.innerHTML = `<span>Navigate Aastha</span><span data-v6-result-count>${items.length} destinations</span>`;
    list.appendChild(meta);
    order.forEach(groupName => {
      const groupItems = grouped.get(groupName) || [];
      if (!groupItems.length) return;
      const group = document.createElement('section');
      group.className = 'v6-command-group';
      group.dataset.commandGroup = groupName;
      const heading = document.createElement('div');
      heading.className = 'v6-command-group-title';
      heading.textContent = groupName;
      const grid = document.createElement('div');
      grid.className = 'v6-command-grid';
      groupItems.forEach(item => grid.appendChild(item));
      group.append(heading, grid);
      list.appendChild(group);
    });
    const empty = document.createElement('div');
    empty.className = 'v6-command-empty';
    empty.innerHTML = '<strong>No matching pathway.</strong><br>Try a condition, treatment, doctor or clinic name.';
    list.appendChild(empty);

    const allItems = [...list.querySelectorAll('.v3-command-item')];
    const groups = [...list.querySelectorAll('.v6-command-group')];
    const count = list.querySelector('[data-v6-result-count]');
    const runSearch = () => {
      const q = search.value.trim().toLowerCase();
      let visible = 0;
      allItems.forEach(item => {
        const haystack = `${item.dataset.search || ''} ${item.textContent || ''}`.toLowerCase();
        const show = !q || haystack.includes(q);
        item.hidden = !show;
        if (show) visible += 1;
      });
      groups.forEach(group => {
        group.hidden = ![...group.querySelectorAll('.v3-command-item')].some(i => !i.hidden);
      });
      if (count) count.textContent = `${visible} ${visible === 1 ? 'destination' : 'destinations'}`;
      empty.classList.toggle('is-visible', visible === 0);
    };
    search.addEventListener('input', runSearch);
    search.addEventListener('keydown', (e) => {
      if (!['ArrowDown','ArrowUp','Enter'].includes(e.key)) return;
      const visibleItems = allItems.filter(i => !i.hidden);
      if (!visibleItems.length) return;
      const active = document.activeElement.closest?.('.v3-command-item');
      if (e.key === 'Enter' && active) return;
      e.preventDefault();
      if (e.key === 'ArrowDown') (active ? visibleItems[(visibleItems.indexOf(active)+1)%visibleItems.length] : visibleItems[0]).focus();
      if (e.key === 'ArrowUp') (active ? visibleItems[(visibleItems.indexOf(active)-1+visibleItems.length)%visibleItems.length] : visibleItems.at(-1)).focus();
    });
    runSearch();
  }

  /* ------------------------------------------------------------------
     Homepage care section: add decision density around the existing
     scroll-linked five-step story rather than adding more empty height.
  ------------------------------------------------------------------- */
  const approach = document.querySelector('#approach .concept-shell');
  const processStage = approach?.querySelector('.process-stage');
  if (approach && processStage && !approach.querySelector('.v6-care-ribbon')) {
    const ribbon = document.createElement('div');
    ribbon.className = 'v6-care-ribbon';
    ribbon.innerHTML = `
      <article><small>What we start with</small><strong>Your history</strong><p>Duration, symptoms, previous treatment, medicines and relevant triggers.</p></article>
      <article><small>What changes direction</small><strong>Examination</strong><p>Similar-looking skin and hair concerns can require completely different plans.</p></article>
      <article><small>What gets discussed</small><strong>Options + trade-offs</strong><p>Expected benefit, limitations, recovery, maintenance and alternatives.</p></article>
      <article><small>What happens later</small><strong>Review</strong><p>The plan can be continued, simplified or changed according to response.</p></article>`;
    processStage.insertAdjacentElement('beforebegin', ribbon);

    const decisions = {
      diagnosis:['Diagnosis','The treatment name should follow the likely diagnosis—not the other way around.'],
      skin:['Skin / hair type','Natural skin tone, sensitivity, hair calibre and pigmentation tendency can change technique and settings.'],
      history:['Medical history','Medicines, pregnancy, allergies, previous procedures and medical conditions may alter suitability.'],
      downtime:['Downtime','The amount of recovery a patient can realistically manage can change which option is sensible.'],
      goals:['Goals','The desired degree of change and realistic expectations matter when choosing between medical and procedural care.']
    };
    const decision = document.createElement('div');
    decision.className = 'v6-decision-grid';
    decision.innerHTML = `<div class="v6-decision-main"><h3>What can change the plan?</h3><div class="v6-decision-chips">${Object.entries(decisions).map(([k,[label]])=>`<button type="button" data-v6-decision="${k}">${label}</button>`).join('')}</div></div><aside class="v6-decision-side"><h3 data-v6-decision-title>Diagnosis</h3><p data-v6-decision-copy>${decisions.diagnosis[1]}</p></aside>`;
    processStage.insertAdjacentElement('afterend', decision);
    const decisionButtons = [...decision.querySelectorAll('[data-v6-decision]')];
    const decisionTitle = decision.querySelector('[data-v6-decision-title]');
    const decisionCopy = decision.querySelector('[data-v6-decision-copy]');
    decisionButtons.forEach((button,i) => {
      button.setAttribute('aria-pressed', String(i===0));
      button.addEventListener('click', () => {
        decisionButtons.forEach(b => b.setAttribute('aria-pressed', String(b===button)));
        const [title,copy] = decisions[button.dataset.v6Decision];
        decisionTitle.textContent = title;
        decisionCopy.textContent = copy;
      });
    });
  }

  /* ------------------------------------------------------------------
     Treatment-page clinical compass. It turns page-specific planning
     factors into an interactive explainer close to the top of the page.
  ------------------------------------------------------------------- */
  const compassProfiles = [
    { match:/acne-scar|mnrf|fractional-co2/, title:'Scar planning compass', intro:'Scar structure matters more than choosing the most aggressive device.', factors:[
      ['Scar type','Rolling, boxcar and ice-pick scars behave differently and may need different techniques.','Structure first'],
      ['Active acne','Continuing inflammatory acne can create new scars and may delay intensive scar procedures.','Control activity'],
      ['Skin tone','Pigmentation tendency influences settings, recovery planning and procedure choice.','Protect pigment'],
      ['Downtime','Acceptable recovery can change whether a staged or more intensive approach is sensible.','Plan recovery'] ]},
    { match:/pigmentation|melasma|q-switched|chemical-peels/, title:'Pigment planning compass', intro:'Pigmentation is a category, not a diagnosis. Cause, depth and recurrence change the pathway.', factors:[
      ['Diagnosis','Melasma, PIH, freckles and other pigment disorders can look similar but respond differently.','Name the pattern'],
      ['Depth / distribution','Superficial, dermal or mixed pigment and the way it is distributed can influence treatment choice.','Map the pigment'],
      ['Triggers','Sunlight, visible light, hormones, inflammation, heat and irritating skincare may keep pigment active.','Control triggers'],
      ['Maintenance','Long-term photoprotection and maintenance often matter as much as the procedure itself.','Think long term'] ]},
    { match:/hair-fall|hair-transplant|prp-gfc|alopecia|seborrheic/, title:'Hair & scalp compass', intro:'Hair loss and scalp symptoms need pattern recognition before procedures.', factors:[
      ['Pattern','Gradual thinning, sudden shedding, smooth patches and inflammatory loss point toward different diagnoses.','Read the pattern'],
      ['Scalp health','Scale, redness, pain, pustules or scarring can change priorities before growth procedures.','Examine the scalp'],
      ['Progression','How quickly the problem is changing affects expectations and whether surgical planning is premature.','Check stability'],
      ['Medical factors','Recent illness, nutrition, thyroid or hormonal symptoms, medicines and pregnancy history may matter.','Look beyond hair'] ]},
    { match:/laser-hair-reduction/, title:'Laser suitability compass', intro:'Hair reduction depends on the relationship between the hair target and the surrounding skin.', factors:[
      ['Hair pigment','Coarse dark hair usually provides a clearer laser target than very fine, pale or grey hair.','Target matters'],
      ['Skin tone','Skin tone influences device choice, settings and pigment-change risk.','Settings matter'],
      ['Hormonal pattern','Unexpected facial or body hair can sometimes warrant medical assessment alongside laser planning.','Assess cause'],
      ['Course','Hair grows in cycles, so several spaced sessions are commonly required.','Think in cycles'] ]},
    { match:/fungal|eczema|psoriasis|urticaria|vitiligo/, title:'Medical dermatology compass', intro:'Pattern, duration and distribution usually tell us more than a guessed disease name.', factors:[
      ['What it looks like','Scale, rings, plaques, wheals, pigment loss and oozing are different morphological clues.','Describe first'],
      ['How long','A one-week rash and a relapsing six-month condition often need different questions and tests.','Timeline matters'],
      ['Where it occurs','Scalp, folds, nails, face, hands and body distribution can narrow the likely diagnosis.','Distribution matters'],
      ['Triggers / context','Medicines, infections, contact exposures, sweating, immune history and family history may be relevant.','Add context'] ]},
    { match:/botulinum|fillers/, title:'Injectables planning compass', intro:'Aesthetic injection planning begins with anatomy and the type of change—not a preselected syringe.', factors:[
      ['Movement','Dynamic expression lines are different from volume-related concerns.','Movement first'],
      ['Volume / structure','Facial proportions, soft tissue and bone structure influence whether filler is appropriate.','Read anatomy'],
      ['Medical history','Previous injectables, medicines, infection, dental work and medical conditions can affect planning.','Safety first'],
      ['Degree of change','Natural movement and realistic, proportionate change should guide the treatment plan.','Define the goal'] ]},
    { match:/tattoo/, title:'Tattoo-removal compass', intro:'Ink colour, density, depth and skin response determine how predictable laser fading may be.', factors:[
      ['Ink colour','Black and dark blue often behave differently from green, yellow, red or cosmetic flesh-tone pigments.','Wavelength matters'],
      ['Density / depth','Professional, layered and cover-up tattoos can contain more pigment at varying depths.','Ink load matters'],
      ['Skin tone','Natural pigment also absorbs laser energy, so conservative planning may be important in deeper skin tones.','Protect skin'],
      ['Scarring / reaction','Pre-existing scars or allergic tattoo reactions can change the risk-benefit discussion.','Assess the skin'] ]},
    { match:/wart|mole|skin-tag/, title:'Skin-growth compass', intro:'The first question is what the growth actually is—not how quickly it can be removed.', factors:[
      ['Diagnosis','Warts, skin tags, moles, keratoses and other lesions can resemble one another.','Identify first'],
      ['Change','Rapid growth, bleeding, colour change, pain or evolution can make assessment more important than cosmetic removal.','Watch change'],
      ['Site','Face, nails, feet, genital skin and friction areas may need different treatment choices.','Location matters'],
      ['Histology','Some removed lesions may need laboratory examination depending on their appearance and clinical concern.','Preserve diagnosis'] ]},
    { match:/acne-treatment/, title:'Acne planning compass', intro:'Acne treatment changes with severity, lesion type, scarring risk and patient context.', factors:[
      ['Lesion type','Blackheads, inflammatory papules, pustules, nodules and cysts do not carry the same risk.','Classify acne'],
      ['Severity / scars','Deep or scarring acne generally needs faster escalation than occasional mild breakouts.','Prevent damage'],
      ['Skin context','Sensitivity, pigmentation, current skincare and previous medicines affect tolerability.','Fit the skin'],
      ['Medical context','Menstrual or hormonal symptoms, pregnancy plans and medicines may change the treatment menu.','Personalize safely'] ]}
  ];
  const profile = compassProfiles.find(p => p.match.test(path));
  const main = document.querySelector('main');
  const firstContentSection = main?.querySelector('.editorial-hero ~ .editorial-section');
  if (profile && firstContentSection && !document.querySelector('.v6-compass-section')) {
    const section = document.createElement('section');
    section.className = 'editorial-section v6-compass-section';
    section.innerHTML = `<div class="concept-shell"><div class="v6-compass"><div class="v6-compass-head"><div><small>Interactive clinical guide</small><h3>${profile.title}</h3></div><div><p>${profile.intro}</p></div></div><div class="v6-compass-body"><div class="v6-compass-nav">${profile.factors.map(([label],i)=>`<button type="button" data-v6-compass="${i}" aria-selected="${i===0}"><small>0${i+1}</small><strong>${label}</strong></button>`).join('')}</div><div class="v6-compass-stage"><h4 data-v6-compass-title>${profile.factors[0][0]}</h4><p data-v6-compass-copy>${profile.factors[0][1]}</p><span class="v6-compass-tag" data-v6-compass-tag>${profile.factors[0][2]}</span></div></div></div></div>`;
    firstContentSection.insertAdjacentElement('afterend', section);
    const buttons = [...section.querySelectorAll('[data-v6-compass]')];
    const title = section.querySelector('[data-v6-compass-title]');
    const copy = section.querySelector('[data-v6-compass-copy]');
    const tag = section.querySelector('[data-v6-compass-tag]');
    buttons.forEach(button => button.addEventListener('click', () => {
      buttons.forEach(b => b.setAttribute('aria-selected', String(b===button)));
      const factor = profile.factors[Number(button.dataset.v6Compass)];
      title.textContent = factor[0]; copy.textContent = factor[1]; tag.textContent = factor[2];
      if (!reduced) section.querySelector('.v6-compass-stage')?.animate([{opacity:.72,transform:'translateY(4px)'},{opacity:1,transform:'translateY(0)'}],{duration:220,easing:'ease-out'});
    }));
  }

  /* ------------------------------------------------------------------
     Next migration batch: keep legacy links inside the premium concept.
  ------------------------------------------------------------------- */
  const routeMap = new Map([
    ['/treatments/prp-gfc-hair-treatment/','/concept/prp-gfc-hair-treatment/'],
    ['/treatments/seborrheic-dermatitis-dandruff/','/concept/seborrheic-dermatitis-dandruff/'],
    ['/treatments/alopecia-areata-treatment/','/concept/alopecia-areata-treatment/'],
    ['/treatments/vitiligo-treatment/','/concept/vitiligo-treatment/'],
    ['/treatments/laser-tattoo-removal/','/concept/laser-tattoo-removal/'],
    ['/treatments/wart-mole-skin-tag-removal/','/concept/wart-mole-skin-tag-removal/']
  ]);
  document.querySelectorAll('a[href^="/"]').forEach(a => {
    const mapped = routeMap.get(a.getAttribute('href'));
    if (mapped) a.setAttribute('href', mapped);
  });

  // Add the newly migrated pages to Explore before v6 grouping on future loads;
  // on this load they are appended into the relevant group directly.
  const destinations = [
    ['24','PRP & GFC hair','Growth-factor-based supportive hair procedures','/concept/prp-gfc-hair-treatment/','Treatments & procedures'],
    ['25','Dandruff & seborrheic dermatitis','Scalp, face and fold inflammation','/concept/seborrheic-dermatitis-dandruff/','Concerns'],
    ['26','Alopecia areata','Sudden smooth patchy hair loss','/concept/alopecia-areata-treatment/','Concerns'],
    ['27','Vitiligo','Assessment of depigmented white patches','/concept/vitiligo-treatment/','Concerns'],
    ['28','Laser tattoo removal','Ink colour, skin tone and staged fading','/concept/laser-tattoo-removal/','Treatments & procedures'],
    ['29','Warts, moles & skin tags','Assessment before minor-procedure removal','/concept/wart-mole-skin-tag-removal/','Treatments & procedures']
  ];
  const commandList = document.querySelector('.v3-command-list');
  if (commandList) {
    destinations.forEach(([n,t,d,h,groupName]) => {
      if (commandList.querySelector(`a[href="${h}"]`)) return;
      const a = document.createElement('a');
      a.className='v3-command-item'; a.href=h; a.dataset.search=`${t} ${d}`.toLowerCase();
      a.innerHTML=`<small>${n}</small><div><strong>${t}</strong><small>${d}</small></div><span>↗</span>`;
      const group = commandList.querySelector(`[data-command-group="${groupName}"] .v6-command-grid`);
      (group || commandList).appendChild(a);
    });
    search?.dispatchEvent(new Event('input'));
  }
})();
