(() => {
  // Replace the demo-like route finder with area-specific, plausible pathways.
  const finder = document.querySelector('[data-route-finder]');
  if (finder) {
    const routes = {
      face: {
        label: 'Face',
        title: 'Face concerns',
        copy: 'Breakouts, scars, pigment, redness and age-related concerns often overlap. Start with what you can actually see or feel.',
        concerns: [
          ['Breakouts / blackheads','Acne','Active breakouts, blocked pores and recurring acne.','/concept/acne-treatment/'],
          ['Pits / uneven texture','Acne scars','Rolling, boxcar and ice-pick scars need scar-type planning.','/concept/acne-scar-treatment/'],
          ['Dark marks / uneven tone','Pigmentation','Post-acne marks, uneven pigmentation and related colour changes.','/concept/pigmentation-treatment/'],
          ['Symmetrical brown patches','Melasma','Recurring facial pigmentation influenced by light, hormones and individual tendency.','/concept/melasma-treatment/'],
          ['Frequent flushing / redness','Redness & rosacea','Explore redness and sensitive-skin conditions through the concern directory.','/concept/conditions/'],
          ['Expression lines / volume','Injectables consultation','Understand movement-related lines versus volume-related concerns.','/concept/botulinum-toxin-dermal-fillers/']
        ]
      },
      scalp: {
        label: 'Scalp & hair',
        title: 'Scalp & hair concerns',
        copy: 'Hair loss is not one diagnosis. Shedding, gradual thinning, patchy loss and scalp inflammation lead to different pathways.',
        concerns: [
          ['Gradual thinning','Hair fall','Patterned thinning, widening part or receding hairline.','/concept/hair-fall-treatment/'],
          ['Sudden heavy shedding','Hair fall assessment','Recent illness, stress, nutrition, hormones and other causes may matter.','/concept/hair-fall-treatment/'],
          ['Smooth bald patches','Patchy hair loss','Alopecia areata and other patchy-loss patterns need examination.','/concept/conditions/'],
          ['Flaking / itchy scalp','Scalp inflammation','Dandruff, seborrhoeic dermatitis and psoriasis can look similar.','/concept/conditions/'],
          ['Considering surgery','Hair transplant','Check diagnosis, donor supply and stability before surgical planning.','/concept/hair-transplant/'],
          ['Hair-support procedures','Hair treatment options','PRP, GFC and other supportive procedures should follow diagnosis.','/concept/treatments/']
        ]
      },
      body: {
        label: 'Body / folds',
        title: 'Body & skin-fold concerns',
        copy: 'Itch, scale, rings, plaques and wheals can represent very different conditions. Choose the closest visible pattern, not a guessed diagnosis.',
        concerns: [
          ['Ring-shaped itchy rash','Fungal infection','Ringworm, groin fungal infection, athlete’s foot and recurrent tinea.','/concept/fungal-infection-treatment/'],
          ['Dry / itchy recurrent patches','Eczema','Barrier weakness, inflammation, triggers and recurrent eczema patterns.','/concept/eczema-atopic-dermatitis-treatment/'],
          ['Thick scaly plaques','Psoriasis','Skin, scalp, folds and nail psoriasis require long-term disease control.','/concept/psoriasis-treatment/'],
          ['Raised welts that move','Urticaria / hives','Transient itchy wheals, angioedema and recurrent hives.','/concept/urticaria-hives-treatment/'],
          ['Chest / back breakouts','Body acne','Acne can also affect the chest, shoulders and back.','/concept/acne-treatment/'],
          ['Unwanted coarse hair','Laser hair reduction','Suitability depends on hair pigment, thickness, skin tone and hormonal factors.','/concept/laser-hair-reduction/']
        ]
      },
      nails: {
        label: 'Nails / growths',
        title: 'Nails, growths & minor procedures',
        copy: 'Nail changes and skin growths are better sorted by what has changed—colour, thickness, pain, bleeding or growth—than by self-diagnosis.',
        concerns: [
          ['Thick / discoloured nails','Nail changes','Fungal infection, psoriasis, trauma and other nail disorders can overlap.','/concept/conditions/'],
          ['Wart-like growth','Warts & growths','Browse assessment-led pathways for warts and other skin growths.','/concept/conditions/'],
          ['Mole changing / bleeding','Changing pigmented lesion','A changing or bleeding lesion should be medically assessed before cosmetic removal.','/concept/conditions/'],
          ['Skin tags / benign bumps','Minor procedures','Explore assessment of skin tags and other benign growths.','/concept/treatments/'],
          ['Painful lump / cyst','Cysts & swellings','Painful or inflamed lumps may need procedural or medical assessment.','/concept/conditions/'],
          ['Ingrown / painful nail','Nail procedure assessment','Persistent pain, swelling or discharge may need examination and procedural care.','/concept/conditions/']
        ]
      }
    };

    finder.className = 'v5-route spotlight-panel';
    finder.removeAttribute('data-route-finder');
    finder.innerHTML = `
      <div class="v5-route-areas">
        <span>Step 1 · Where?</span>
        <div class="v5-area-buttons">
          ${Object.entries(routes).map(([key,area],i)=>`<button type="button" data-v5-area="${key}" aria-pressed="${i===0}">${area.label}</button>`).join('')}
        </div>
        <p class="v5-route-note">Navigation only · this does not diagnose a condition</p>
      </div>
      <div class="v5-route-stage">
        <span>Step 2 · What is closest?</span>
        <h3 data-v5-route-title></h3>
        <p data-v5-route-copy></p>
        <div class="v5-concern-grid" data-v5-concerns></div>
        <div class="v5-route-result"><div><strong data-v5-result-title></strong><p data-v5-result-copy></p></div><a class="btn" data-v5-result-link href="/concept/acne-treatment/">Open pathway →</a></div>
      </div>`;

    const areaButtons = [...finder.querySelectorAll('[data-v5-area]')];
    const title = finder.querySelector('[data-v5-route-title]');
    const copy = finder.querySelector('[data-v5-route-copy]');
    const concernGrid = finder.querySelector('[data-v5-concerns]');
    const resultTitle = finder.querySelector('[data-v5-result-title]');
    const resultCopy = finder.querySelector('[data-v5-result-copy]');
    const resultLink = finder.querySelector('[data-v5-result-link]');

    const activateConcern = (button) => {
      [...concernGrid.querySelectorAll('.v5-concern')].forEach((b)=>b.setAttribute('aria-pressed',String(b===button)));
      resultTitle.textContent = button.dataset.resultTitle || '';
      resultCopy.textContent = button.dataset.resultCopy || '';
      resultLink.href = button.dataset.resultHref || '/concept/conditions/';
    };

    const activateArea = (key) => {
      const area = routes[key];
      areaButtons.forEach((b)=>b.setAttribute('aria-pressed',String(b.dataset.v5Area===key)));
      title.textContent = area.title;
      copy.textContent = area.copy;
      concernGrid.innerHTML = area.concerns.map(([label,result,resultCopy,href],i)=>`<button type="button" class="v5-concern" aria-pressed="${i===0}" data-result-title="${result.replace(/"/g,'&quot;')}" data-result-copy="${resultCopy.replace(/"/g,'&quot;')}" data-result-href="${href}"><small>${String(i+1).padStart(2,'0')}</small><strong>${label}</strong></button>`).join('');
      const concernButtons = [...concernGrid.querySelectorAll('.v5-concern')];
      concernButtons.forEach((button)=>button.addEventListener('click',()=>activateConcern(button)));
      if (concernButtons[0]) activateConcern(concernButtons[0]);
    };

    areaButtons.forEach((button)=>button.addEventListener('click',()=>activateArea(button.dataset.v5Area)));
    activateArea('face');
  }

  // Extend premium-route rewiring for the next migration batch.
  const moreRoutes = new Map([
    ['/treatments/mnrf-treatment/','/concept/mnrf-treatment/'],
    ['/treatments/fractional-co2-laser/','/concept/fractional-co2-laser/'],
    ['/treatments/chemical-peels/','/concept/chemical-peels/'],
    ['/treatments/q-switched-laser-toning/','/concept/q-switched-laser-toning/'],
    ['/treatments/eczema-atopic-dermatitis-treatment/','/concept/eczema-atopic-dermatitis-treatment/'],
    ['/treatments/psoriasis-treatment/','/concept/psoriasis-treatment/'],
    ['/treatments/urticaria-hives-treatment/','/concept/urticaria-hives-treatment/']
  ]);
  document.querySelectorAll('a[href^="/"]').forEach((a)=>{
    const mapped=moreRoutes.get(a.getAttribute('href'));
    if(mapped)a.setAttribute('href',mapped);
  });

  // Add migrated pages to the command palette.
  const paletteList=document.querySelector('.v3-command-list');
  if(paletteList){
    const extras=[
      ['17','MNRF','Microneedling radiofrequency for selected scars and texture','/concept/mnrf-treatment/'],
      ['18','Fractional CO₂ laser','Resurfacing for selected scars and texture concerns','/concept/fractional-co2-laser/'],
      ['19','Chemical peels','Diagnosis-led peel selection for acne and pigmentation','/concept/chemical-peels/'],
      ['20','Q-switched laser','Pigment-targeting laser and laser toning pathways','/concept/q-switched-laser-toning/'],
      ['21','Eczema','Atopic dermatitis, barrier care and flare control','/concept/eczema-atopic-dermatitis-treatment/'],
      ['22','Psoriasis','Long-term skin, scalp and nail psoriasis care','/concept/psoriasis-treatment/'],
      ['23','Urticaria','Hives, angioedema and recurrent wheals','/concept/urticaria-hives-treatment/']
    ];
    extras.forEach(([n,t,d,h])=>{
      if(paletteList.querySelector(`a[href="${h}"]`))return;
      const a=document.createElement('a');a.className='v3-command-item';a.href=h;a.dataset.search=`${t} ${d}`.toLowerCase();a.innerHTML=`<small>${n}</small><div><strong>${t}</strong><small>${d}</small></div><span>↗</span>`;paletteList.appendChild(a);
    });
  }
})();
