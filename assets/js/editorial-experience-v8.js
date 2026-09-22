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

  /* Legacy dossier plates were useful during prototyping but now duplicate the
     newer authored-media system and create visual collisions. Keep v8 focused
     on route theatre, booking and route integration only. */
  document.querySelectorAll('.v8-clinical-plate').forEach(el => el.remove());

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
      },{rootMargin:'-24% 0px -48% 0px',threshold:[.15,.4]});
      chapters.forEach(c=>observer.observe(c));
    }
    activate(0);
  }

  const treatmentPage = document.body.classList.contains('v7-unified-treatment');
  if (treatmentPage) {
    document.querySelector('.v7-quick-explorer')?.classList.add('v8-dark-anchor');
    document.querySelectorAll('.v6-compass-section').forEach(section => section.classList.remove('v8-dark-anchor'));
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
