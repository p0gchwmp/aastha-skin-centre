(() => {
  const body=document.body;if(!body?.classList.contains('concept-page'))return;
  const path=location.pathname.replace(/\/+$/,'/')||'/';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Make the external image origin cheaper before lower-page images begin loading. */
  if(document.querySelector('.v30-card,.v30-treatment-gallery,.v31-pigment-deck')&&!document.querySelector('link[data-v32-pexels]')){
    const link=document.createElement('link');link.rel='preconnect';link.href='https://images.pexels.com';link.crossOrigin='anonymous';link.dataset.v32Pexels='1';document.head.appendChild(link);
  }

  if(path==='/concept/conditions/'){
    body.classList.add('v32-conditions-clean');
    const oldFamily=document.querySelector('#browse-family');
    if(oldFamily){oldFamily.setAttribute('aria-hidden','true');oldFamily.inert=true;}
  }

  /* Image cards should fail gracefully rather than leaving a broken-image icon. */
  document.querySelectorAll('.v30-card,.v30-treatment-tile').forEach(el=>{
    const img=el.querySelector('img');if(!img)return;
    const fail=()=>{el.classList.add('is-image-failed');img.setAttribute('aria-hidden','true');};
    if(img.complete&&img.naturalWidth===0)fail();else img.addEventListener('error',fail,{once:true});
  });

  /* Pigmentation deck: full keyboard support and predictable selected state. */
  const pigment=document.querySelector('.v31-pigment-deck');
  if(pigment){
    body.classList.add('v32-pigment-clean');
    const tabs=[...pigment.querySelectorAll('[data-v31-state]')];
    tabs.forEach((tab,i)=>tab.addEventListener('keydown',e=>{
      if(!['ArrowRight','ArrowDown','ArrowLeft','ArrowUp','Home','End'].includes(e.key))return;
      e.preventDefault();
      let next=i;
      if(e.key==='ArrowRight'||e.key==='ArrowDown')next=(i+1)%tabs.length;
      if(e.key==='ArrowLeft'||e.key==='ArrowUp')next=(i-1+tabs.length)%tabs.length;
      if(e.key==='Home')next=0;if(e.key==='End')next=tabs.length-1;
      tabs[next].focus();tabs[next].click();
    }));
  }

  /* Treatment image-family controls mirror the text filter state both ways. */
  if(path==='/concept/treatments/'){
    const visual=[...document.querySelectorAll('[data-v30-filter]')];
    const filters=[...document.querySelectorAll('.v3-filter-buttons [data-filter]')];
    const sync=(value)=>visual.forEach(v=>v.setAttribute('aria-pressed',String(v.dataset.v30Filter===value)));
    filters.forEach(btn=>btn.addEventListener('click',()=>sync(btn.dataset.filter)));
    visual.forEach(btn=>btn.addEventListener('keydown',e=>{
      if(!['ArrowRight','ArrowLeft','ArrowDown','ArrowUp'].includes(e.key))return;
      e.preventDefault();const i=visual.indexOf(btn);const step=(e.key==='ArrowLeft'||e.key==='ArrowUp')?-1:1;visual[(i+step+visual.length)%visual.length].focus();
    }));
  }

  /* Keep primary navigation predictable on every page. */
  const nav=document.querySelector('.concept-links');
  if(nav){
    nav.querySelectorAll('a').forEach(a=>a.removeAttribute('aria-current'));
    const current=[...nav.querySelectorAll('a')].find(a=>{
      const href=a.getAttribute('href')||'';
      return href==='/concept/conditions/'&&path==='/concept/conditions/' || href==='/concept/treatments/'&&path==='/concept/treatments/' || href==='/concept/dr-cheena-langer/'&&path==='/concept/dr-cheena-langer/' || href==='/concept/locations/'&&path.startsWith('/concept/locations/');
    });
    current?.setAttribute('aria-current','page');
  }

  /* Small reveal only for loaded photographic cards; no pointer-tracking work. */
  if(!reduced&&'IntersectionObserver'in window){
    const cards=[...document.querySelectorAll('.v30-card,.v30-treatment-tile')];
    const io=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting)return;entry.target.classList.add('is-v32-visible');io.unobserve(entry.target);
    }),{rootMargin:'120px 0px',threshold:.01});cards.forEach((c,i)=>{c.style.setProperty('--v32-delay',`${Math.min(i,5)*28}ms`);io.observe(c);});
  } else document.querySelectorAll('.v30-card,.v30-treatment-tile').forEach(c=>c.classList.add('is-v32-visible'));
})();