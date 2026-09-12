(() => {
  const path = location.pathname;

  /* Keep every migrated destination inside the premium concept. This also
     rewrites data-href values used by interactive concern buttons. */
  const premiumRoutes = new Map([
    ['/','/concept/'],['/conditions/','/concept/conditions/'],['/treatments/','/concept/treatments/'],['/dr-cheena-langer/','/concept/dr-cheena-langer/'],
    ['/locations/','/concept/locations/'],['/locations/karan-nagar/','/concept/locations/karan-nagar/'],['/locations/paloura/','/concept/locations/paloura/'],
    ['/treatments/acne-treatment/','/concept/acne-treatment/'],['/treatments/acne-scar-treatment/','/concept/acne-scar-treatment/'],
    ['/treatments/pigmentation-treatment/','/concept/pigmentation-treatment/'],['/treatments/melasma-treatment/','/concept/melasma-treatment/'],
    ['/treatments/hair-fall-treatment/','/concept/hair-fall-treatment/'],['/treatments/hair-transplant/','/concept/hair-transplant/'],
    ['/treatments/laser-hair-reduction/','/concept/laser-hair-reduction/'],['/treatments/fungal-infection-treatment/','/concept/fungal-infection-treatment/'],
    ['/treatments/botulinum-toxin-dermal-fillers/','/concept/botulinum-toxin-dermal-fillers/'],['/treatments/mnrf-treatment/','/concept/mnrf-treatment/'],
    ['/treatments/fractional-co2-laser/','/concept/fractional-co2-laser/'],['/treatments/chemical-peels/','/concept/chemical-peels/'],
    ['/treatments/q-switched-laser-toning/','/concept/q-switched-laser-toning/'],['/treatments/eczema-atopic-dermatitis-treatment/','/concept/eczema-atopic-dermatitis-treatment/'],
    ['/treatments/psoriasis-treatment/','/concept/psoriasis-treatment/'],['/treatments/urticaria-hives-treatment/','/concept/urticaria-hives-treatment/'],
    ['/treatments/prp-gfc-hair-treatment/','/concept/prp-gfc-hair-treatment/'],['/treatments/seborrheic-dermatitis-dandruff/','/concept/seborrheic-dermatitis-dandruff/'],
    ['/treatments/alopecia-areata-treatment/','/concept/alopecia-areata-treatment/'],['/treatments/vitiligo-treatment/','/concept/vitiligo-treatment/'],
    ['/treatments/laser-tattoo-removal/','/concept/laser-tattoo-removal/'],['/treatments/wart-mole-skin-tag-removal/','/concept/wart-mole-skin-tag-removal/'],
    ['/treatments/contact-dermatitis-treatment/','/concept/contact-dermatitis-treatment/'],['/treatments/rosacea-treatment/','/concept/rosacea-treatment/'],
    ['/treatments/freckles-treatment/','/concept/freckles-treatment/'],['/treatments/dark-circles-under-eye-treatment/','/concept/dark-circles-under-eye-treatment/'],
    ['/treatments/dark-lips-treatment/','/concept/dark-lips-treatment/'],['/treatments/ipl-photofacial/','/concept/ipl-photofacial/']
  ]);
  const rewrite = (value) => premiumRoutes.get(value) || value;
  document.querySelectorAll('a[href^="/"]').forEach(a => a.setAttribute('href', rewrite(a.getAttribute('href'))));
  document.querySelectorAll('[data-href^="/"]').forEach(el => el.dataset.href = rewrite(el.dataset.href));
  document.querySelectorAll('[data-result-href^="/"]').forEach(el => el.dataset.resultHref = rewrite(el.dataset.resultHref));

  /* Restore the cleaner v5 care section. The v6 ribbon + decision box made
     the section busier without making the five-step story clearer. */
  document.querySelectorAll('#approach .v6-care-ribbon,#approach .v6-decision-grid').forEach(el => el.remove());
  const careStage = document.querySelector('#approach .process-stage');
  if (careStage) {
    careStage.classList.add('v7-care-stage');
    const head = document.querySelector('#approach .section-head');
    head?.classList.add('v7-care-head');
  }

  /* Treatment pages should feel related to the acne benchmark: strong page
     orientation, an interactive explainer, then assessment -> route -> FAQ. */
  const isTreatment = path.startsWith('/concept/') && !/\/concept\/(treatments|conditions|locations|dr-cheena-langer)\/?$/.test(path) && path !== '/concept/';
  if (isTreatment) document.body.classList.add('treatment-page','v7-unified-treatment');

  // Make the clinical compass behave visually like Acne's pattern explorer.
  document.querySelectorAll('.v6-compass').forEach(compass => compass.classList.add('pattern-explorer','v7-pattern-system'));

  // Build a compact, visible page map from real section anchors.
  if (isTreatment && !document.querySelector('.v7-page-map')) {
    const main = document.querySelector('main');
    const hero = main?.querySelector('.editorial-hero');
    const sections = [...(main?.querySelectorAll('.editorial-section[id]') || [])].filter(s => s.id).slice(0,8);
    if (hero && sections.length >= 3) {
      const nav = document.createElement('nav');
      nav.className = 'v7-page-map';
      nav.setAttribute('aria-label','On this page');
      nav.innerHTML = `<div class="concept-shell"><span>On this page</span><div>${sections.map((s,i)=>{
        const label = s.querySelector('.section-no')?.textContent?.replace(/^\d+\s*\/\s*/,'') || s.querySelector('h2')?.textContent || `Section ${i+1}`;
        return `<a href="#${s.id}">${label}</a>`;
      }).join('')}</div></div>`;
      hero.insertAdjacentElement('afterend',nav);
    }
  }

  /* Page-specific quick explorer. This is deliberately broad and sourced
     from the same concepts already present on the migrated pages. */
  const profiles = [
    {m:/acne-scar|mnrf|fractional-co2/, title:'Read the scar pattern', items:[['Rolling','Broad depressions can be tethered beneath the skin.'],['Boxcar','Round or oval depressions with clearer edges.'],['Ice-pick','Narrow deeper scars often need focal treatment.'],['Mixed','Many faces have more than one scar architecture.']]},
    {m:/pigmentation|melasma|freckles|dark-circles|dark-lips|q-switched|chemical-peels|ipl-photofacial/, title:'Read the colour pattern', items:[['Pigment','Brown or grey colour may reflect melanin or post-inflammatory change.'],['Vascular','Red, purple or blue colour can reflect visible vessels or inflammation.'],['Structural','Shadow or contour can mimic pigmentation, especially under the eyes.'],['Mixed','More than one cause may be present at the same time.']]},
    {m:/hair-fall|hair-transplant|prp-gfc|alopecia|seborrheic/, title:'Read the hair / scalp pattern', items:[['Gradual thinning','Patterned miniaturisation behaves differently from sudden shedding.'],['Sudden shedding','Recent illness, stress, nutrition or medicines may matter.'],['Smooth patches','Patchy autoimmune loss needs a different pathway.'],['Inflamed scalp','Scale, pain, pustules or scarring can change priorities.']]},
    {m:/eczema|contact-dermatitis|psoriasis|urticaria|fungal|vitiligo|rosacea/, title:'Read what the skin is doing', items:[['Itch / scale','Dryness, scale and itch can occur in several inflammatory conditions.'],['Rings / plaques','Shape and border can be clinically useful clues.'],['Moving wheals','Hives typically move and individual wheals usually fade within 24 hours.'],['Colour change','Redness, brown change, or pigment loss may need different assessment.']]},
    {m:/laser-hair-reduction/, title:'Read the hair target', items:[['Coarse dark hair','Usually gives the clearest laser target.'],['Fine hair','May respond less predictably and needs realistic expectations.'],['Hormonal pattern','Unexpected facial/body hair may need medical context.'],['Skin tone','Device and settings must respect surrounding pigment.']]},
    {m:/tattoo/, title:'Read the ink', items:[['Black / dark blue','Often more predictable laser targets.'],['Red','May require a different wavelength.'],['Green / yellow','Can be more resistant.'],['Cosmetic pigment','Flesh-tone or eyebrow inks can behave unpredictably.']]},
    {m:/wart|mole|skin-tag/, title:'Read the lesion first', items:[['Wart-like','Rough or flat viral warts can mimic other growths.'],['Mole-like','Pigmented lesions should be assessed before cosmetic removal.'],['Skin tag','Soft friction-area growths are usually benign but diagnosis still matters.'],['Changing lesion','Growth, bleeding, colour change or evolution deserves examination.']]},
    {m:/botulinum|fillers/, title:'Read the facial concern', items:[['Movement','Expression lines are movement-related.'],['Volume','Hollows and contour are structural / volume-related.'],['Skin quality','Texture and laxity are not the same as volume loss.'],['Proportion','Anatomy and degree of change should guide treatment.']]}
  ];
  const profile = profiles.find(p => p.m.test(path));
  const existingPattern = document.querySelector('.pattern-explorer:not(.v7-pattern-system)');
  if (isTreatment && profile && !existingPattern && !document.querySelector('.v7-quick-explorer')) {
    const target = document.querySelector('.v6-compass-section') || document.querySelector('main > .editorial-section');
    if (target) {
      const section = document.createElement('section');
      section.className = 'editorial-section v7-quick-explorer';
      section.id = 'explore-pattern';
      section.innerHTML = `<div class="concept-shell"><div class="section-head"><div><span class="section-no">Explore / Pattern</span></div><div><h2 class="display-heading">${profile.title}.</h2><p class="section-copy">Tap a pattern to understand why diagnosis and treatment planning can change.</p></div></div><div class="pattern-explorer"><div class="pattern-tabs">${profile.items.map(([label,copy],i)=>`<button type="button" aria-selected="${i===0}" data-v7-term data-copy="${copy.replace(/"/g,'&quot;')}">${label}</button>`).join('')}</div><div class="pattern-stage"><span class="kicker">Selected pattern</span><h3 data-v7-term-title>${profile.items[0][0]}</h3><p data-v7-term-copy>${profile.items[0][1]}</p><p><strong>Educational context only · not a diagnosis</strong></p></div></div></div>`;
      target.insertAdjacentElement('afterend',section);
      const buttons=[...section.querySelectorAll('[data-v7-term]')];
      const title=section.querySelector('[data-v7-term-title]'); const copy=section.querySelector('[data-v7-term-copy]');
      buttons.forEach(button=>button.addEventListener('click',()=>{
        buttons.forEach(b=>b.setAttribute('aria-selected',String(b===button)));
        title.textContent=button.textContent; copy.textContent=button.dataset.copy || '';
      }));
    }
  }

  // Keep command-palette destinations premium too, including newly imported pages.
  document.querySelectorAll('.v3-command-item[href^="/"]').forEach(a => a.setAttribute('href',rewrite(a.getAttribute('href'))));
})();
