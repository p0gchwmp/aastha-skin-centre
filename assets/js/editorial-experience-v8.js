(() => {
  const path = location.pathname;
  document.body.classList.add('v8-dark-system');

  const v8Routes = new Map([
    ['/treatments/hifu-treatment/','/concept/hifu-treatment/'],
    ['/treatments/rf-skin-tightening/','/concept/rf-skin-tightening/'],
    ['/treatments/hydrafacial-medifacial/','/concept/hydrafacial-medifacial/'],
    ['/treatments/dpn-seborrheic-keratosis-removal/','/concept/dpn-seborrheic-keratosis-removal/'],
    ['/treatments/lichen-planus-treatment/','/concept/lichen-planus-treatment/'],
    ['/treatments/sun-damage-treatment/','/concept/sun-damage-treatment/'],
    ['/book-appointment/','/concept/book-appointment/'],
    ['/contact/','/concept/contact/']
  ]);
  const rewrite = value => v8Routes.get(value) || value;
  const rewriteRoutes = () => {
    document.querySelectorAll('a[href^="/"]').forEach(a => a.setAttribute('href', rewrite(a.getAttribute('href'))));
    document.querySelectorAll('[data-href^="/"]').forEach(el => el.dataset.href = rewrite(el.dataset.href));
    document.querySelectorAll('[data-result-href^="/"]').forEach(el => el.dataset.resultHref = rewrite(el.dataset.resultHref));
  };
  rewriteRoutes();

  /* Dossier-style media plates turn generic repository SVGs into intentional
     editorial supporting graphics until real clinic photography is supplied. */
  const plateProfiles = [
    {m:/\/concept\/?$/,label:'Aastha Skin Centre',title:'Diagnosis before treatment.',copy:'Medical dermatology, hair and scalp care, lasers and selected aesthetic procedures across two Jammu clinics.',facts:['Doctor|MD Dermatology','Clinics|Karan Nagar + Paloura','Approach|Assessment-led']},
    {m:/dr-cheena-langer/,label:'Professional profile',title:'Dr. Cheena Langer.',copy:'MBBS, MD Dermatology · Consultant Dermatologist · more than 20 years in medicine.',facts:['Qualification|MBBS · MD Dermatology','Practice|Jammu','Focus|Skin · hair · laser']},
    {m:/locations\/karan-nagar/,label:'Clinic dossier',title:'Karan Nagar.',copy:'Lane 2, near Amphalla Chowk · daytime dermatologist consultations in Jammu.',facts:['Doctor|Mon–Sat 11–4','Sunday|11–3','Reception|Mon–Sat 10–8']},
    {m:/locations\/paloura/,label:'Clinic dossier',title:'Paloura Chowk.',copy:'Top Paloura, opposite Government Senior Secondary School · evening dermatologist consultations.',facts:['Doctor|Mon–Sat 6–8','Sunday|10:30–12','Reception|Mon–Sat 10–8']},
    {m:/acne-treatment/,label:'Acne medicine',title:'Inflammation first.',copy:'Active lesions, severity and scar risk decide how quickly treatment needs to escalate.',facts:['Target|Active acne','Plan|Control → maintain','Reality|Scars need a separate phase']},
    {m:/acne-scar|mnrf|fractional-co2/,label:'Scar architecture',title:'Structure decides.',copy:'Rolling, boxcar and ice-pick scars do not behave like one single condition.',facts:['Target|Scar morphology','Plan|Sequence procedures','Reality|Combination care is common']},
    {m:/pigmentation|melasma|freckles|dark-circles|dark-lips|q-switched|chemical-peels|ipl|sun-damage/,label:'Pigment / colour',title:'Cause before colour.',copy:'Melanin, vessels, inflammation, shadow and sun damage can produce very different-looking colour changes.',facts:['Target|Pattern + depth','Plan|Protect → treat','Reality|Maintenance matters']},
    {m:/hair-fall|hair-transplant|prp-gfc|alopecia|seborrheic/,label:'Hair & scalp',title:'Pattern before procedure.',copy:'Gradual thinning, shedding, smooth patches and inflamed scalp require different pathways.',facts:['Target|Hair-loss pattern','Plan|Diagnose → stabilise','Reality|Destroyed follicles differ']},
    {m:/laser-hair-reduction/,label:'Laser hair reduction',title:'Hair is the target.',copy:'Hair pigment, calibre, skin tone and hormonal context influence response and settings.',facts:['Target|Melanin in hair','Plan|Treat in cycles','Reality|Reduction, not zero-hair promise']},
    {m:/tattoo/,label:'Tattoo laser',title:'Ink behaves differently.',copy:'Colour, density, depth, cover-up layers and skin tone all change the laser-removal pathway.',facts:['Target|Tattoo pigment','Plan|Stage sessions','Reality|Complete clearance varies']},
    {m:/hifu-treatment/,label:'Focused ultrasound',title:'Depth is deliberate.',copy:'Focused ultrasound places energy below the surface for selected mild-to-moderate laxity.',facts:['Target|Selected tissue layers','Plan|Map anatomy first','Reality|Not a facelift']},
    {m:/rf-skin-tightening/,label:'Surface radiofrequency',title:'Controlled heat.',copy:'Non-invasive RF warms tissue from the skin surface and is different from needle-based RF procedures.',facts:['Target|Mild laxity','Plan|Monitor heat + comfort','Reality|Device protocols vary']},
    {m:/hydrafacial|medifacial/,label:'Skin-quality facial',title:'Custom, not standard.',copy:'Hydration, congestion and surface texture need a different facial sequence from sensitive or inflamed skin.',facts:['Target|Surface quality','Plan|Assess → customise','Reality|Supportive, not curative']},
    {m:/botulinum|fillers/,label:'Injectables',title:'Anatomy first.',copy:'Movement-related lines and volume-related concerns need different tools and different risk discussions.',facts:['Target|Movement / structure','Plan|Map anatomy','Reality|Natural change, not a template']},
    {m:/wart|mole|skin-tag|dpn/,label:'Skin growths',title:'Identify before removing.',copy:'Benign growths can resemble one another, and changing lesions should be assessed before cosmetic removal.',facts:['Target|Lesion diagnosis','Plan|Assess → choose method','Reality|Some tissue needs histology']},
    {m:/eczema|contact-dermatitis|psoriasis|urticaria|fungal|vitiligo|rosacea|lichen-planus/,label:'Medical dermatology',title:'Pattern is evidence.',copy:'Distribution, duration, morphology and associated symptoms guide diagnosis before treatment.',facts:['Target|Diagnosis','Plan|Control disease activity','Reality|Chronic conditions may recur']},
    {m:/book-appointment/,label:'Appointment request',title:'Tell reception once.',copy:'Choose a clinic, concern and preferred timing; the request opens as a prepared WhatsApp message for confirmation.',facts:['Fee|₹500 consultation','Follow-up|Same concern · 10 days','Confirmation|Reception confirms']},
    {m:/contact/,label:'Contact Aastha',title:'Choose your channel.',copy:'Call, WhatsApp, email or get directions to either Jammu clinic.',facts:['Primary|7006613362','Clinics|2 in Jammu','WhatsApp|Reception']}
  ];
  const plateProfile = plateProfiles.find(p => p.m.test(path));
  const heroArt = document.querySelector('.editorial-hero .hero-art');
  if (heroArt && plateProfile && !heroArt.querySelector('.v8-clinical-plate')) {
    const [f1,f2,f3] = plateProfile.facts.map(f => f.split('|'));
    const plate = document.createElement('div');
    plate.className = 'v8-clinical-plate';
    plate.innerHTML = `<div class="v8-plate-top"><small>Aastha dossier<br>Jammu</small><strong>${plateProfile.label}</strong></div><div class="v8-plate-core"><span>Context before action</span><h3>${plateProfile.title}</h3><p>${plateProfile.copy}</p></div><div class="v8-plate-footer"><div><small>${f1[0]}</small><strong>${f1[1]}</strong></div><div><small>${f2[0]}</small><strong>${f2[1]}</strong></div><div><small>${f3[0]}</small><strong>${f3[1]}</strong></div></div>`;
    heroArt.appendChild(plate);
    const caption = heroArt.querySelector('figcaption');
    if (caption) caption.style.display = 'none';
  }

  /* Dark treatment-route theatre. Homepage How care works remains clean. */
  const treatmentRoute = [...document.querySelectorAll('.process-stage')].find(stage => !stage.closest('#approach'));
  if (treatmentRoute && !treatmentRoute.classList.contains('v8-route-theatre')) {
    treatmentRoute.classList.add('v8-route-theatre');
    const chapters = [...treatmentRoute.querySelectorAll('[data-process-chapter],.process-chapter')];
    const navButtons = [...treatmentRoute.querySelectorAll('.process-nav button')];
    chapters.forEach((chapter,i) => chapter.dataset.v8Step = String(i+1).padStart(2,'0'));
    const head = document.createElement('div');
    head.className = 'v8-route-head';
    head.innerHTML = `<span>Clinical sequence</span><strong>Treatment follows an order.</strong><div class="v8-route-meter" aria-hidden="true"><i></i></div>`;
    treatmentRoute.prepend(head);
    const meter = head.querySelector('i');
    const activate = index => {
      navButtons.forEach((b,i) => b.classList.toggle('is-active',i===index));
      if (meter && chapters.length) meter.style.width = `${((index+1)/chapters.length)*100}%`;
    };
    navButtons.forEach((button,i) => button.addEventListener('click',()=>activate(i)));
    if ('IntersectionObserver' in window && chapters.length) {
      const observer = new IntersectionObserver(entries => {
        const visible = entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
        if (!visible) return;
        activate(chapters.indexOf(visible.target));
      },{rootMargin:'-24% 0px -48% 0px',threshold:[.15,.4,.7]});
      chapters.forEach(c=>observer.observe(c));
    }
    activate(0);
  }

  const treatmentPage = document.body.classList.contains('v7-unified-treatment');
  if (treatmentPage) {
    const darkTarget = document.querySelector('.v7-quick-explorer') || document.querySelector('.v6-compass-section');
    darkTarget?.classList.add('v8-dark-anchor');
  }

  document.querySelectorAll('[data-v8-explorer]').forEach(explorer => {
    const buttons = [...explorer.querySelectorAll('[data-v8-topic]')];
    const title = explorer.querySelector('[data-v8-title]');
    const copy = explorer.querySelector('[data-v8-copy]');
    const note = explorer.querySelector('[data-v8-note]');
    const activate = button => {
      buttons.forEach(b=>b.setAttribute('aria-selected',String(b===button)));
      if (title) title.textContent = button.dataset.title || button.textContent.trim();
      if (copy) copy.textContent = button.dataset.copy || '';
      if (note) note.textContent = button.dataset.note || '';
    };
    buttons.forEach(button=>button.addEventListener('click',()=>activate(button)));
    if (buttons[0]) activate(buttons.find(b=>b.getAttribute('aria-selected')==='true') || buttons[0]);
  });

  /* Premium appointment form keeps the original form's WhatsApp handoff. */
  const bookingForm = document.querySelector('[data-v8-booking-form]');
  if (bookingForm) {
    const dateInput = bookingForm.querySelector('input[type="date"]');
    if (dateInput) dateInput.min = new Date().toISOString().slice(0,10);
    bookingForm.addEventListener('submit', event => {
      event.preventDefault();
      if (!bookingForm.reportValidity()) return;
      const data = new FormData(bookingForm);
      const clean = value => String(value || '').trim();
      const lines = [
        'Hello Aastha Skin Centre, I would like to request an appointment.',
        '',
        `Name: ${clean(data.get('name'))}`,
        `Mobile: ${clean(data.get('mobile'))}`,
        clean(data.get('age')) ? `Age: ${clean(data.get('age'))}` : '',
        clean(data.get('gender')) ? `Gender: ${clean(data.get('gender'))}` : '',
        `Preferred clinic: ${clean(data.get('clinic'))}`,
        `Concern: ${clean(data.get('concern'))}`,
        `Patient type: ${clean(data.get('patient_type'))}`,
        clean(data.get('date')) ? `Preferred date: ${clean(data.get('date'))}` : '',
        `Preferred time: ${clean(data.get('time'))}`,
        clean(data.get('message')) ? `Message: ${clean(data.get('message'))}` : '',
        '',
        'Please confirm the available branch, date and time.'
      ].filter(Boolean);
      window.open(`https://wa.me/917006613362?text=${encodeURIComponent(lines.join('\n'))}`,'_blank','noopener');
    });
  }

  /* Add v8 migrations to Explore. */
  const commandList = document.querySelector('.v3-command-list');
  const destinations = [
    ['HIFU','Focused ultrasound for selected laxity','/concept/hifu-treatment/','hifu ultrasound lifting laxity'],
    ['RF skin tightening','Non-invasive radiofrequency','/concept/rf-skin-tightening/','rf radiofrequency skin tightening'],
    ['Hydrafacial & medifacial','Hydration, congestion and skin quality','/concept/hydrafacial-medifacial/','hydrafacial medifacial hydration facial'],
    ['DPN & seborrheic keratosis','Benign facial and body growths','/concept/dpn-seborrheic-keratosis-removal/','dpn seborrheic keratosis growth removal'],
    ['Lichen planus','Skin, oral, scalp, nail and genital patterns','/concept/lichen-planus-treatment/','lichen planus oral nail scalp'],
    ['Sun damage','Photoageing, spots and texture','/concept/sun-damage-treatment/','sun damage photoageing photodamage'],
    ['Book consultation','Request an appointment','/concept/book-appointment/','book appointment consultation'],
    ['Contact','Call, WhatsApp and clinic directions','/concept/contact/','contact phone whatsapp email']
  ];
  if (commandList) {
    const destinationContainer = commandList.querySelector('.v6-command-group[data-command-group="Treatments & procedures"] .v6-command-grid') || commandList;
    destinations.forEach(([title,desc,href,searchTerms],idx) => {
      if (commandList.querySelector(`a[href="${href}"]`)) return;
      const a = document.createElement('a');
      a.className = 'v3-command-item'; a.href = href; a.dataset.search = `${title} ${desc} ${searchTerms}`;
      a.innerHTML = `<small>${String(40+idx).padStart(2,'0')}</small><div><strong>${title}</strong><small>${desc}</small></div><span>↗</span>`;
      destinationContainer.appendChild(a);
    });
    const search = document.querySelector('.v3-command-head input');
    const runLateSearch = () => {
      const q = (search?.value || '').trim().toLowerCase();
      commandList.querySelectorAll('.v3-command-item').forEach(item => {
        const hay = `${item.dataset.search || ''} ${item.textContent || ''}`.toLowerCase();
        item.hidden = !!q && !hay.includes(q);
      });
      commandList.querySelectorAll('.v6-command-group').forEach(group => {
        group.hidden = ![...group.querySelectorAll('.v3-command-item')].some(i=>!i.hidden);
      });
    };
    search?.addEventListener('input',runLateSearch);
  }

  requestAnimationFrame(rewriteRoutes);
})();
