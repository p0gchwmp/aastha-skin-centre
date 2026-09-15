(() => {
  const body=document.body;if(!body?.classList.contains('concept-page'))return;
  const path=location.pathname.replace(/\/+$/,'/')||'/';
  const slug=path.split('/').filter(Boolean).pop()||'home';
  const safe=v=>(v||'').replace(/\s+/g,' ').trim();
  const title=safe(document.querySelector('.editorial-hero h1,.hero-title,h1')?.textContent)||slug.replace(/-/g,' ');
  const trailKey='aastha-v28-trail';

  const loadTrail=()=>{try{return JSON.parse(sessionStorage.getItem(trailKey)||'[]')}catch(e){return[]}};
  const saveTrail=items=>{try{sessionStorage.setItem(trailKey,JSON.stringify(items.slice(0,5)))}catch(e){}};
  const isDetail=()=>path.startsWith('/concept/')&&!['/concept/','/concept/treatments/','/concept/conditions/','/concept/blog/','/concept/media/','/concept/book-appointment/','/concept/contact/'].includes(path)&&!path.startsWith('/concept/admin/');

  if(isDetail()){
    const items=loadTrail().filter(x=>x&&x.path!==path);
    items.unshift({path,title,slug});
    saveTrail(items);
  }

  const enrichDrawer=()=>{
    const drawer=document.querySelector('.v26-drawer-panel');if(!drawer)return;
    const items=loadTrail().filter(x=>x.path!==path).slice(0,3);if(!items.length)return;
    const trail=document.createElement('div');trail.className='v28-trail';
    trail.innerHTML=`<div class="v28-trail-head"><small>Recently explored</small><button type="button" data-v28-clear>Clear</button></div><div class="v28-trail-list">${items.map((x,i)=>`<a class="v28-trail-item" href="${x.path}"><small>${String(i+1).padStart(2,'0')} / This session</small><strong>${x.title}</strong><span>Return to guide ↗</span></a>`).join('')}</div>`;
    drawer.append(trail);
    trail.querySelector('[data-v28-clear]')?.addEventListener('click',()=>{saveTrail([]);trail.remove();});
  };

  const improveBooking=()=>{
    if(path!=='/concept/book-appointment/')return;
    const params=new URLSearchParams(location.search);
    const incoming=safe(params.get('context'));
    const from=safe(params.get('from'));
    if(!incoming)return;
    const form=document.querySelector('[data-v8-booking-form]');if(!form)return;
    const existing=form.querySelector('.v26-booking-context');
    const handoff=document.createElement('div');handoff.className='v28-booking-handoff';
    const backHref=from?`/concept/${from}/`:'/concept/conditions/';
    handoff.innerHTML=`<div><small>Context carried forward</small><strong>${incoming}</strong><p>You can edit the form normally. This context is only used to make the appointment request clearer for reception.</p></div><a href="${backHref}">Back to guide ←</a>`;
    if(existing)existing.insertAdjacentElement('afterend',handoff);else form.prepend(handoff);
    const message=form.querySelector('textarea[name="message"]');
    if(message&&!safe(message.value))message.value=`I am booking after reading about: ${incoming}.`;
  };

  const upgradeHair=()=>{
    const range=document.querySelector('.v25-range');if(!range)return;
    const labels=[...document.querySelectorAll('.v25-range-labels span')];
    const stage=document.querySelector('.v25-hair-stage');
    if(stage&&!stage.querySelector('.v27-scanline')){const line=document.createElement('i');line.className='v27-scanline';stage.append(line);}
    const paint=()=>{const i=Number(range.value);labels.forEach((l,n)=>l.classList.toggle('is-active',n===i));stage?.style.setProperty('--scan-y',`${28+i*15}%`);};
    labels.forEach((label,i)=>{label.setAttribute('role','button');label.tabIndex=0;const set=()=>{range.value=i;range.dispatchEvent(new Event('input',{bubbles:true}));paint();};label.addEventListener('click',set);label.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();set();}});});
    range.addEventListener('input',paint);paint();
  };

  const upgradePigment=()=>{
    const svg=document.querySelector('.v25-face');if(!svg||svg.querySelector('[data-v27-pig-hit]'))return;
    const NS='http://www.w3.org/2000/svg';
    const hits=[
      ['piH',145,270,'Post-inflammatory'],['melasma',210,205,'Melasma'],['spots',285,245,'Spots'],['depig',255,330,'White patches']
    ];
    hits.forEach(([key,cx,cy,label])=>{
      const hit=document.createElementNS(NS,'circle');hit.setAttribute('cx',cx);hit.setAttribute('cy',cy);hit.setAttribute('r','28');hit.dataset.v27PigHit=key;hit.setAttribute('tabindex','0');hit.setAttribute('aria-label',label);svg.append(hit);
      const dot=document.createElementNS(NS,'circle');dot.setAttribute('cx',cx);dot.setAttribute('cy',cy);dot.setAttribute('r','4');dot.classList.add('v27-map-dot');dot.dataset.map=key;svg.append(dot);
      const text=document.createElementNS(NS,'text');text.setAttribute('x',Number(cx)+10);text.setAttribute('y',Number(cy)-10);text.classList.add('v27-map-label');text.textContent=label;svg.append(text);
    });
    const activate=key=>document.querySelector(`.v25-pigment-tabs button[data-mode="${key}"]`)?.click();
    svg.addEventListener('click',e=>{const hit=e.target.closest('[data-v27-pig-hit]');if(hit)activate(hit.dataset.v27PigHit)});
    svg.addEventListener('keydown',e=>{const hit=e.target.closest('[data-v27-pig-hit]');if(hit&&(e.key==='Enter'||e.key===' ')){e.preventDefault();activate(hit.dataset.v27PigHit)}});
  };

  const upgradeMedical=()=>{
    const flow=document.querySelector('.v25-flow');if(!flow)return;
    flow.addEventListener('click',()=>{requestAnimationFrame(()=>{[...flow.querySelectorAll('.v25-flow-step')].forEach(step=>step.classList.toggle('is-complete',!!step.querySelector('[aria-pressed="true"]')));});});
  };

  const upgradeAesthetic=()=>{
    const matrix=document.querySelector('.v25-matrix');if(!matrix)return;
    const quads=[...matrix.querySelectorAll('.v25-quadrant')];
    const pos=[[25,25],[75,25],[25,75],[75,75]];
    const paint=()=>{const idx=Math.max(0,quads.findIndex(q=>q.getAttribute('aria-pressed')==='true'));matrix.style.setProperty('--v27-x',`${pos[idx][0]}%`);matrix.style.setProperty('--v27-y',`${pos[idx][1]}%`);};
    quads.forEach(q=>q.addEventListener('click',()=>requestAnimationFrame(paint)));paint();
  };

  const upgradeLaser=()=>{
    const spectrum=document.querySelector('.v25-spectrum');if(!spectrum)return;
    const nodes=[...spectrum.querySelectorAll('.v25-spectrum-node')];
    const paint=()=>{const idx=Math.max(0,nodes.findIndex(n=>n.getAttribute('aria-pressed')==='true'));const pct=nodes.length<2?0:(idx/(nodes.length-1))*100;spectrum.style.setProperty('--v27-laser-x',`${pct}%`);};
    nodes.forEach((node,i)=>{node.addEventListener('click',()=>requestAnimationFrame(paint));node.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const d=e.key==='ArrowRight'?1:-1;const next=(i+d+nodes.length)%nodes.length;nodes[next].focus();nodes[next].click();}});});paint();
  };

  const ready=()=>{enrichDrawer();improveBooking();upgradeHair();upgradePigment();upgradeMedical();upgradeAesthetic();upgradeLaser();};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();
