(() => {
  const body = document.body;
  if (!body || !body.classList.contains('concept-page')) return;

  const routes = new Map([
    ['/treatments/black-neck-acanthosis-nigricans-treatment/','/concept/black-neck-acanthosis-nigricans-treatment/'],
    ['/treatments/chickenpox-scar-treatment/','/concept/chickenpox-scar-treatment/'],
    ['/treatments/corn-removal-treatment/','/concept/corn-removal-treatment/'],
    ['/treatments/cyst-lipoma-removal/','/concept/cyst-lipoma-removal/'],
    ['/treatments/molluscum-contagiosum-treatment/','/concept/molluscum-contagiosum-treatment/'],
    ['/treatments/paediatric-dermatology/','/concept/paediatric-dermatology/'],
    ['/treatments/scabies-treatment/','/concept/scabies-treatment/'],
    ['/treatments/skin-biopsy/','/concept/skin-biopsy/'],
    ['/treatments/skin-cancer-screening/','/concept/skin-cancer-screening/'],
    ['/treatments/sti-std-treatment/','/concept/sti-std-treatment/'],
    ['/treatments/white-hair-removal/','/concept/white-hair-removal/'],
    ['/treatments/xanthelasma-removal/','/concept/xanthelasma-removal/']
  ]);

  const rewrite = value => routes.get(value) || value;
  const rewriteAll = () => {
    document.querySelectorAll('a[href^="/"]').forEach(a => a.setAttribute('href', rewrite(a.getAttribute('href'))));
    document.querySelectorAll('[data-href^="/"]').forEach(el => el.dataset.href = rewrite(el.dataset.href));
    document.querySelectorAll('[data-result-href^="/"]').forEach(el => el.dataset.resultHref = rewrite(el.dataset.resultHref));
  };
  rewriteAll();
  requestAnimationFrame(rewriteAll);

  const destinations = [
    ['Dark neck / acanthosis','Velvety neck or fold pigmentation','/concept/black-neck-acanthosis-nigricans-treatment/','black neck acanthosis insulin resistance pigmentation','pigment'],
    ['Chickenpox scars','Indented or pigmented post-chickenpox marks','/concept/chickenpox-scar-treatment/','chickenpox scars pitted scar resurfacing','scars'],
    ['Corn treatment','Painful pressure lesions of the foot','/concept/corn-removal-treatment/','corn callus plantar wart foot','procedures'],
    ['Cyst & lipoma','Skin lumps, cysts and fatty swellings','/concept/cyst-lipoma-removal/','cyst lipoma lump removal','procedures'],
    ['Molluscum','Contagious dome-shaped viral bumps','/concept/molluscum-contagiosum-treatment/','molluscum viral bumps child','medical'],
    ['Paediatric dermatology','Dermatologist-led child skin care','/concept/paediatric-dermatology/','child baby eczema rash paediatric','medical'],
    ['Scabies','Night itch and household spread','/concept/scabies-treatment/','scabies itch mite family household','medical'],
    ['Skin biopsy','Diagnostic skin sampling','/concept/skin-biopsy/','biopsy punch shave histopathology','procedures'],
    ['Skin cancer screening','Changing moles and suspicious lesions','/concept/skin-cancer-screening/','skin cancer mole melanoma screening','medical'],
    ['STI & genital skin','Confidential STI and genital dermatology assessment','/concept/sti-std-treatment/','sti std genital rash sexual health','medical'],
    ['White & grey hair','Hair-removal planning when laser cannot see pigment','/concept/white-hair-removal/','white grey hair electrolysis laser','hair'],
    ['Xanthelasma','Yellow eyelid plaque assessment and removal','/concept/xanthelasma-removal/','xanthelasma eyelid cholesterol plaque','procedures']
  ];

  /* Make the new pages visible in the actual treatment directory, not only search. */
  const treatmentDirectory = document.querySelector('[data-directory="treatments"]');
  if (treatmentDirectory) {
    destinations.forEach(([title,desc,href,,category]) => {
      if (treatmentDirectory.querySelector(`a[href="${href}"]`)) return;
      const a = document.createElement('a');
      a.dataset.category = category;
      a.href = href;
      a.innerHTML = `<strong>${title}</strong><span>${desc}</span>`;
      treatmentDirectory.appendChild(a);
    });
  }

  /* Improve the concern hub wording and connect newly migrated routes. */
  if (/\/concept\/conditions\/?$/.test(location.pathname)) {
    const sectionHeads = [...document.querySelectorAll('.section-head .display-heading')];
    sectionHeads.forEach(h => {
      if (h.textContent.trim() === 'The original concern directory, made faster to scan.') h.textContent = 'Browse concerns by clinical family.';
    });
    document.querySelectorAll('.section-copy').forEach(p => {
      if (p.textContent.includes('The older website repeatedly makes the same clinical point')) {
        p.textContent = 'Several skin, hair and nail concerns can look similar at first glance. Assessment helps separate the diagnosis before medicines, procedures or lasers are chosen.';
      }
    });

    const atlasButtons = [...document.querySelectorAll('[data-atlas-choice]')];
    atlasButtons.forEach(btn => {
      const title = btn.dataset.title;
      let links = [];
      try { links = JSON.parse(btn.dataset.links || '[]'); } catch (_) {}
      const add = (label, href) => { if (!links.some(item => item[1] === href)) links.push([label, href]); };
      if (title === 'Face') {
        add('Dark neck / acanthosis','/concept/black-neck-acanthosis-nigricans-treatment/');
        add('Xanthelasma','/concept/xanthelasma-removal/');
      }
      if (title === 'Scalp & hair') add('White & grey hair','/concept/white-hair-removal/');
      if (title === 'Body') {
        add('Molluscum','/concept/molluscum-contagiosum-treatment/');
        add('Paediatric dermatology','/concept/paediatric-dermatology/');
      }
      if (title === 'Nails & growths') {
        add('Cyst & lipoma','/concept/cyst-lipoma-removal/');
        add('Corn treatment','/concept/corn-removal-treatment/');
        add('Skin biopsy','/concept/skin-biopsy/');
        add('Skin cancer screening','/concept/skin-cancer-screening/');
      }
      if (title === 'Infections & itching') {
        add('Scabies','/concept/scabies-treatment/');
        add('Molluscum','/concept/molluscum-contagiosum-treatment/');
        add('STI & genital skin','/concept/sti-std-treatment/');
      }
      btn.dataset.links = JSON.stringify(links);
    });
  }

  const commandList = document.querySelector('.v3-command-list');
  if (commandList) {
    const treatmentContainer = commandList.querySelector('.v6-command-group[data-command-group="Treatments & procedures"] .v6-command-grid') || commandList;
    const concernContainer = commandList.querySelector('.v6-command-group[data-command-group="Concerns"] .v6-command-grid') || treatmentContainer;
    destinations.forEach(([title,desc,href,searchTerms],i) => {
      if (commandList.querySelector(`a[href="${href}"]`)) return;
      const a = document.createElement('a');
      a.className = 'v3-command-item';
      a.href = href;
      a.dataset.search = `${title} ${desc} ${searchTerms}`.toLowerCase();
      a.innerHTML = `<small>${String(70+i).padStart(2,'0')}</small><div><strong>${title}</strong><small>${desc}</small></div><span>↗</span>`;
      const medical = ['Dark neck / acanthosis','Molluscum','Paediatric dermatology','Scabies','Skin cancer screening','STI & genital skin'];
      (medical.includes(title) ? concernContainer : treatmentContainer).appendChild(a);
    });

    const search = document.querySelector('.v3-command-head input');
    const refilter = () => {
      const q = (search?.value || '').trim().toLowerCase();
      commandList.querySelectorAll('.v3-command-item').forEach(item => {
        const hay = `${item.dataset.search || ''} ${item.textContent || ''}`.toLowerCase();
        item.hidden = !!q && !hay.includes(q);
      });
      commandList.querySelectorAll('.v6-command-group').forEach(group => {
        group.hidden = ![...group.querySelectorAll('.v3-command-item')].some(i => !i.hidden);
      });
    };
    search?.addEventListener('input', refilter);
  }
})();
