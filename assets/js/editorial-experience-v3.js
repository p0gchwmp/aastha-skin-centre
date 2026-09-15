(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Shared marquee if a page does not already have one. */
  if (!document.querySelector('.v3-marquee')) {
    const marquee = document.createElement('div');
    marquee.className = 'v3-marquee';
    marquee.setAttribute('aria-label', 'Clinic services');
    const terms = ['Acne','Acne scars','Pigmentation','Hair & scalp','Medical dermatology','Lasers','Aesthetic dermatology','Karan Nagar','Paloura Chowk'];
    const sequence = [...terms, ...terms].map((t) => `<span class="v3-marquee-item">${t}</span>`).join('');
    marquee.innerHTML = `<div class="v3-marquee-track">${sequence}</div>`;
    const hero = document.querySelector('.editorial-hero');
    if (hero) hero.insertAdjacentElement('afterend', marquee);
  }

  /* Command palette / site explorer. */
  const destinations = [
    ['01','Home','Homepage','/concept/'],
    ['02','Treatments','Treatment directory','/concept/treatments/'],
    ['03','Conditions','Browse by concern','/concept/conditions/'],
    ['04','Dr. Cheena Langer','Consultant dermatologist','/concept/dr-cheena-langer/'],
    ['05','Acne','Acne guide','/concept/acne-treatment/'],
    ['06','Pigmentation','Melasma, marks and uneven tone','/concept/pigmentation-treatment/'],
    ['07','Hair fall','Shedding, thinning and scalp assessment','/concept/hair-fall-treatment/'],
    ['08','Laser hair reduction','Unwanted facial and body hair','/concept/laser-hair-reduction/'],
    ['09','Book consultation','Appointment request','/concept/book-appointment/'],
  ];
  const palette = document.createElement('div');
  palette.className = 'v3-command';
  palette.setAttribute('aria-hidden', 'true');
  palette.innerHTML = `<div class="v3-command-panel" role="dialog" aria-modal="true" aria-label="Explore Aastha"><div class="v3-command-head"><input type="search" placeholder="Search treatments, concerns, doctor…" aria-label="Search site"><button class="v3-command-close" type="button">Close</button></div><div class="v3-command-list">${destinations.map(([n,t,d,h]) => `<a class="v3-command-item" href="${h}" data-search="${(t+' '+d).toLowerCase()}"><small>${n}</small><div><strong>${t}</strong><small>${d}</small></div><span>↗</span></a>`).join('')}</div></div>`;
  document.body.appendChild(palette);
  const input = palette.querySelector('input');
  const items = [...palette.querySelectorAll('.v3-command-item')];
  const closePalette = () => { palette.classList.remove('is-open'); palette.setAttribute('aria-hidden','true'); document.body.style.overflow=''; };
  const openPalette = () => { palette.classList.add('is-open'); palette.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; requestAnimationFrame(() => input.focus()); };
  palette.querySelector('.v3-command-close').addEventListener('click', closePalette);
  palette.addEventListener('click', (e) => { if (e.target === palette) closePalette(); });
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    items.forEach((item) => item.hidden = !!q && !item.dataset.search.includes(q));
  });
  addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); palette.classList.contains('is-open') ? closePalette() : openPalette(); }
    if (e.key === 'Escape') closePalette();
  });
  const nav = document.querySelector('.concept-nav .concept-shell');
  if (nav && !nav.querySelector('.v3-explore-toggle')) {
    const toggle = document.createElement('button');
    toggle.className='v3-explore-toggle'; toggle.type='button'; toggle.textContent='Explore'; toggle.addEventListener('click', openPalette);
    const cta = nav.querySelector('.nav-cta');
    if (cta) cta.insertAdjacentElement('beforebegin', toggle); else nav.appendChild(toggle);
  }

  /* No artificial page-transition interception. Native navigation is faster and more reliable. */

  /* Right-side section index. */
  const sections = [...document.querySelectorAll('main > section[id], main > section.editorial-section')].filter((s, i) => i < 9);
  if (sections.length > 2) {
    const index = document.createElement('nav'); index.className='v3-side-index'; index.setAttribute('aria-label','Page sections');
    sections.forEach((section, i) => {
      if (!section.id) section.id = `section-${i+1}`;
      const label = section.querySelector('.section-no,.kicker,h2')?.textContent?.trim().replace(/\s+/g,' ').slice(0,36) || `Section ${i+1}`;
      index.insertAdjacentHTML('beforeend', `<a href="#${section.id}" aria-label="${label.replace(/"/g,'&quot;')}"></a>`);
    });
    document.body.appendChild(index);
    if ('IntersectionObserver' in window) {
      const links = [...index.querySelectorAll('a')];
      const observer = new IntersectionObserver((entries) => {
        const active = entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
        if (!active) return;
        links.forEach(a=>a.classList.toggle('is-active', a.getAttribute('href') === `#${active.target.id}`));
      }, {rootMargin:'-30% 0px -55% 0px', threshold:[.01,.25]});
      sections.forEach(s=>observer.observe(s));
    }
  }

  /* Floating quick-actions bar. */
  if (!document.querySelector('.v3-quickbar')) {
    const q = document.createElement('nav'); q.className='v3-quickbar'; q.setAttribute('aria-label','Quick actions');
    q.innerHTML='<a href="/concept/book-appointment/">Book</a><a href="https://wa.me/917006613362">WhatsApp</a><a href="tel:+917006613362">Call</a>';
    document.body.appendChild(q);
  }

  /* Directory filter interaction. */
  document.querySelectorAll('[data-directory]').forEach((directory) => {
    const controls = [...document.querySelectorAll(`[data-directory-control="${directory.dataset.directory}"]`)].flatMap(c=>[...c.querySelectorAll('[data-filter]')]);
    const links = [...directory.querySelectorAll('[data-category]')];
    controls.forEach(btn => btn.addEventListener('click', () => {
      controls.forEach(b=>b.setAttribute('aria-pressed', String(b===btn)));
      const filter = btn.dataset.filter;
      links.forEach(link => link.hidden = filter !== 'all' && link.dataset.category !== filter);
    }));
  });

  /* Generic atlas interaction. */
  document.querySelectorAll('[data-atlas]').forEach((atlas) => {
    const buttons = [...atlas.querySelectorAll('[data-atlas-choice]')];
    const title = atlas.querySelector('[data-atlas-title]');
    const copy = atlas.querySelector('[data-atlas-copy]');
    const links = atlas.querySelector('[data-atlas-links]');
    const activate = (btn) => {
      buttons.forEach(b=>b.setAttribute('aria-selected', String(b===btn)));
      if(title) title.textContent = btn.dataset.title || '';
      if(copy) copy.textContent = btn.dataset.copy || '';
      if(links) {
        const entries = JSON.parse(btn.dataset.links || '[]');
        links.innerHTML = entries.map(([label,href]) => `<a href="${href}">${label}</a>`).join('');
      }
    };
    buttons.forEach(btn => { btn.addEventListener('click',()=>activate(btn)); btn.addEventListener('mouseenter',()=>{if(matchMedia('(hover:hover)').matches) activate(btn);}); });
  });

  /* Educational choice matrix. */
  document.querySelectorAll('[data-choice-matrix]').forEach((matrix) => {
    const choices=[...matrix.querySelectorAll('[data-choice]')];
    const title=matrix.querySelector('[data-choice-result-title]');
    const copy=matrix.querySelector('[data-choice-result-copy]');
    const activate=(choice)=>{
      choices.forEach(c=>c.setAttribute('aria-selected',String(c===choice)));
      if(title) title.textContent=choice.dataset.title||'';
      if(copy) copy.textContent=choice.dataset.copy||'';
    };
    choices.forEach(c=>c.addEventListener('click',()=>activate(c)));
  });

  /* Scroll stories. */
  document.querySelectorAll('.v3-split-story').forEach((story) => {
    const steps=[...story.querySelectorAll('.v3-story-step')];
    if (!steps.length || !('IntersectionObserver' in window)) return;
    const title=story.querySelector('[data-story-title]');
    const copy=story.querySelector('[data-story-copy]');
    const obs=new IntersectionObserver((entries)=>{
      const active=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
      if(!active)return;
      steps.forEach(s=>s.classList.toggle('is-active',s===active.target));
      if(title) title.textContent=active.target.dataset.title||'';
      if(copy) copy.textContent=active.target.dataset.copy||'';
    },{rootMargin:'-26% 0px -42% 0px',threshold:[.15,.5]});
    steps.forEach(s=>obs.observe(s));
  });

  /* Count-up stats once. */
  if (!reduced && 'IntersectionObserver' in window) {
    const counters=[...document.querySelectorAll('[data-count]')];
    const obs=new IntersectionObserver((entries)=>entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      const el=entry.target,target=Number(el.dataset.count||0),suffix=el.dataset.suffix||''; let start=null;
      const tick=(t)=>{if(!start)start=t;const p=Math.min(1,(t-start)/650);el.textContent=`${Math.round(target*(1-Math.pow(1-p,3)))}${suffix}`;if(p<1)requestAnimationFrame(tick)};requestAnimationFrame(tick);obs.unobserve(el);
    }),{threshold:.4});
    counters.forEach(c=>obs.observe(c));
  }
})();
