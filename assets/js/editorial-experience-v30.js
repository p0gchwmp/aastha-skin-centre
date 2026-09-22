(() => {
  const body=document.body;if(!body?.classList.contains('concept-page'))return;
  const path=location.pathname.replace(/\/+$/,'/')||'/';
  const cue=(name)=>`/assets/images/visual-cues/${name}.jpg`;
  const photos={
    acne:cue('acne-care'),
    pigment:cue('pigmentation-care'),
    hair:cue('hair-scalp-care'),
    medical:cue('allergy-inflammatory-rashes'),
    laser:cue('complete-care'),
    procedure:cue('clinical-skin-care'),
    clinic:cue('two-clinic-locations'),
    room:cue('clinic-directions')
  };

  const prepareImg=(img,{src,alt='',pos='50% 50%',eager=false}={})=>{
    if(!img)return;
    img.src=src;img.alt=alt;img.style.objectPosition=pos;img.decoding='async';
    img.loading=eager?'eager':'lazy';img.fetchPriority=eager?'high':'auto';
    if(!img.hasAttribute('width'))img.width=900;if(!img.hasAttribute('height'))img.height=900;
    img.addEventListener('error',()=>img.closest('.v30-card,.v30-treatment-tile,.hero-art')?.classList.add('is-image-failed'),{once:true});
  };
  const setHero=(src,alt,label,pos='50% 50%')=>{
    const img=document.querySelector('.editorial-hero .hero-art img');if(!img)return;
    body.classList.add('v30-image-hubs');prepareImg(img,{src,alt,pos,eager:true});
    const caption=img.closest('.hero-art')?.querySelector('.art-label');if(caption)caption.textContent=label;
  };
  const card=(item,i)=>`<a class="v30-card" data-tone="${item.tone||''}" href="${item.href}"><img src="${item.image}" alt="${item.alt}" style="object-position:${item.pos||'50% 50%'}" loading="${i<3?'eager':'lazy'}" fetchpriority="${i<2?'high':'auto'}" decoding="async" width="900" height="900"><div class="v30-card-copy"><div class="v30-card-index"><span>${String(i+1).padStart(2,'0')} / ${item.eyebrow}</span><span>↗</span></div><h3>${item.title}</h3><p>${item.copy}</p><span class="v30-card-route">Open guide <b>→</b></span></div></a>`;

  const buildConditions=()=>{
    if(path!=='/concept/conditions/')return;
    setHero(photos.procedure,'Dermatologist examining skin in a clinical setting','Real concerns · clear pathways','54% 45%');
    const atlas=document.querySelector('#atlas');if(!atlas||atlas.dataset.v30==='1')return;atlas.dataset.v30='1';body.classList.add('v30-image-atlas');
    const items=[
      {eyebrow:'Acne & scars',title:'Breakouts, marks & scars',copy:'Active acne, post-acne marks and texture concerns.',href:'/concept/acne-treatment/',image:photos.acne,alt:'Close-up of acne-prone natural skin',pos:'50% 42%',tone:'skin'},
      {eyebrow:'Pigmentation',title:'Uneven tone & dark patches',copy:'Melasma, post-inflammatory marks, freckles and other colour changes.',href:'/concept/pigmentation-treatment/',image:photos.pigment,alt:'Macro photograph of natural freckled and pigmented skin',pos:'50% 50%',tone:'skin'},
      {eyebrow:'Hair & scalp',title:'Shedding, thinning & scalp',copy:'Hair fall, patchy loss, dandruff and scalp inflammation.',href:'/concept/hair-fall-treatment/',image:photos.hair,alt:'Close-up showing hair shedding and a hair-loss concern',pos:'52% 48%',tone:'hair'},
      {eyebrow:'Medical dermatology',title:'Itching, rashes & inflammation',copy:'Eczema, allergy, psoriasis, fungal infection and recurring rashes.',href:'/concept/eczema-atopic-dermatitis-treatment/',image:photos.medical,alt:'Visible skin concern on natural skin',pos:'50% 45%',tone:'skin'},
      {eyebrow:'Laser dermatology',title:'Hair, pigment & resurfacing',copy:'Laser pathways depend on the treatment target and skin type.',href:'/concept/laser-hair-reduction/',image:photos.laser,alt:'Dermatology laser treatment in a clinic',pos:'50% 50%',tone:'laser'},
      {eyebrow:'Procedures',title:'Growths, nails & procedures',copy:'Warts, moles, skin tags, cysts, nail concerns and selected minor procedures.',href:'/concept/wart-mole-skin-tag-removal/',image:photos.procedure,alt:'Dermatologist carrying out a skin procedure in clinic',pos:'50% 46%',tone:'clinic'}
    ];
    atlas.innerHTML=`<div class="concept-shell"><div class="v30-gallery-head"><small>01 / Explore by concern</small><div><h2>Start with what feels closest.</h2><p>You do not need to identify the diagnosis yourself. Choose the concern family that best matches why you came here.</p></div></div><div class="v30-concern-grid">${items.map(card).join('')}</div><div class="v30-gallery-foot"><span>Images are illustrative; diagnosis still needs clinical assessment.</span><a href="/concept/book-appointment/">Not sure? Book assessment →</a></div></div>`;
    atlas.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>img.closest('.v30-card')?.classList.add('is-image-failed'),{once:true}));

    const familySection=[...document.querySelectorAll('.editorial-section')].find(s=>s.textContent.includes('Browse by family'));if(familySection)familySection.id='browse-family';
    const map={'Itching, allergy & rashes':'/concept/eczema-atopic-dermatitis-treatment/','Fungal & skin infections':'/concept/fungal-infection-treatment/','Moles, growths & nails':'/concept/wart-mole-skin-tag-removal/'};
    document.querySelectorAll('.v3-reading-card').forEach(el=>{if(el.querySelector('a'))return;const href=map[el.querySelector('h3')?.textContent.trim()];if(!href)return;el.tabIndex=0;el.setAttribute('role','link');el.style.cursor='pointer';const go=()=>location.href=href;el.addEventListener('click',go);el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go();}});});
  };

  const buildTreatments=()=>{
    if(path!=='/concept/treatments/')return;
    setHero(photos.clinic,'Dermatologist treating a patient in a modern clinic','Treatment planning · dermatologist led','52% 46%');
    if(document.querySelector('.v30-treatment-gallery'))return;
    const directory=document.querySelector('#directory');if(!directory)return;
    const items=[
      {key:'medical',label:'Medical dermatology',img:photos.medical,pos:'50% 45%'},
      {key:'scars',label:'Scars & resurfacing',img:photos.acne,pos:'50% 42%'},
      {key:'pigment',label:'Pigmentation & laser',img:photos.pigment,pos:'50% 50%'},
      {key:'hair',label:'Hair & scalp',img:photos.hair,pos:'52% 48%'},
      {key:'aesthetic',label:'Aesthetic dermatology',img:photos.clinic,pos:'50% 48%'},
      {key:'procedures',label:'Minor procedures',img:photos.procedure,pos:'50% 46%'}
    ];
    const section=document.createElement('section');section.className='v30-gallery-section v30-treatment-gallery';
    section.innerHTML=`<div class="concept-shell"><div class="v30-gallery-head"><small>01 / Treatment families</small><div><h2>Choose the kind of care.</h2><p>Use these families to narrow the directory. If you are unsure what treatment you need, start with your concern instead.</p></div></div><div class="v30-treatment-strip">${items.map((it,i)=>`<button class="v30-treatment-tile" type="button" data-v30-filter="${it.key}" aria-pressed="false"><img src="${it.img}" alt="" style="object-position:${it.pos}" loading="${i<3?'eager':'lazy'}" fetchpriority="${i<2?'high':'auto'}" decoding="async" width="900" height="700"><small>${String(i+1).padStart(2,'0')}</small><span>${it.label}</span></button>`).join('')}</div><div class="v30-gallery-foot"><span>Pick a family to filter the directory below.</span><a href="/concept/conditions/">Not sure which treatment? Start with a concern →</a></div></div>`;
    directory.insertAdjacentElement('beforebegin',section);
    section.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>img.closest('.v30-treatment-tile')?.classList.add('is-image-failed'),{once:true}));
    section.querySelectorAll('[data-v30-filter]').forEach(btn=>btn.addEventListener('click',()=>{const key=btn.dataset.v30Filter;const filter=document.querySelector(`.v3-filter-buttons button[data-filter="${key}"]`);filter?.click();section.querySelectorAll('[data-v30-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));directory.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'start'});}));
  };

  buildConditions();buildTreatments();
})();