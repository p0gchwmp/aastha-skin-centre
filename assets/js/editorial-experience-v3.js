(() => {
  /* Shared marquee only when the earlier concept runtime did not create one. */
  if (!document.querySelector('.marquee-band,.v3-marquee')) {
    const marquee = document.createElement('div');
    marquee.className = 'v3-marquee';
    marquee.setAttribute('aria-label', 'Clinic services');
    const terms = ['Acne','Acne scars','Pigmentation','Hair & scalp','Medical dermatology','Lasers','Aesthetic dermatology','Karan Nagar','Paloura Chowk'];
    const sequence = [...terms, ...terms].map((t) => `<span class="v3-marquee-item">${t}</span>`).join('');
    marquee.innerHTML = `<div class="v3-marquee-track">${sequence}</div>`;
    document.querySelector('.editorial-hero')?.insertAdjacentElement('afterend', marquee);
  }

  /* Explore is provided by the v39 command palette layer. */

  /* Right-side section index is for editorial/utility pages only. Treatment pages
     already have the richer sticky On-this-page map and should not pay for a second observer. */
  if (!document.body.classList.contains('treatment-page') && !document.body.classList.contains('concept-admin')) {
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
        let entries = [];
        try { entries = JSON.parse(btn.dataset.links || '[]'); } catch {}
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
})();
