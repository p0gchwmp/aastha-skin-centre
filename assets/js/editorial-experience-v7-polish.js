(() => {
  const additions = [
    ['30','Contact dermatitis','Irritant and allergic exposure-led rashes','/concept/contact-dermatitis-treatment/','Concerns'],
    ['31','Rosacea','Flushing, facial redness, vessels and sensitive skin','/concept/rosacea-treatment/','Concerns'],
    ['32','Freckles & sun spots','Freckles, lentigines and sun-related brown spots','/concept/freckles-treatment/','Concerns'],
    ['33','Dark circles','Pigment, vessels, tear-trough shadow and inflammation','/concept/dark-circles-under-eye-treatment/','Concerns'],
    ['34','Dark lips','Lip pigmentation, barrier damage and contact cheilitis','/concept/dark-lips-treatment/','Concerns'],
    ['35','IPL photofacial','Selected redness, visible vessels and sun spots','/concept/ipl-photofacial/','Treatments & procedures']
  ];

  const list = document.querySelector('.v3-command-list');
  const search = document.querySelector('.v3-command-head input');
  if (list) {
    additions.forEach(([n,title,desc,href,groupName]) => {
      if (list.querySelector(`a[href="${href}"]`)) return;
      const group = [...list.querySelectorAll('.v6-command-group')].find(g => g.dataset.commandGroup === groupName);
      const grid = group?.querySelector('.v6-command-grid') || list;
      const a = document.createElement('a');
      a.className='v3-command-item'; a.href=href; a.dataset.search=`${title} ${desc}`.toLowerCase();
      a.innerHTML=`<small>${n}</small><div><strong>${title}</strong><small>${desc}</small></div><span>↗</span>`;
      grid.appendChild(a);
    });

    const filterAll = () => {
      const q=(search?.value || '').trim().toLowerCase();
      const items=[...list.querySelectorAll('.v3-command-item')];
      let visible=0;
      items.forEach(item=>{
        const hay=`${item.dataset.search || ''} ${item.textContent || ''}`.toLowerCase();
        const show=!q || hay.includes(q); item.hidden=!show; if(show) visible++;
      });
      list.querySelectorAll('.v6-command-group').forEach(group=>{
        group.hidden=![...group.querySelectorAll('.v3-command-item')].some(item=>!item.hidden);
      });
      const count=list.querySelector('[data-v6-result-count]'); if(count) count.textContent=`${visible} ${visible===1?'destination':'destinations'}`;
      list.querySelector('.v6-command-empty')?.classList.toggle('is-visible',visible===0);
    };
    search?.addEventListener('input',filterAll);
    filterAll();
  }

  // Route the existing realistic Face redness choice to the dedicated page.
  const retargetFinder = () => {
    document.querySelectorAll('.v5-concern').forEach(button => {
      const label=(button.textContent || '').trim().toLowerCase();
      if (label.includes('flushing') || label.includes('redness')) button.dataset.resultHref='/concept/rosacea-treatment/';
      if (label.includes('smooth bald')) button.dataset.resultHref='/concept/alopecia-areata-treatment/';
      if (label.includes('flaking') || label.includes('itchy scalp')) button.dataset.resultHref='/concept/seborrheic-dermatitis-dandruff/';
      if (label.includes('wart-like') || label.includes('skin tags')) button.dataset.resultHref='/concept/wart-mole-skin-tag-removal/';
    });
  };
  retargetFinder();
  const grid=document.querySelector('[data-v5-concerns]');
  if(grid && 'MutationObserver' in window) new MutationObserver(retargetFinder).observe(grid,{childList:true,subtree:true});
})();
