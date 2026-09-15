(() => {
  const path = location.pathname;

  /* Minimal runtime route safety. Build-time normalization remains authoritative. */
  const premiumRoutes = new Map([
    ['/book-appointment/','/concept/book-appointment/'],
    ['/contact/','/concept/contact/'],
    ['/conditions/','/concept/conditions/'],
    ['/treatments/','/concept/treatments/'],
    ['/dr-cheena-langer/','/concept/dr-cheena-langer/'],
    ['/locations/','/concept/locations/'],
    ['/locations/karan-nagar/','/concept/locations/karan-nagar/'],
    ['/locations/paloura/','/concept/locations/paloura/'],
    ['/blog/','/concept/blog/']
  ]);
  const rewrite = (value) => premiumRoutes.get(value) || value;
  document.querySelectorAll('a[href^="/"]').forEach(a => a.setAttribute('href', rewrite(a.getAttribute('href'))));
  document.querySelectorAll('[data-href^="/"]').forEach(el => el.dataset.href = rewrite(el.dataset.href));
  document.querySelectorAll('[data-result-href^="/"]').forEach(el => el.dataset.resultHref = rewrite(el.dataset.resultHref));

  /* Keep the clean five-step How care works story. */
  document.querySelectorAll('#approach .v6-care-ribbon,#approach .v6-decision-grid').forEach(el => el.remove());
  document.querySelector('#approach .process-stage')?.classList.add('v7-care-stage');
  document.querySelector('#approach .section-head')?.classList.add('v7-care-head');

  const isTreatment = path.startsWith('/concept/') && !/\/concept\/(treatments|conditions|locations|dr-cheena-langer|blog|media|admin|book-appointment|contact)\/?$/.test(path) && path !== '/concept/';
  if (isTreatment) document.body.classList.add('treatment-page','v7-unified-treatment');

  /* Existing page-specific compass may borrow Acne's visual language.
     Do not inject generic pattern modules: each page should earn its interaction. */
  document.querySelectorAll('.v6-compass').forEach(compass => compass.classList.add('pattern-explorer','v7-pattern-system'));

  /* Compact on-page navigation from real authored sections only. */
  if (isTreatment && !document.querySelector('.v7-page-map')) {
    const main = document.querySelector('main');
    const hero = main?.querySelector('.editorial-hero');
    const sections = [...(main?.querySelectorAll('.editorial-section[id]') || [])].filter(s => s.id).slice(0,7);
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

  document.querySelectorAll('.v3-command-item[href^="/"]').forEach(a => a.setAttribute('href', rewrite(a.getAttribute('href'))));
})();
