(() => {
  const body = document.body;
  if (!body || !body.classList.contains('concept-page')) return;

  const routes = new Map([
    ['/treatments/skin-allergy-treatment/','/concept/skin-allergy-treatment/'],
    ['/treatments/keloid-hypertrophic-scar-treatment/','/concept/keloid-hypertrophic-scar-treatment/'],
    ['/treatments/cryolipolysis-body-contouring/','/concept/cryolipolysis-body-contouring/'],
    ['/treatments/skin-abscess-incision-drainage/','/concept/skin-abscess-incision-drainage/'],
    ['/treatments/ingrown-toenail-nail-surgery/','/concept/ingrown-toenail-nail-surgery/'],
    ['/treatments/nail-surgery/','/concept/ingrown-toenail-nail-surgery/']
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
    ['Skin allergy','Itching, eczema, contact reactions and hives','/concept/skin-allergy-treatment/','allergy itch rash eczema contact hives'],
    ['Keloid & raised scars','Raised, itchy, painful or recurrent scars','/concept/keloid-hypertrophic-scar-treatment/','keloid hypertrophic raised scar'],
    ['Cryolipolysis','Selected localised fat contouring','/concept/cryolipolysis-body-contouring/','cryolipolysis fat freezing body contouring'],
    ['Skin abscess','Boils, pus-filled swellings and drainage','/concept/skin-abscess-incision-drainage/','abscess boil incision drainage'],
    ['Ingrown toenail','Painful recurrent nail edges and nail surgery','/concept/ingrown-toenail-nail-surgery/','nail ingrown toenail surgery']
  ];
  const commandList = document.querySelector('.v3-command-list');
  if (commandList) {
    const container = commandList.querySelector('.v6-command-group[data-command-group="Treatments & procedures"] .v6-command-grid') || commandList;
    destinations.forEach(([title,desc,href,searchTerms],i) => {
      if (commandList.querySelector(`a[href="${href}"]`)) return;
      const a = document.createElement('a');
      a.className = 'v3-command-item';
      a.href = href;
      a.dataset.search = `${title} ${desc} ${searchTerms}`.toLowerCase();
      a.innerHTML = `<small>${String(60+i).padStart(2,'0')}</small><div><strong>${title}</strong><small>${desc}</small></div><span>↗</span>`;
      container.appendChild(a);
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
